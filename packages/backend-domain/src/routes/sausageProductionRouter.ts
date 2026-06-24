import { Router, Request, Response, NextFunction } from 'express';
import { SausageStockService } from '../services/SausageStockService';
import { SausageProductionService } from '../services/SausageProductionService';
import { SausageSalesService } from '../services/SausageSalesService';
import { SausageQualityService } from '../services/SausageQualityService';
import { SausageDocumentService } from '../services/SausageDocumentService';
import { SausageAuditService } from '../services/SausageAuditService';

export function createSausageProductionRouter(
  stockService: SausageStockService,
  productionService: SausageProductionService,
  salesService: SausageSalesService,
  qualityService: SausageQualityService,
  documentService: SausageDocumentService,
  auditService: SausageAuditService
): Router {
  const router = Router();

  const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
    (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };

  router.get('/dashboard', asyncHandler(async (req, res) => {
    const rawMaterials = await stockService.getRawMaterials();
    const finishedProducts = await stockService.getFinishedProducts();
    const orders = await productionService.getOrders();
    const losses = await stockService.getLosses();
    const totalRawWarehouse = rawMaterials.reduce((sum, item) => sum + item.warehouseQty, 0);
    const totalRawWorkshop = rawMaterials.reduce((sum, item) => sum + item.workshopQty, 0);
    const totalFinished = finishedProducts.reduce((sum, item) => sum + item.stockQty, 0);
    const totalLosses = losses.reduce((sum, item) => sum + item.quantityQty, 0);

    res.json({
      metrics: [
        { id: 'raw-warehouse', label: 'Сырье на складе', value: String(totalRawWarehouse), unit: 'кг', tone: 'accent' },
        { id: 'raw-workshop', label: 'Сырье в цехе', value: String(totalRawWorkshop), unit: 'кг', tone: 'warning' },
        { id: 'finished', label: 'Готовая продукция', value: String(totalFinished), unit: 'кг', tone: 'success' },
        { id: 'losses', label: 'Потери', value: String(totalLosses), unit: 'кг', tone: 'danger' }
      ],
      activeOrders: orders.filter(order => order.status === 'IN_PROGRESS' || order.status === 'WAITING_MATERIALS' || order.status === 'PLANNED'),
      criticalRawStock: rawMaterials.filter(item => item.status === 'LOW' || item.status === 'CRITICAL'),
      hourlyOutput: [
        { hour: '08', valueQty: 120 },
        { hour: '09', valueQty: 180 },
        { hour: '10', valueQty: 240 },
        { hour: '11', valueQty: 210 }
      ],
      recentEvents: [
        { id: 'event-1', text: 'Demo API: данные загружены из backend-domain', meta: new Date().toISOString(), tone: 'info' }
      ],
      finishedProducts,
      losses
    });
  }));

  // Raw Materials
  router.get('/raw-materials', asyncHandler(async (req, res) => {
    const data = await stockService.getRawMaterials();
    res.json(data);
  }));

  router.post('/raw-materials', asyncHandler(async (req, res) => {
    res.status(201).json({}); // Stub
  }));

  router.post('/raw-materials/:id/receipt', asyncHandler(async (req, res) => {
    await stockService.receiveRawMaterial(req.params.id, req.body);
    res.status(200).json({});
  }));

  router.post('/raw-materials/:id/transfer-to-workshop', asyncHandler(async (req, res) => {
    await stockService.transferToWorkshop(req.params.id, req.body);
    res.status(200).json({});
  }));

  // Finished Products
  router.get('/finished-products', asyncHandler(async (req, res) => {
    res.json(await stockService.getFinishedProducts());
  }));
  
  router.post('/finished-products', asyncHandler(async (req, res) => {
    res.status(201).json({});
  }));

  // Recipes
  router.get('/recipes', asyncHandler(async (req, res) => {
    res.json(await productionService.getRecipes());
  }));

  router.post('/recipes', asyncHandler(async (req, res) => {
    res.status(201).json({});
  }));

  router.put('/recipes/:id', asyncHandler(async (req, res) => {
    res.status(200).json({});
  }));

  // Clients
  router.get('/clients', asyncHandler(async (req, res) => {
    res.json(await productionService.getClients());
  }));

  router.post('/clients', asyncHandler(async (req, res) => {
    res.status(201).json({});
  }));

  // Orders
  router.get('/orders', asyncHandler(async (req, res) => {
    const data = await productionService.getOrders();
    res.json(data);
  }));

  router.post('/orders', asyncHandler(async (req, res) => {
    const order = await productionService.createOrder(req.body);
    res.status(201).json(order);
  }));

  router.post('/orders/:id/start', asyncHandler(async (req, res) => {
    await productionService.startOrder(req.params.id, req.body);
    res.status(200).json({});
  }));

  router.post('/orders/:id/cancel', asyncHandler(async (req, res) => {
    res.status(200).json({});
  }));

  router.post('/orders/:id/ship', asyncHandler(async (req, res) => {
    res.status(200).json({});
  }));

  // Batches
  router.get('/batches', asyncHandler(async (req, res) => {
    res.json(await productionService.getBatches());
  }));

  router.post('/batches/release', asyncHandler(async (req, res) => {
    const batch = await productionService.releaseBatch(req.body);
    res.status(200).json(batch);
  }));

  router.post('/batches/:id/quality-check', asyncHandler(async (req, res) => {
    const qc = await qualityService.checkQuality(req.params.id, req.body);
    res.status(201).json(qc);
  }));

  router.post('/batches/:id/accept', asyncHandler(async (req, res) => {
    const batch = await qualityService.acceptBatch(req.params.id, req.body);
    res.status(200).json(batch);
  }));

  router.post('/batches/:id/reject', asyncHandler(async (req, res) => {
    const batch = await qualityService.rejectBatch(req.params.id, req.body);
    res.status(200).json(batch);
  }));

  router.post('/batches/:id/reopen-quality', asyncHandler(async (req, res) => {
    const batch = await qualityService.reopenQuality(req.params.id);
    res.status(200).json(batch);
  }));

  // Quality Checks
  router.get('/quality-checks', asyncHandler(async (req, res) => {
    res.json(await qualityService.getQualityChecks());
  }));

  router.get('/quality-checks/:id', asyncHandler(async (req, res) => {
    const qualityCheck = await qualityService.getQualityCheckById(req.params.id);
    if (!qualityCheck) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Not found' } });
      return;
    }
    res.json(qualityCheck);
  }));

  // Stock Movements
  router.get('/stock-movements', asyncHandler(async (req, res) => {
    res.json(await stockService.getStockMovements());
  }));

  router.post('/stock/write-off', asyncHandler(async (req, res) => {
    await stockService.writeOffStock(req.body);
    res.status(200).json({});
  }));

  router.post('/stock/adjustment', asyncHandler(async (req, res) => {
    res.status(200).json({});
  }));

  // Losses
  router.get('/losses', asyncHandler(async (req, res) => {
    res.json(await stockService.getLosses());
  }));

  router.post('/losses/:id/approve', asyncHandler(async (req, res) => {
    const loss = await qualityService.approveLoss(req.params.id, req.body);
    res.status(200).json(loss);
  }));

  router.get('/loss-categories', asyncHandler(async (req, res) => {
    res.json(qualityService.getLossCategories());
  }));

  // Analytics
  router.get('/analytics/summary', asyncHandler(async (req, res) => {
    const batches = await productionService.getBatches();
    const losses = await stockService.getLosses();
    res.json({
      totalProducedQty: batches.reduce((sum, batch) => sum + batch.producedQty, 0),
      totalAcceptedQty: batches.reduce((sum, batch) => sum + batch.acceptedQty, 0),
      totalLossQty: losses.reduce((sum, loss) => sum + loss.quantityQty, 0)
    });
  }));

  router.get('/analytics/quality-summary', asyncHandler(async (req, res) => {
    res.json(await qualityService.getQualitySummary());
  }));

  router.get('/analytics/loss-summary', asyncHandler(async (req, res) => {
    res.json(await qualityService.getLossSummary());
  }));

  // Sales Orders
  router.get('/sales-orders', asyncHandler(async (req, res) => {
    res.json(await salesService.getSalesOrders());
  }));

  router.get('/sales-orders/:id', asyncHandler(async (req, res) => {
    const order = await salesService.getSalesOrderById(req.params.id);
    if (!order) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Not found' } });
      return;
    }
    res.json(order);
  }));

  router.post('/sales-orders', asyncHandler(async (req, res) => {
    const order = await salesService.createSalesOrder(req.body);
    res.status(201).json(order);
  }));

  router.post('/sales-orders/:id/confirm', asyncHandler(async (req, res) => {
    const order = await salesService.confirmSalesOrder(req.params.id);
    res.json(order);
  }));

  router.post('/sales-orders/:id/cancel', asyncHandler(async (req, res) => {
    const order = await salesService.cancelSalesOrder(req.params.id);
    res.json(order);
  }));

  // Reservations
  router.post('/sales-orders/:id/reserve', asyncHandler(async (req, res) => {
    const reservation = await salesService.reserveSalesOrderItem(
      req.params.id,
      req.body.salesOrderItemId,
      req.body
    );
    res.status(201).json(reservation);
  }));

  router.post('/reservations/:id/release', asyncHandler(async (req, res) => {
    const reservation = await salesService.releaseReservation(req.params.id, req.body.reason);
    res.json(reservation);
  }));

  router.post('/reservations/:id/complete', asyncHandler(async (req, res) => {
    const reservation = await salesService.completeReservation(req.params.id);
    res.json(reservation);
  }));

  router.get('/reservations', asyncHandler(async (req, res) => {
    res.json(await salesService.getReservations());
  }));

  // Production Demand
  router.get('/production-demand', asyncHandler(async (req, res) => {
    res.json(await salesService.getProductionDemand());
  }));

  router.post('/production-demand/create-production-order', asyncHandler(async (req, res) => {
    await salesService.createProductionOrderFromDemand(req.body);
    res.status(201).json({});
  }));

  // Documents
  router.get('/documents', asyncHandler(async (req, res) => {
    res.json(await documentService.getDocuments(req.query));
  }));

  router.post('/documents/raw-receipt', asyncHandler(async (req, res) => {
    const doc = await documentService.createRawReceiptDocument(req.body);
    res.status(201).json(doc);
  }));

  router.post('/documents/raw-transfer', asyncHandler(async (req, res) => {
    const doc = await documentService.createRawTransferDocument(req.body);
    res.status(201).json(doc);
  }));

  router.post('/documents/write-off', asyncHandler(async (req, res) => {
    const doc = await documentService.createWriteOffDocument(req.body);
    res.status(201).json(doc);
  }));

  router.post('/documents/stock-adjustment', asyncHandler(async (req, res) => {
    const doc = await documentService.createStockAdjustmentDocument(req.body);
    res.status(201).json(doc);
  }));

  router.post('/documents/production-batch-act', asyncHandler(async (req, res) => {
    const doc = await documentService.createProductionBatchAct(req.body);
    res.status(201).json(doc);
  }));

  router.post('/documents/quality-check-act', asyncHandler(async (req, res) => {
    const doc = await documentService.createQualityCheckAct(req.body);
    res.status(201).json(doc);
  }));

  router.get('/documents/:id', asyncHandler(async (req, res) => {
    const doc = await documentService.getDocumentById(req.params.id);
    if (!doc) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Not found' } });
      return;
    }
    res.json(doc);
  }));

  router.get('/documents/:id/print-view', asyncHandler(async (req, res) => {
    res.json(await documentService.getDocumentPrintView(req.params.id));
  }));

  router.post('/documents', asyncHandler(async (req, res) => {
    const doc = await documentService.createDocument(req.body);
    res.status(201).json(doc);
  }));

  router.post('/documents/:id/post', asyncHandler(async (req, res) => {
    const doc = await documentService.postDocument(req.params.id, req.body);
    res.json(doc);
  }));

  router.post('/documents/:id/cancel', asyncHandler(async (req, res) => {
    const doc = await documentService.cancelDocument(req.params.id, req.body);
    res.json(doc);
  }));

  // Audit Logs
  router.get('/audit-log', asyncHandler(async (req, res) => {
    res.json(await auditService.getAuditLogs(req.query));
  }));

  router.get('/audit-log/entity/:entityKind/:entityId', asyncHandler(async (req, res) => {
    res.json(await auditService.getAuditLogsForEntity(req.params.entityKind as any, req.params.entityId));
  }));

  return router;
}

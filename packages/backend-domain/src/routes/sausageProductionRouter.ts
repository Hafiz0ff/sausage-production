import { Router, Request, Response, NextFunction } from 'express';
import { SausageStockService } from '../services/SausageStockService';
import { SausageProductionService } from '../services/SausageProductionService';

export function createSausageProductionRouter(
  stockService: SausageStockService,
  productionService: SausageProductionService
): Router {
  const router = Router();

  const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
    (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };

  // Dashboard stub
  router.get('/dashboard', asyncHandler(async (req, res) => {
    res.json({
      metrics: [],
      activeOrders: [],
      criticalRawStock: [],
      hourlyOutput: [],
      recentEvents: [],
      finishedProducts: [],
      losses: []
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
    res.json([]);
  }));
  
  router.post('/finished-products', asyncHandler(async (req, res) => {
    res.status(201).json({});
  }));

  // Recipes
  router.get('/recipes', asyncHandler(async (req, res) => {
    res.json([]);
  }));

  router.post('/recipes', asyncHandler(async (req, res) => {
    res.status(201).json({});
  }));

  router.put('/recipes/:id', asyncHandler(async (req, res) => {
    res.status(200).json({});
  }));

  // Clients
  router.get('/clients', asyncHandler(async (req, res) => {
    res.json([]);
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
    res.json([]);
  }));

  router.post('/batches/release', asyncHandler(async (req, res) => {
    const batch = await productionService.releaseBatch(req.body);
    res.status(200).json(batch);
  }));

  // Stock Movements
  router.get('/stock-movements', asyncHandler(async (req, res) => {
    res.json([]);
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
    res.json([]);
  }));

  // Analytics
  router.get('/analytics/summary', asyncHandler(async (req, res) => {
    res.json({});
  }));

  return router;
}

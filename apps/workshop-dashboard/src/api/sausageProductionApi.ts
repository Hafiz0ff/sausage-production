import { mockSausageProductionData } from '../data/mockSausageProductionData';
import type { ModalKind, WorkshopDataset, ProductionOrder, RawMaterial, FinishedProduct, Client, Recipe, ProductionBatch, StockMovement, LossRecord, DashboardSnapshot, OrderStatus, StockStatus, MovementType, LossReason, StatusTone, KpiMetric } from '../domain/types';
import { SausageApiClient } from 'sausage-api-client';

export const SAUSAGE_PRODUCTION_API_NAMESPACE = (import.meta as any).env.VITE_SAUSAGE_API_BASE_URL || '/api/sausage-production';

export type SausageProductionEndpoint =
  | '/dashboard'
  | '/orders'
  | '/batches'
  | '/movements'
  | '/raw-materials'
  | '/finished-products'
  | '/recipes'
  | '/clients'
  | '/losses';

export function buildSausageProductionUrl(endpoint: SausageProductionEndpoint): string {
  return `${SAUSAGE_PRODUCTION_API_NAMESPACE}${endpoint}`;
}

export interface ApiActionResult {
  ok: true;
  message: string;
  kind: ModalKind;
}

const delay = (ms = 40) => new Promise((resolve) => window.setTimeout(resolve, ms));

const apiClient = new SausageApiClient(SAUSAGE_PRODUCTION_API_NAMESPACE);

export const sausageProductionApi = {
  async getDataset(): Promise<WorkshopDataset> {
    const isReal = (import.meta as any).env.VITE_SAUSAGE_API_MODE === 'real';

    if (!isReal) {
      await delay();
      return structuredClone(mockSausageProductionData);
    }

    const [
      dashboardDto,
      rawMaterialsDto,
      finishedProductsDto,
      recipesDto,
      clientsDto,
      ordersDto,
      batchesDto,
      movementsDto,
      lossesDto
    ] = await Promise.all([
      apiClient.getDashboard(),
      apiClient.getRawMaterials(),
      apiClient.getFinishedProducts(),
      apiClient.getRecipes(),
      apiClient.getClients(),
      apiClient.getOrders(),
      apiClient.getBatches(),
      apiClient.getStockMovements(),
      apiClient.getLosses()
    ]);

    const dashboard: DashboardSnapshot = {
      metrics: dashboardDto.metrics.map(m => ({
        id: m.id,
        label: m.label,
        value: m.value,
        unit: m.unit || '',
        delta: m.delta || '',
        tone: m.tone as StatusTone
      })),
      quickActions: [
        { id: 'receipt', label: 'Приемка', description: 'Поступление сырья на склад' },
        { id: 'transfer', label: 'Передача в цех', description: 'Перемещение со склада в производство' },
        { id: 'release', label: 'Выпуск продукции', description: 'Регистрация готовой продукции' }
      ],
      activeOrders: ordersDto.map(o => ({
        id: o.id,
        number: o.number,
        productName: o.finishedProductName,
        quantityKg: o.quantityQty,
        clientName: o.clientName || 'Demo Client',
        status: o.status as OrderStatus,
        progress: o.progressPercent,
        dueAt: o.dueAt || new Date().toISOString().slice(11, 16),
        shift: o.shift || 'Утро'
      })),
      criticalRawStock: dashboardDto.criticalRawStock.map(r => ({
        id: r.id,
        name: r.name,
        group: r.group,
        warehouseKg: r.warehouseQty,
        workshopKg: r.workshopQty,
        reservedKg: r.reservedQty,
        minKg: r.minQty,
        status: r.status as StockStatus,
        supplier: r.supplierName || 'Demo Supplier'
      })),
      hourlyOutput: dashboardDto.hourlyOutput.map(h => ({
        hour: h.hour,
        valueKg: h.valueQty
      })),
      events: dashboardDto.recentEvents.map(e => ({
        id: e.id,
        text: e.text,
        meta: e.meta,
        tone: e.tone as StatusTone
      })),
      finishedProducts: finishedProductsDto.map(f => ({
        id: f.id,
        name: f.name,
        sku: f.sku,
        stockKg: f.stockQty,
        stockPcs: f.stockPcs || 0,
        reservedKg: f.reservedQty,
        shelfLifeDays: f.shelfLifeDays || 0,
        status: f.status as StockStatus
      })),
      losses: lossesDto.map(l => ({
        id: l.id,
        docNo: l.docNo,
        itemName: l.itemName,
        reason: l.reason as LossReason,
        quantityKg: l.quantityQty,
        cost: l.costAmount?.toString() || '0',
        createdAt: l.createdAt,
        operator: l.createdByUserId
      }))
    };

    return {
      rawMaterials: rawMaterialsDto.map(r => ({
        id: r.id,
        name: r.name,
        group: r.group,
        warehouseKg: r.warehouseQty,
        workshopKg: r.workshopQty,
        reservedKg: r.reservedQty,
        minKg: r.minQty,
        status: r.status as StockStatus,
        supplier: r.supplierName || 'Demo Supplier'
      })),
      finishedProducts: finishedProductsDto.map(f => ({
        id: f.id,
        name: f.name,
        sku: f.sku,
        stockKg: f.stockQty,
        stockPcs: f.stockPcs || 0,
        reservedKg: f.reservedQty,
        shelfLifeDays: f.shelfLifeDays || 0,
        status: f.status as StockStatus
      })),
      clients: clientsDto.map(c => ({
        id: c.id,
        name: c.name,
        segment: c.segment,
        phone: c.phone || '',
        balance: c.balanceAmount?.toString() || '0',
        lastOrder: c.lastOrderAt || ''
      })),
      recipes: recipesDto.map(r => ({
        id: r.id,
        productName: r.finishedProductName,
        outputKg: r.outputQty,
        expectedYieldPercent: r.expectedYieldPercent,
        items: r.items.map(i => ({
          materialId: i.rawMaterialId,
          materialName: i.rawMaterialName,
          quantityKg: i.quantityQty
        }))
      })),
      orders: ordersDto.map(o => ({
        id: o.id,
        number: o.number,
        productName: o.finishedProductName,
        quantityKg: o.quantityQty,
        clientName: o.clientName || 'Demo Client',
        status: o.status as OrderStatus,
        progress: o.progressPercent,
        dueAt: o.dueAt || new Date().toISOString().slice(11, 16),
        shift: o.shift || 'Утро'
      })),
      batches: batchesDto.map(b => ({
        id: b.id,
        batchNo: b.batchNo,
        orderNo: b.productionOrderNumber,
        productName: b.finishedProductName,
        producedKg: b.producedQty,
        acceptedKg: b.acceptedQty,
        rejectedKg: b.rejectedQty,
        releasedAt: b.releasedAt,
        yieldPercent: b.yieldPercent
      })),
      movements: movementsDto.map(m => ({
        id: m.id,
        docNo: m.docNo,
        type: m.type as MovementType,
        itemName: m.itemName,
        quantityKg: m.quantityQty,
        from: m.fromLocation,
        to: m.toLocation,
        operator: m.createdByUserId,
        createdAt: m.createdAt
      })),
      losses: lossesDto.map(l => ({
        id: l.id,
        docNo: l.docNo,
        itemName: l.itemName,
        reason: l.reason as LossReason,
        quantityKg: l.quantityQty,
        cost: l.costAmount?.toString() || '0',
        createdAt: l.createdAt,
        operator: l.createdByUserId
      })),
      dashboard
    };
  },

  async submitAction(kind: ModalKind): Promise<ApiActionResult> {
    const isReal = (import.meta as any).env.VITE_SAUSAGE_API_MODE === 'real';

    if (!isReal) {
      await delay();
      return {
        ok: true,
        kind,
        message: 'Операция сохранена в mock API',
      };
    }

    try {
      if (kind === 'receipt') {
        await apiClient.receiveRawMaterial('raw-1', {
          rawMaterialId: 'raw-1',
          quantityQty: 50,
          supplierName: 'sup-1',
          externalDocumentNo: 'DOC-123'
        });
      } else if (kind === 'transfer') {
        await apiClient.transferRawToWorkshop('raw-1', {
          rawMaterialId: 'raw-1',
          quantityQty: 10
        });
      } else if (kind === 'order') {
        const order = await apiClient.createOrder({
          finishedProductId: 'prod-1',
          quantityQty: 100,
          clientId: 'client-1'
        });
        await apiClient.startOrder(order.id, {
          productionOrderId: order.id
        });
      } else if (kind === 'release') {
        await apiClient.releaseBatch({
          productionOrderId: 'ord-1',
          producedQty: 100,
          acceptedQty: 95,
          rejectedQty: 5,
          lossReason: 'TRIMMING'
        });
      } else if (kind === 'writeOff') {
        await apiClient.writeOffStock({
          itemKind: 'RAW_MATERIAL',
          itemId: 'raw-1',
          location: 'WORKSHOP',
          quantityQty: 2,
          reason: 'TRIMMING'
        });
      }

      return {
        ok: true,
        kind,
        message: 'Операция успешно выполнена через real API',
      };
    } catch (err: any) {
      throw err;
    }
  },
};

import { 
  SausageDashboardDto,
  SausageRawMaterialDto,
  CreateSausageRawMaterialInput,
  ReceiveSausageRawMaterialInput,
  TransferSausageRawToWorkshopInput,
  SausageFinishedProductDto,
  SausageRecipeDto,
  SausageClientDto,
  SausageProductionOrderDto,
  CreateSausageProductionOrderInput,
  StartSausageProductionOrderInput,
  SausageProductionBatchDto,
  ReleaseSausageProductionBatchInput,
  SausageStockMovementDto,
  WriteOffSausageStockInput,
  SausageLossDto,
  CreateSausageQualityCheckInput,
  SausageQualityCheckDto,
  AcceptSausageBatchInput,
  RejectSausageBatchInput,
  ApproveSausageLossInput,
  SausageQualitySummaryDto,
  SausageLossSummaryDto
} from 'sausage-shared-types';

export const SAUSAGE_API_NAMESPACE = '/api/sausage-production';

export class SausageApiClient {
  constructor(private baseUrl: string = SAUSAGE_API_NAMESPACE) {
    if (baseUrl.startsWith('/api/production')) {
      throw new Error('Forbidden sausage-production API namespace: /api/production');
    }
  }

  private async fetch<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw err;
    }
    
    return response.json();
  }

  // Dashboard
  getDashboard(): Promise<SausageDashboardDto> {
    return this.fetch<SausageDashboardDto>('/dashboard');
  }

  // Raw Materials
  getRawMaterials(): Promise<SausageRawMaterialDto[]> {
    return this.fetch<SausageRawMaterialDto[]>('/raw-materials');
  }
  
  createRawMaterial(input: CreateSausageRawMaterialInput): Promise<SausageRawMaterialDto> {
    return this.fetch<SausageRawMaterialDto>('/raw-materials', { method: 'POST', body: JSON.stringify(input) });
  }

  receiveRawMaterial(id: string, input: ReceiveSausageRawMaterialInput): Promise<void> {
    return this.fetch<void>(`/raw-materials/${id}/receipt`, { method: 'POST', body: JSON.stringify(input) });
  }

  transferRawToWorkshop(id: string, input: TransferSausageRawToWorkshopInput): Promise<void> {
    return this.fetch<void>(`/raw-materials/${id}/transfer-to-workshop`, { method: 'POST', body: JSON.stringify(input) });
  }

  // Finished Products
  getFinishedProducts(): Promise<SausageFinishedProductDto[]> {
    return this.fetch<SausageFinishedProductDto[]>('/finished-products');
  }

  // Recipes
  getRecipes(): Promise<SausageRecipeDto[]> {
    return this.fetch<SausageRecipeDto[]>('/recipes');
  }

  // Clients
  getClients(): Promise<SausageClientDto[]> {
    return this.fetch<SausageClientDto[]>('/clients');
  }

  // Orders
  getOrders(): Promise<SausageProductionOrderDto[]> {
    return this.fetch<SausageProductionOrderDto[]>('/orders');
  }

  createOrder(input: CreateSausageProductionOrderInput): Promise<SausageProductionOrderDto> {
    return this.fetch<SausageProductionOrderDto>('/orders', { method: 'POST', body: JSON.stringify(input) });
  }

  startOrder(id: string, input: StartSausageProductionOrderInput): Promise<void> {
    return this.fetch<void>(`/orders/${id}/start`, { method: 'POST', body: JSON.stringify(input) });
  }

  // Batches
  getBatches(): Promise<SausageProductionBatchDto[]> {
    return this.fetch<SausageProductionBatchDto[]>('/batches');
  }

  releaseBatch(input: ReleaseSausageProductionBatchInput): Promise<SausageProductionBatchDto> {
    return this.fetch<SausageProductionBatchDto>('/batches/release', { method: 'POST', body: JSON.stringify(input) });
  }

  checkQuality(id: string, input: CreateSausageQualityCheckInput): Promise<SausageQualityCheckDto> {
    return this.fetch<SausageQualityCheckDto>(`/batches/${id}/quality-check`, { method: 'POST', body: JSON.stringify(input) });
  }

  acceptBatch(id: string, input: AcceptSausageBatchInput): Promise<SausageProductionBatchDto> {
    return this.fetch<SausageProductionBatchDto>(`/batches/${id}/accept`, { method: 'POST', body: JSON.stringify(input) });
  }

  rejectBatch(id: string, input: RejectSausageBatchInput): Promise<SausageProductionBatchDto> {
    return this.fetch<SausageProductionBatchDto>(`/batches/${id}/reject`, { method: 'POST', body: JSON.stringify(input) });
  }

  reopenBatchQuality(id: string): Promise<SausageProductionBatchDto> {
    return this.fetch<SausageProductionBatchDto>(`/batches/${id}/reopen-quality`, { method: 'POST' });
  }

  getQualityChecks(): Promise<SausageQualityCheckDto[]> {
    return this.fetch<SausageQualityCheckDto[]>('/quality-checks');
  }

  getQualityCheckById(id: string): Promise<SausageQualityCheckDto> {
    return this.fetch<SausageQualityCheckDto>(`/quality-checks/${id}`);
  }

  // Stock Movements & Losses
  getStockMovements(): Promise<SausageStockMovementDto[]> {
    return this.fetch<SausageStockMovementDto[]>('/stock-movements');
  }

  writeOffStock(input: WriteOffSausageStockInput): Promise<void> {
    return this.fetch<void>('/stock/write-off', { method: 'POST', body: JSON.stringify(input) });
  }

  getLosses(): Promise<SausageLossDto[]> {
    return this.fetch<SausageLossDto[]>('/losses');
  }

  approveLoss(id: string, input: ApproveSausageLossInput): Promise<SausageLossDto> {
    return this.fetch<SausageLossDto>(`/losses/${id}/approve`, { method: 'POST', body: JSON.stringify(input) });
  }

  getLossCategories(): Promise<{ categories: string[]; stages: string[]; reasons: string[] }> {
    return this.fetch<{ categories: string[]; stages: string[]; reasons: string[] }>('/loss-categories');
  }

  // Sales Orders
  getSalesOrders(): Promise<import('sausage-shared-types').SausageSalesOrderDto[]> {
    return this.fetch<import('sausage-shared-types').SausageSalesOrderDto[]>('/sales-orders');
  }

  getSalesOrderById(id: string): Promise<import('sausage-shared-types').SausageSalesOrderDto> {
    return this.fetch<import('sausage-shared-types').SausageSalesOrderDto>(`/sales-orders/${id}`);
  }

  createSalesOrder(input: import('sausage-shared-types').CreateSausageSalesOrderInput): Promise<import('sausage-shared-types').SausageSalesOrderDto> {
    return this.fetch<import('sausage-shared-types').SausageSalesOrderDto>('/sales-orders', { method: 'POST', body: JSON.stringify(input) });
  }

  confirmSalesOrder(id: string): Promise<import('sausage-shared-types').SausageSalesOrderDto> {
    return this.fetch<import('sausage-shared-types').SausageSalesOrderDto>(`/sales-orders/${id}/confirm`, { method: 'POST' });
  }

  cancelSalesOrder(id: string): Promise<import('sausage-shared-types').SausageSalesOrderDto> {
    return this.fetch<import('sausage-shared-types').SausageSalesOrderDto>(`/sales-orders/${id}/cancel`, { method: 'POST' });
  }

  // Reservations
  reserveSalesOrderItem(id: string, input: import('sausage-shared-types').CreateSausageReservationInput & { salesOrderItemId: string }): Promise<import('sausage-shared-types').SausageFinishedGoodsReservationDto> {
    return this.fetch<import('sausage-shared-types').SausageFinishedGoodsReservationDto>(`/sales-orders/${id}/reserve`, { method: 'POST', body: JSON.stringify(input) });
  }

  releaseReservation(id: string, reason?: string): Promise<import('sausage-shared-types').SausageFinishedGoodsReservationDto> {
    return this.fetch<import('sausage-shared-types').SausageFinishedGoodsReservationDto>(`/reservations/${id}/release`, { method: 'POST', body: JSON.stringify({ reason }) });
  }

  completeReservation(id: string): Promise<import('sausage-shared-types').SausageFinishedGoodsReservationDto> {
    return this.fetch<import('sausage-shared-types').SausageFinishedGoodsReservationDto>(`/reservations/${id}/complete`, { method: 'POST' });
  }

  getReservations(): Promise<import('sausage-shared-types').SausageFinishedGoodsReservationDto[]> {
    return this.fetch<import('sausage-shared-types').SausageFinishedGoodsReservationDto[]>('/reservations');
  }

  // Production Demand
  getProductionDemand(): Promise<import('sausage-shared-types').SausageProductionDemandDto[]> {
    return this.fetch<import('sausage-shared-types').SausageProductionDemandDto[]>('/production-demand');
  }

  createProductionOrderFromDemand(input: import('sausage-shared-types').CreateProductionOrderFromDemandInput): Promise<void> {
    return this.fetch<void>('/production-demand/create-production-order', { method: 'POST', body: JSON.stringify(input) });
  }

  // Analytics
  getQualitySummary(): Promise<SausageQualitySummaryDto> {
    return this.fetch<SausageQualitySummaryDto>('/analytics/quality-summary');
  }

  getLossSummary(): Promise<SausageLossSummaryDto> {
    return this.fetch<SausageLossSummaryDto>('/analytics/loss-summary');
  }
  // Documents
  getDocuments(filter?: import('sausage-shared-types').SausageDocumentFilterDto): Promise<import('sausage-shared-types').SausageDocumentDto[]> {
    const qs = new URLSearchParams(filter as any).toString();
    return this.fetch<import('sausage-shared-types').SausageDocumentDto[]>(`/documents${qs ? '?' + qs : ''}`);
  }

  getDocumentById(id: string): Promise<import('sausage-shared-types').SausageDocumentDto> {
    return this.fetch<import('sausage-shared-types').SausageDocumentDto>(`/documents/${id}`);
  }

  createDocument(input: import('sausage-shared-types').CreateSausageDocumentInput): Promise<import('sausage-shared-types').SausageDocumentDto> {
    return this.fetch<import('sausage-shared-types').SausageDocumentDto>('/documents', { method: 'POST', body: JSON.stringify(input) });
  }

  postDocument(id: string, input: import('sausage-shared-types').PostSausageDocumentInput): Promise<import('sausage-shared-types').SausageDocumentDto> {
    return this.fetch<import('sausage-shared-types').SausageDocumentDto>(`/documents/${id}/post`, { method: 'POST', body: JSON.stringify(input) });
  }

  cancelDocument(id: string, input: import('sausage-shared-types').CancelSausageDocumentInput): Promise<import('sausage-shared-types').SausageDocumentDto> {
    return this.fetch<import('sausage-shared-types').SausageDocumentDto>(`/documents/${id}/cancel`, { method: 'POST', body: JSON.stringify(input) });
  }

  getDocumentPrintView(id: string): Promise<import('sausage-shared-types').SausageDocumentPrintViewDto> {
    return this.fetch<import('sausage-shared-types').SausageDocumentPrintViewDto>(`/documents/${id}/print-view`);
  }

  createRawReceiptDocument(input: import('sausage-shared-types').CreateRawReceiptDocumentInput): Promise<import('sausage-shared-types').SausageDocumentDto> {
    return this.fetch<import('sausage-shared-types').SausageDocumentDto>('/documents/raw-receipt', { method: 'POST', body: JSON.stringify(input) });
  }

  createRawTransferDocument(input: import('sausage-shared-types').CreateRawTransferDocumentInput): Promise<import('sausage-shared-types').SausageDocumentDto> {
    return this.fetch<import('sausage-shared-types').SausageDocumentDto>('/documents/raw-transfer', { method: 'POST', body: JSON.stringify(input) });
  }

  createWriteOffDocument(input: import('sausage-shared-types').CreateWriteOffDocumentInput): Promise<import('sausage-shared-types').SausageDocumentDto> {
    return this.fetch<import('sausage-shared-types').SausageDocumentDto>('/documents/write-off', { method: 'POST', body: JSON.stringify(input) });
  }

  createStockAdjustmentDocument(input: import('sausage-shared-types').CreateStockAdjustmentDocumentInput): Promise<import('sausage-shared-types').SausageDocumentDto> {
    return this.fetch<import('sausage-shared-types').SausageDocumentDto>('/documents/stock-adjustment', { method: 'POST', body: JSON.stringify(input) });
  }

  createProductionBatchAct(input: import('sausage-shared-types').CreateProductionBatchActInput): Promise<import('sausage-shared-types').SausageDocumentDto> {
    return this.fetch<import('sausage-shared-types').SausageDocumentDto>('/documents/production-batch-act', { method: 'POST', body: JSON.stringify(input) });
  }

  createQualityCheckAct(input: import('sausage-shared-types').CreateQualityCheckActInput): Promise<import('sausage-shared-types').SausageDocumentDto> {
    return this.fetch<import('sausage-shared-types').SausageDocumentDto>('/documents/quality-check-act', { method: 'POST', body: JSON.stringify(input) });
  }

  // Audit Logs
  getAuditLogs(filter?: import('sausage-shared-types').SausageAuditLogFilterDto): Promise<import('sausage-shared-types').SausageAuditLogDto[]> {
    const qs = new URLSearchParams(filter as any).toString();
    return this.fetch<import('sausage-shared-types').SausageAuditLogDto[]>(`/audit-log${qs ? '?' + qs : ''}`);
  }

  getAuditLogsForEntity(entityKind: import('sausage-shared-types').SausageAuditEntityKind, entityId: string): Promise<import('sausage-shared-types').SausageAuditLogDto[]> {
    return this.fetch<import('sausage-shared-types').SausageAuditLogDto[]>(`/audit-log/entity/${entityKind}/${entityId}`);
  }
}

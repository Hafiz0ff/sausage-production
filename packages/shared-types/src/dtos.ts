import { 
  SausageStockLocation, SausageStockStatus, SausageProductionOrderStatus, SausageMovementType, SausageLossReason,
  SausageSalesOrderStatus, SausageReservationStatus, SausageBatchStatus, SausageQualityStatus, SausageLossCategory, SausageLossStage 
} from './domain-enums';

export interface SausageRawMaterialDto {
  id: string;
  companyId: string;
  name: string;
  group: string;
  unit: 'kg' | 'pcs' | 'pack';
  warehouseQty: number;
  workshopQty: number;
  reservedQty: number;
  minQty: number;
  status: SausageStockStatus;
  supplierName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SausageFinishedProductDto {
  id: string;
  companyId: string;
  name: string;
  sku: string;
  unit: 'kg' | 'pcs' | 'pack';
  stockQty: number;
  stockPcs?: number;
  reservedQty: number;
  shelfLifeDays?: number;
  status: SausageStockStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SausageRecipeDto {
  id: string;
  companyId: string;
  finishedProductId: string;
  finishedProductName: string;
  outputQty: number;
  expectedYieldPercent: number;
  items: SausageRecipeItemDto[];
  createdAt: string;
  updatedAt: string;
}

export interface SausageRecipeItemDto {
  id: string;
  rawMaterialId: string;
  rawMaterialName: string;
  quantityQty: number;
}

export interface SausageClientDto {
  id: string;
  companyId: string;
  name: string;
  segment: 'RETAIL' | 'WHOLESALE' | 'HORECA' | 'INTERNAL' | 'OTHER';
  phone?: string;
  externalClientId?: string;
  balanceAmount?: number;
  balanceCurrency?: 'TJS' | 'USD';
  lastOrderAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SausageProductionOrderDto {
  id: string;
  companyId: string;
  number: string;
  finishedProductId: string;
  finishedProductName: string;
  quantityQty: number;
  clientId?: string;
  clientName?: string;
  status: SausageProductionOrderStatus;
  progressPercent: number;
  dueAt?: string;
  shift?: string;
  externalOrderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SausageProductionBatchDto {
  id: string;
  companyId: string;
  batchNo: string;
  productionOrderId: string;
  productionOrderNumber: string;
  finishedProductId: string;
  finishedProductName: string;
  producedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  yieldPercent: number;
  status: SausageBatchStatus;
  qualityStatus: SausageQualityStatus;
  plannedQty?: number;
  varianceQty?: number;
  variancePercent?: number;
  masterUserId?: string;
  masterName?: string;
  operatorUserId?: string;
  operatorName?: string;
  qualityCheckedByUserId?: string;
  qualityCheckedByName?: string;
  qualityCheckedAt?: string;
  qualityNote?: string;
  releasedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SausageStockMovementDto {
  id: string;
  companyId: string;
  docNo: string;
  type: SausageMovementType;
  itemKind: 'RAW_MATERIAL' | 'FINISHED_PRODUCT';
  itemId: string;
  itemName: string;
  quantityQty: number;
  fromLocation: SausageStockLocation;
  toLocation: SausageStockLocation;
  productionOrderId?: string;
  productionBatchId?: string;
  reason?: string;
  createdByUserId: string;
  createdByName?: string;
  createdAt: string;
}

export interface SausageLossDto {
  id: string;
  companyId: string;
  docNo: string;
  itemKind: 'RAW_MATERIAL' | 'FINISHED_PRODUCT';
  itemId: string;
  itemName: string;
  reason: SausageLossReason;
  category?: SausageLossCategory;
  stage?: SausageLossStage;
  quantityQty: number;
  costAmount?: number;
  costCurrency?: 'TJS' | 'USD';
  productionOrderId?: string;
  productionBatchId?: string;
  isRecoverable?: boolean;
  approvedByUserId?: string;
  approvedByName?: string;
  approvedAt?: string;
  createdByUserId: string;
  createdByName?: string;
  createdAt: string;
}

// Commands
export interface CreateSausageRawMaterialInput {
  name: string;
  group: string;
  unit: 'kg' | 'pcs' | 'pack';
  minQty: number;
  supplierName?: string;
}

export interface ReceiveSausageRawMaterialInput {
  rawMaterialId: string;
  quantityQty: number;
  supplierName?: string;
  externalDocumentNo?: string;
  note?: string;
}

export interface TransferSausageRawToWorkshopInput {
  rawMaterialId: string;
  quantityQty: number;
  productionOrderId?: string;
  note?: string;
}

export interface CreateSausageProductionOrderInput {
  finishedProductId: string;
  quantityQty: number;
  clientId?: string;
  clientName?: string;
  dueAt?: string;
  shift?: string;
  externalOrderId?: string;
}

export interface StartSausageProductionOrderInput {
  productionOrderId: string;
}

export interface ReleaseSausageProductionBatchInput {
  productionOrderId: string;
  producedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  lossReason?: SausageLossReason;
  lossCategory?: SausageLossCategory;
  lossStage?: SausageLossStage;
  note?: string;
}

export interface WriteOffSausageStockInput {
  itemKind: 'RAW_MATERIAL' | 'FINISHED_PRODUCT';
  itemId: string;
  location: SausageStockLocation;
  quantityQty: number;
  reason: SausageLossReason;
  note?: string;
}

export interface SausageDashboardDto {
  metrics: Array<{
    id: string;
    label: string;
    value: string;
    unit?: string;
    delta?: string;
    tone: 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  }>;
  activeOrders: SausageProductionOrderDto[];
  criticalRawStock: SausageRawMaterialDto[];
  hourlyOutput: Array<{ hour: string; valueQty: number }>;
  recentEvents: Array<{
    id: string;
    text: string;
    meta: string;
    tone: 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  }>;
  finishedProducts: SausageFinishedProductDto[];
  losses: SausageLossDto[];
}

export interface SausageSalesOrderDto {
  id: string;
  companyId: string;
  number: string;
  clientId?: string;
  clientName?: string;
  externalOrderId?: string;
  status: SausageSalesOrderStatus;
  requestedDate?: string;
  dueDate?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
  items: SausageSalesOrderItemDto[];
}

export interface SausageSalesOrderItemDto {
  id: string;
  companyId: string;
  salesOrderId: string;
  finishedProductId: string;
  finishedProductName: string;
  quantityQty: number;
  reservedQty: number;
  producedQty: number;
  shippedQty: number;
  shortageQty: number;
  createdAt: string;
  updatedAt: string;
}

export interface SausageFinishedGoodsReservationDto {
  id: string;
  companyId: string;
  salesOrderId: string;
  salesOrderItemId: string;
  finishedProductId: string;
  finishedProductName: string;
  quantityQty: number;
  status: SausageReservationStatus;
  createdByUserId: string;
  createdByName?: string;
  createdAt: string;
  releasedAt?: string;
  completedAt?: string;
  reason?: string;
}

export interface SausageProductionDemandDto {
  finishedProductId: string;
  finishedProductName: string;
  requiredQty: number;
  availableQty: number;
  reservedQty: number;
  shortageQty: number;
  suggestedProductionQty: number;
  linkedProductionOrders: string[];
}

export interface CreateSausageSalesOrderInput {
  clientId?: string;
  clientName?: string;
  externalOrderId?: string;
  requestedDate?: string;
  dueDate?: string;
  note?: string;
  items: Array<{
    finishedProductId: string;
    quantityQty: number;
  }>;
}

export interface CreateSausageReservationInput {
  quantityQty: number;
  allowPartial?: boolean;
}

export interface CreateProductionOrderFromDemandInput {
  finishedProductId: string;
  quantityQty: number;
  salesOrderId?: string;
  salesOrderItemId?: string;
  dueAt?: string;
  note?: string;
}

export interface SausageQualityCheckDto {
  id: string;
  companyId: string;
  productionBatchId: string;
  productionOrderId?: string;
  batchNo?: string;
  finishedProductId?: string;
  finishedProductName?: string;
  checkedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  qualityStatus: SausageQualityStatus;
  temperatureCelsius?: number;
  humidityPercent?: number;
  sampleWeightQty?: number;
  note?: string;
  checkedByUserId: string;
  checkedByName?: string;
  checkedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSausageQualityCheckInput {
  checkedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  temperatureCelsius?: number;
  humidityPercent?: number;
  sampleWeightQty?: number;
  note?: string;
}

export interface AcceptSausageBatchInput {
  note?: string;
}

export interface RejectSausageBatchInput {
  note?: string;
}

export interface ApproveSausageLossInput {
  note?: string;
}

export interface SausageQualitySummaryDto {
  totalBatches: number;
  acceptedBatches: number;
  rejectedBatches: number;
  partialBatches: number;
  totalProducedQty: number;
  totalAcceptedQty: number;
  totalRejectedQty: number;
  averageYieldPercent: number;
  averageVariancePercent: number;
}

export interface SausageLossSummaryDto {
  totalLossQty: number;
  lossQtyByCategory: Record<string, number>;
  lossQtyByStage: Record<string, number>;
  lossQtyByReason: Record<string, number>;
  approvedLossCount: number;
  unapprovedLossCount: number;
}

export interface SausageDocumentDto {
  id: string;
  companyId: string;
  type: import('./domain-enums').SausageDocumentType;
  number: string;
  status: import('./domain-enums').SausageDocumentStatus;
  title?: string;
  sourceEntityKind?: string;
  sourceEntityId?: string;
  externalDocumentId?: string;
  relatedOrderId?: string;
  relatedBatchId?: string;
  clientId?: string;
  clientName?: string;
  totalQty: number;
  totalAmount: number;
  currency?: string;
  note?: string;
  createdByUserId: string;
  createdByName?: string;
  postedByUserId?: string;
  postedByName?: string;
  postedAt?: string;
  cancelledByUserId?: string;
  cancelledByName?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
  lines?: SausageDocumentLineDto[];
}

export interface SausageDocumentLineDto {
  id: string;
  companyId: string;
  documentId: string;
  lineNo: number;
  itemKind: import('./domain-enums').SausageDocumentItemKind;
  itemId: string;
  itemName: string;
  quantityQty: number;
  unit: string;
  fromLocation?: import('./domain-enums').SausageStockLocation;
  toLocation?: import('./domain-enums').SausageStockLocation;
  priceAmount?: number;
  costAmount?: number;
  currency?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SausageAuditLogDto {
  id: string;
  companyId: string;
  action: import('./domain-enums').SausageAuditAction;
  entityKind: import('./domain-enums').SausageAuditEntityKind;
  entityId: string;
  documentId?: string;
  userId: string;
  userName?: string;
  beforeJson?: any;
  afterJson?: any;
  metadataJson?: any;
  createdAt: string;
}

export interface CreateSausageDocumentInput {
  type: import('./domain-enums').SausageDocumentType;
  title?: string;
  sourceEntityKind?: string;
  sourceEntityId?: string;
  externalDocumentId?: string;
  relatedOrderId?: string;
  relatedBatchId?: string;
  clientId?: string;
  clientName?: string;
  currency?: string;
  note?: string;
  lines: Array<{
    itemKind: import('./domain-enums').SausageDocumentItemKind;
    itemId: string;
    itemName: string;
    quantityQty: number;
    unit: string;
    fromLocation?: import('./domain-enums').SausageStockLocation;
    toLocation?: import('./domain-enums').SausageStockLocation;
    priceAmount?: number;
    costAmount?: number;
    currency?: string;
    note?: string;
  }>;
}

export interface PostSausageDocumentInput {
  note?: string;
}

export interface CancelSausageDocumentInput {
  note?: string;
}

export interface CreateRawReceiptDocumentInput {
  supplierName?: string;
  externalDocumentNo?: string;
  note?: string;
  lines: Array<{
    rawMaterialId: string;
    quantityQty: number;
  }>;
}

export interface CreateRawTransferDocumentInput {
  productionOrderId?: string;
  note?: string;
  lines: Array<{
    rawMaterialId: string;
    quantityQty: number;
  }>;
}

export interface CreateWriteOffDocumentInput {
  note?: string;
  lines: Array<{
    itemKind: 'RAW_MATERIAL' | 'FINISHED_PRODUCT';
    itemId: string;
    quantityQty: number;
    reason: import('./domain-enums').SausageLossReason;
    fromLocation: import('./domain-enums').SausageStockLocation;
  }>;
}

export interface CreateStockAdjustmentDocumentInput {
  note?: string;
  lines: Array<{
    itemKind: 'RAW_MATERIAL' | 'FINISHED_PRODUCT';
    itemId: string;
    quantityQty: number;
    location: import('./domain-enums').SausageStockLocation;
  }>;
}

export interface CreateProductionBatchActInput {
  productionOrderId: string;
  producedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  note?: string;
}

export interface CreateQualityCheckActInput {
  productionBatchId: string;
  checkedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  temperatureCelsius?: number;
  humidityPercent?: number;
  note?: string;
}

export interface SausageDocumentPrintViewDto {
  html: string;
}

export interface SausageDocumentFilterDto {
  type?: import('./domain-enums').SausageDocumentType;
  status?: import('./domain-enums').SausageDocumentStatus;
  limit?: number;
  offset?: number;
}

export interface SausageAuditLogFilterDto {
  action?: import('./domain-enums').SausageAuditAction;
  entityKind?: import('./domain-enums').SausageAuditEntityKind;
  entityId?: string;
  limit?: number;
  offset?: number;
}

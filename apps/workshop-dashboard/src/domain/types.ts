export type ScreenKey =
  | 'dashboard'
  | 'orders'
  | 'salesOrders'
  | 'productionDemand'
  | 'batches'
  | 'transfers'
  | 'rawMaterials'
  | 'finishedProducts'
  | 'recipes'
  | 'clients'
  | 'balances'
  | 'losses'
  | 'analytics'
  | 'documents'
  | 'auditLogs';

export type OrderStatus =
  | 'planned'
  | 'waiting_materials'
  | 'in_progress'
  | 'released'
  | 'accepted'
  | 'shipped'
  | 'cancelled';

export type StockStatus = 'ok' | 'low' | 'critical';

export type MovementType =
  | 'receipt'
  | 'transfer_to_workshop'
  | 'consume'
  | 'release'
  | 'write_off'
  | 'adjustment';

export type LossReason =
  | 'TRIMMING'
  | 'THERMAL_LOSS'
  | 'DEFECT'
  | 'EXPIRY'
  | 'CALIBRATION'
  | 'PACKAGING_DAMAGE'
  | 'QUALITY_REJECT'
  | 'WEIGHT_VARIANCE'
  | 'OTHER';

export type StatusTone = 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface KpiMetric {
  id: string;
  label: string;
  value: string;
  unit?: string;
  delta: string;
  tone: StatusTone;
}

export interface RawMaterial {
  id: string;
  name: string;
  group: string;
  warehouseKg: number;
  workshopKg: number;
  reservedKg: number;
  minKg: number;
  status: StockStatus;
  supplier: string;
}

export interface FinishedProduct {
  id: string;
  name: string;
  sku: string;
  stockKg: number;
  stockPcs: number;
  reservedKg: number;
  shelfLifeDays: number;
  status: StockStatus;
}

export interface Client {
  id: string;
  name: string;
  segment: string;
  phone: string;
  balance: string;
  lastOrder: string;
}

export interface RecipeItem {
  materialId: string;
  materialName: string;
  quantityKg: number;
}

export interface Recipe {
  id: string;
  productName: string;
  outputKg: number;
  expectedYieldPercent: number;
  items: RecipeItem[];
}

export interface ProductionOrder {
  id: string;
  number: string;
  productName: string;
  quantityKg: number;
  clientName: string;
  status: OrderStatus;
  progress: number;
  dueAt: string;
  shift: string;
}

export interface ProductionBatch {
  id: string;
  batchNo: string;
  orderNo: string;
  productName: string;
  producedKg: number;
  acceptedKg: number;
  rejectedKg: number;
  releasedAt: string;
  yieldPercent: number;
  status?: string;
  qualityStatus?: string;
}

export interface StockMovement {
  id: string;
  docNo: string;
  type: MovementType;
  itemName: string;
  quantityKg: number;
  from: string;
  to: string;
  operator: string;
  createdAt: string;
}

export interface LossRecord {
  id: string;
  docNo: string;
  itemName: string;
  reason: LossReason;
  category?: string;
  stage?: string;
  quantityKg: number;
  cost: string;
  createdAt: string;
  operator: string;
  approvedByUserId?: string;
}

export interface ActivityEvent {
  id: string;
  text: string;
  meta: string;
  tone: StatusTone;
}

export interface HourlyOutput {
  hour: string;
  valueKg: number;
}

export interface DashboardSnapshot {
  metrics: KpiMetric[];
  quickActions: Array<{
    id: ModalKind;
    label: string;
    description: string;
  }>;
  activeOrders: ProductionOrder[];
  criticalRawStock: RawMaterial[];
  hourlyOutput: HourlyOutput[];
  events: ActivityEvent[];
  finishedProducts: FinishedProduct[];
  losses: LossRecord[];
}

export type ModalKind =
  | 'transfer'
  | 'release'
  | 'writeOff'
  | 'order'
  | 'receipt'
  | 'rawMaterial'
  | 'finishedProduct'
  | 'recipe'
  | 'client'
  | 'salesOrder'
  | 'createDemandOrder'
  | 'qualityCheck'
  | 'approveLoss';

export interface SalesOrder {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  status: string;
  items: SalesOrderItem[];
  createdAt: string;
}

export interface SalesOrderItem {
  id: string;
  finishedProductId: string;
  finishedProductName: string;
  quantityQty: number;
  reservedQty: number;
  producedQty: number;
  shippedQty: number;
  shortageQty: number;
  activeReservationId?: string;
  priceAmount: number;
  costAmount: number;
}

export interface FinishedGoodsReservation {
  id: string;
  salesOrderId: string;
  salesOrderItemId: string;
  finishedProductName: string;
  quantityQty: number;
  status: string;
}

export interface ProductionDemand {
  finishedProductId: string;
  finishedProductName: string;
  requiredQty: number;
  availableQty: number;
  reservedQty: number;
  shortageQty: number;
  suggestedProductionQty: number;
}

export interface DocumentRecord {
  id: string;
  number: string;
  type: string;
  status: string;
  title?: string;
  totalQty: number;
  totalAmount: number;
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  action: string;
  entityKind: string;
  entityId: string;
  userName?: string;
  createdAt: string;
}

export interface WorkshopDataset {
  rawMaterials: RawMaterial[];
  finishedProducts: FinishedProduct[];
  clients: Client[];
  recipes: Recipe[];
  orders: ProductionOrder[];
  salesOrders: SalesOrder[];
  reservations: FinishedGoodsReservation[];
  productionDemand: ProductionDemand[];
  batches: ProductionBatch[];
  movements: StockMovement[];
  losses: LossRecord[];
  documents: DocumentRecord[];
  auditLogs: AuditLogRecord[];
  dashboard: DashboardSnapshot;
}

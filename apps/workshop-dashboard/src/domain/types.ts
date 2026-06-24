export type ScreenKey =
  | 'dashboard'
  | 'orders'
  | 'batches'
  | 'transfers'
  | 'rawMaterials'
  | 'finishedProducts'
  | 'recipes'
  | 'clients'
  | 'balances'
  | 'losses'
  | 'analytics';

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

export type LossReason = 'trimming' | 'thermal_loss' | 'defect' | 'expiry' | 'calibration';

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
  quantityKg: number;
  cost: string;
  createdAt: string;
  operator: string;
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
  | 'client';

export interface WorkshopDataset {
  rawMaterials: RawMaterial[];
  finishedProducts: FinishedProduct[];
  clients: Client[];
  recipes: Recipe[];
  orders: ProductionOrder[];
  batches: ProductionBatch[];
  movements: StockMovement[];
  losses: LossRecord[];
  dashboard: DashboardSnapshot;
}

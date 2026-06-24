import type { OrderStatus, StockStatus, StatusTone } from '../domain/types';

const orderLabels: Record<OrderStatus, string> = {
  planned: 'Запланировано',
  waiting_materials: 'Ожидание сырья',
  in_progress: 'В работе',
  released: 'Выпущено',
  accepted: 'Принято',
  shipped: 'Отгружено',
  cancelled: 'Отменено',
};

const orderTones: Record<OrderStatus, StatusTone> = {
  planned: 'neutral',
  waiting_materials: 'warning',
  in_progress: 'accent',
  released: 'info',
  accepted: 'success',
  shipped: 'success',
  cancelled: 'danger',
};

const stockLabels: Record<StockStatus, string> = {
  ok: 'OK',
  low: 'Низкий',
  critical: 'Критический',
};

const stockTones: Record<StockStatus, StatusTone> = {
  ok: 'success',
  low: 'warning',
  critical: 'danger',
};

export function getOrderStatusLabel(status: OrderStatus): string {
  return orderLabels[status];
}

export function getStockStatusLabel(status: StockStatus): string {
  return stockLabels[status];
}

interface StatusTagProps {
  label?: string;
  tone?: StatusTone;
  orderStatus?: OrderStatus;
  stockStatus?: StockStatus;
}

export function StatusTag({ label, tone = 'neutral', orderStatus, stockStatus }: StatusTagProps) {
  const resolvedLabel = orderStatus
    ? orderLabels[orderStatus]
    : stockStatus
      ? stockLabels[stockStatus]
      : label;
  const resolvedTone = orderStatus ? orderTones[orderStatus] : stockStatus ? stockTones[stockStatus] : tone;

  return <span className={`tag tag-${resolvedTone}`}>{resolvedLabel}</span>;
}

export type SausageStockLocation =
  | 'RAW_WAREHOUSE'
  | 'WORKSHOP'
  | 'FINISHED_WAREHOUSE'
  | 'LOSS'
  | 'ADJUSTMENT';

export type SausageMovementType =
  | 'RAW_RECEIPT'
  | 'RAW_TRANSFER_TO_WORKSHOP'
  | 'RAW_CONSUMPTION'
  | 'FINISHED_RELEASE'
  | 'LOSS_WRITE_OFF'
  | 'STOCK_ADJUSTMENT';

export type SausageProductionOrderStatus =
  | 'PLANNED'
  | 'WAITING_MATERIALS'
  | 'IN_PROGRESS'
  | 'RELEASED'
  | 'ACCEPTED'
  | 'SHIPPED'
  | 'CANCELLED';

export type SausageStockStatus =
  | 'OK'
  | 'LOW'
  | 'CRITICAL';

export type SausageLossReason =
  | 'TRIMMING'
  | 'THERMAL_LOSS'
  | 'DEFECT'
  | 'EXPIRY'
  | 'CALIBRATION'
  | 'OTHER';

export type SausageSalesOrderStatus =
  | 'DRAFT'
  | 'CONFIRMED'
  | 'PARTIALLY_RESERVED'
  | 'RESERVED'
  | 'IN_PRODUCTION'
  | 'READY'
  | 'COMPLETED'
  | 'CANCELLED';

export type SausageReservationStatus =
  | 'ACTIVE'
  | 'RELEASED'
  | 'COMPLETED'
  | 'CANCELLED';

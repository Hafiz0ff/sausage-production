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
  | 'PACKAGING_DAMAGE'
  | 'QUALITY_REJECT'
  | 'WEIGHT_VARIANCE'
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

export type SausageBatchStatus =
  | 'DRAFT'
  | 'RELEASED'
  | 'QUALITY_PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'PARTIALLY_ACCEPTED'
  | 'CANCELLED';

export type SausageQualityStatus =
  | 'NOT_CHECKED'
  | 'PASSED'
  | 'FAILED'
  | 'PARTIAL';

export type SausageLossCategory =
  | 'RAW_MATERIAL'
  | 'PRODUCTION'
  | 'QUALITY_REJECT'
  | 'PACKAGING'
  | 'EXPIRY'
  | 'ADJUSTMENT'
  | 'OTHER';

export type SausageLossStage =
  | 'RAW_WAREHOUSE'
  | 'WORKSHOP_PREP'
  | 'MIXING'
  | 'THERMAL_PROCESSING'
  | 'PACKAGING'
  | 'FINISHED_WAREHOUSE'
  | 'QUALITY_CONTROL'
  | 'OTHER';

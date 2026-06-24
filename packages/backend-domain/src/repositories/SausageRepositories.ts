import {
  SausageRawMaterialDto,
  SausageFinishedProductDto,
  SausageRecipeDto,
  SausageClientDto,
  SausageProductionOrderDto,
  SausageProductionBatchDto,
  SausageStockMovementDto,
  SausageLossDto,
  SausageQualityCheckDto
} from 'sausage-shared-types';

export interface SausageRawMaterialRepository {
  findMany(companyId: string): Promise<SausageRawMaterialDto[]>;
  findById(id: string, companyId: string): Promise<SausageRawMaterialDto | null>;
  create(data: SausageRawMaterialDto): Promise<SausageRawMaterialDto>;
  update(id: string, companyId: string, data: Partial<SausageRawMaterialDto>): Promise<SausageRawMaterialDto>;
}

export interface SausageFinishedProductRepository {
  findMany(companyId: string): Promise<SausageFinishedProductDto[]>;
  findById(id: string, companyId: string): Promise<SausageFinishedProductDto | null>;
  create(data: SausageFinishedProductDto): Promise<SausageFinishedProductDto>;
  update(id: string, companyId: string, data: Partial<SausageFinishedProductDto>): Promise<SausageFinishedProductDto>;
}

export interface SausageRecipeRepository {
  findMany(companyId: string): Promise<SausageRecipeDto[]>;
  findByFinishedProductId(finishedProductId: string, companyId: string): Promise<SausageRecipeDto | null>;
  create(data: SausageRecipeDto): Promise<SausageRecipeDto>;
  update(id: string, companyId: string, data: Partial<SausageRecipeDto>): Promise<SausageRecipeDto>;
}

export interface SausageClientRepository {
  findMany(companyId: string): Promise<SausageClientDto[]>;
  findById(id: string, companyId: string): Promise<SausageClientDto | null>;
  create(data: SausageClientDto): Promise<SausageClientDto>;
}

export interface SausageProductionOrderRepository {
  findMany(companyId: string): Promise<SausageProductionOrderDto[]>;
  findById(id: string, companyId: string): Promise<SausageProductionOrderDto | null>;
  create(data: SausageProductionOrderDto): Promise<SausageProductionOrderDto>;
  update(id: string, companyId: string, data: Partial<SausageProductionOrderDto>): Promise<SausageProductionOrderDto>;
}

export interface SausageProductionBatchRepository {
  findMany(companyId: string): Promise<SausageProductionBatchDto[]>;
  findById(id: string, companyId: string): Promise<SausageProductionBatchDto | null>;
  create(data: SausageProductionBatchDto): Promise<SausageProductionBatchDto>;
  update(id: string, companyId: string, data: Partial<SausageProductionBatchDto>): Promise<SausageProductionBatchDto>;
}

export interface SausageStockMovementRepository {
  findMany(companyId: string): Promise<SausageStockMovementDto[]>;
  create(data: SausageStockMovementDto): Promise<SausageStockMovementDto>;
}

export interface SausageLossRepository {
  findMany(companyId: string): Promise<SausageLossDto[]>;
  findById(id: string, companyId: string): Promise<SausageLossDto | null>;
  create(data: SausageLossDto): Promise<SausageLossDto>;
  update(id: string, companyId: string, data: Partial<SausageLossDto>): Promise<SausageLossDto>;
}

export interface SausageSalesOrderRepository {
  findMany(companyId: string): Promise<import('sausage-shared-types').SausageSalesOrderDto[]>;
  findById(id: string, companyId: string): Promise<import('sausage-shared-types').SausageSalesOrderDto | null>;
  create(data: import('sausage-shared-types').SausageSalesOrderDto): Promise<import('sausage-shared-types').SausageSalesOrderDto>;
  update(id: string, companyId: string, data: Partial<import('sausage-shared-types').SausageSalesOrderDto>): Promise<import('sausage-shared-types').SausageSalesOrderDto>;
}

export interface SausageSalesOrderItemRepository {
  findMany(companyId: string): Promise<import('sausage-shared-types').SausageSalesOrderItemDto[]>;
  findByOrderId(salesOrderId: string, companyId: string): Promise<import('sausage-shared-types').SausageSalesOrderItemDto[]>;
  create(data: import('sausage-shared-types').SausageSalesOrderItemDto): Promise<import('sausage-shared-types').SausageSalesOrderItemDto>;
  update(id: string, companyId: string, data: Partial<import('sausage-shared-types').SausageSalesOrderItemDto>): Promise<import('sausage-shared-types').SausageSalesOrderItemDto>;
}

export interface SausageReservationRepository {
  findMany(companyId: string): Promise<import('sausage-shared-types').SausageFinishedGoodsReservationDto[]>;
  findById(id: string, companyId: string): Promise<import('sausage-shared-types').SausageFinishedGoodsReservationDto | null>;
  create(data: import('sausage-shared-types').SausageFinishedGoodsReservationDto): Promise<import('sausage-shared-types').SausageFinishedGoodsReservationDto>;
  update(id: string, companyId: string, data: Partial<import('sausage-shared-types').SausageFinishedGoodsReservationDto>): Promise<import('sausage-shared-types').SausageFinishedGoodsReservationDto>;
}

export interface SausageQualityCheckRepository {
  findMany(companyId: string): Promise<SausageQualityCheckDto[]>;
  findById(id: string, companyId: string): Promise<SausageQualityCheckDto | null>;
  create(data: SausageQualityCheckDto): Promise<SausageQualityCheckDto>;
}

export interface SausageRepositories {
  rawMaterials: SausageRawMaterialRepository;
  finishedProducts: SausageFinishedProductRepository;
  recipes: SausageRecipeRepository;
  clients: SausageClientRepository;
  orders: SausageProductionOrderRepository;
  batches: SausageProductionBatchRepository;
  movements: SausageStockMovementRepository;
  losses: SausageLossRepository;
  salesOrders: SausageSalesOrderRepository;
  salesOrderItems: SausageSalesOrderItemRepository;
  reservations: SausageReservationRepository;
  qualityChecks: SausageQualityCheckRepository;

  runTransaction<T>(fn: (tx: SausageRepositories) => Promise<T>): Promise<T>;
}

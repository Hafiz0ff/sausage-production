import {
  SausageRawMaterialDto,
  SausageFinishedProductDto,
  SausageRecipeDto,
  SausageClientDto,
  SausageProductionOrderDto,
  SausageProductionBatchDto,
  SausageStockMovementDto,
  SausageLossDto
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
  create(data: SausageProductionBatchDto): Promise<SausageProductionBatchDto>;
}

export interface SausageStockMovementRepository {
  findMany(companyId: string): Promise<SausageStockMovementDto[]>;
  create(data: SausageStockMovementDto): Promise<SausageStockMovementDto>;
}

export interface SausageLossRepository {
  findMany(companyId: string): Promise<SausageLossDto[]>;
  create(data: SausageLossDto): Promise<SausageLossDto>;
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

  runTransaction<T>(fn: (tx: SausageRepositories) => Promise<T>): Promise<T>;
}

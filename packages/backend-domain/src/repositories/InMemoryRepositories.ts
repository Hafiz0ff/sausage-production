import {
  SausageRawMaterialDto,
  SausageFinishedProductDto,
  SausageRecipeDto,
  SausageProductionOrderDto,
  SausageProductionBatchDto,
  SausageStockMovementDto,
  SausageLossDto
} from 'sausage-shared-types';

export class InMemoryRepositories {
  rawMaterials: SausageRawMaterialDto[] = [];
  finishedProducts: SausageFinishedProductDto[] = [];
  recipes: SausageRecipeDto[] = [];
  orders: SausageProductionOrderDto[] = [];
  batches: SausageProductionBatchDto[] = [];
  movements: SausageStockMovementDto[] = [];
  losses: SausageLossDto[] = [];

  constructor() {}

  async clear() {
    this.rawMaterials = [];
    this.finishedProducts = [];
    this.recipes = [];
    this.orders = [];
    this.batches = [];
    this.movements = [];
    this.losses = [];
  }
}

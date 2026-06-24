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

export class InMemoryRepositories {
  rawMaterials: SausageRawMaterialDto[] = [];
  finishedProducts: SausageFinishedProductDto[] = [];
  recipes: SausageRecipeDto[] = [];
  clients: SausageClientDto[] = [];
  orders: SausageProductionOrderDto[] = [];
  batches: SausageProductionBatchDto[] = [];
  movements: SausageStockMovementDto[] = [];
  losses: SausageLossDto[] = [];

  constructor() {}

  async clear() {
    this.rawMaterials = [];
    this.finishedProducts = [];
    this.recipes = [];
    this.clients = [];
    this.orders = [];
    this.batches = [];
    this.movements = [];
    this.losses = [];
  }
}

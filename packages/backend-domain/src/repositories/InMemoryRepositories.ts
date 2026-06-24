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
import {
  SausageRepositories,
  SausageRawMaterialRepository,
  SausageFinishedProductRepository,
  SausageRecipeRepository,
  SausageClientRepository,
  SausageProductionOrderRepository,
  SausageProductionBatchRepository,
  SausageStockMovementRepository,
  SausageLossRepository
} from './SausageRepositories';

export class InMemoryRepositories implements SausageRepositories {
  private rawMaterialsData: SausageRawMaterialDto[] = [];
  private finishedProductsData: SausageFinishedProductDto[] = [];
  private recipesData: SausageRecipeDto[] = [];
  private clientsData: SausageClientDto[] = [];
  private ordersData: SausageProductionOrderDto[] = [];
  private batchesData: SausageProductionBatchDto[] = [];
  private movementsData: SausageStockMovementDto[] = [];
  private lossesData: SausageLossDto[] = [];

  readonly rawMaterials: SausageRawMaterialRepository = {
    findMany: async (companyId) => this.rawMaterialsData.filter(x => x.companyId === companyId),
    findById: async (id, companyId) => this.rawMaterialsData.find(x => x.id === id && x.companyId === companyId) || null,
    create: async (data) => { this.rawMaterialsData.push(data); return data; },
    update: async (id, companyId, data) => {
      const idx = this.rawMaterialsData.findIndex(x => x.id === id && x.companyId === companyId);
      if (idx === -1) throw new Error('Not found');
      this.rawMaterialsData[idx] = { ...this.rawMaterialsData[idx], ...data };
      return this.rawMaterialsData[idx];
    }
  };

  readonly finishedProducts: SausageFinishedProductRepository = {
    findMany: async (companyId) => this.finishedProductsData.filter(x => x.companyId === companyId),
    findById: async (id, companyId) => this.finishedProductsData.find(x => x.id === id && x.companyId === companyId) || null,
    create: async (data) => { this.finishedProductsData.push(data); return data; },
    update: async (id, companyId, data) => {
      const idx = this.finishedProductsData.findIndex(x => x.id === id && x.companyId === companyId);
      if (idx === -1) throw new Error('Not found');
      this.finishedProductsData[idx] = { ...this.finishedProductsData[idx], ...data };
      return this.finishedProductsData[idx];
    }
  };

  readonly recipes: SausageRecipeRepository = {
    findMany: async (companyId) => this.recipesData.filter(x => x.companyId === companyId),
    findByFinishedProductId: async (finishedProductId, companyId) => this.recipesData.find(x => x.finishedProductId === finishedProductId && x.companyId === companyId) || null,
    create: async (data) => { this.recipesData.push(data); return data; },
    update: async (id, companyId, data) => {
      const idx = this.recipesData.findIndex(x => x.id === id && x.companyId === companyId);
      if (idx === -1) throw new Error('Not found');
      this.recipesData[idx] = { ...this.recipesData[idx], ...data };
      return this.recipesData[idx];
    }
  };

  readonly clients: SausageClientRepository = {
    findMany: async (companyId) => this.clientsData.filter(x => x.companyId === companyId),
    findById: async (id, companyId) => this.clientsData.find(x => x.id === id && x.companyId === companyId) || null,
    create: async (data) => { this.clientsData.push(data); return data; }
  };

  readonly orders: SausageProductionOrderRepository = {
    findMany: async (companyId) => this.ordersData.filter(x => x.companyId === companyId),
    findById: async (id, companyId) => this.ordersData.find(x => x.id === id && x.companyId === companyId) || null,
    create: async (data) => { this.ordersData.push(data); return data; },
    update: async (id, companyId, data) => {
      const idx = this.ordersData.findIndex(x => x.id === id && x.companyId === companyId);
      if (idx === -1) throw new Error('Not found');
      this.ordersData[idx] = { ...this.ordersData[idx], ...data };
      return this.ordersData[idx];
    }
  };

  readonly batches: SausageProductionBatchRepository = {
    findMany: async (companyId) => this.batchesData.filter(x => x.companyId === companyId),
    create: async (data) => { this.batchesData.push(data); return data; }
  };

  readonly movements: SausageStockMovementRepository = {
    findMany: async (companyId) => this.movementsData.filter(x => x.companyId === companyId),
    create: async (data) => { this.movementsData.push(data); return data; }
  };

  readonly losses: SausageLossRepository = {
    findMany: async (companyId) => this.lossesData.filter(x => x.companyId === companyId),
    create: async (data) => { this.lossesData.push(data); return data; }
  };

  async runTransaction<T>(fn: (tx: SausageRepositories) => Promise<T>): Promise<T> {
    // In memory, we just run it directly. For real rollback we would clone states, but this is sufficient for tests.
    return fn(this);
  }

  async clear() {
    this.rawMaterialsData = [];
    this.finishedProductsData = [];
    this.recipesData = [];
    this.clientsData = [];
    this.ordersData = [];
    this.batchesData = [];
    this.movementsData = [];
    this.lossesData = [];
  }
}

import { 
  SausageDashboardDto,
  SausageRawMaterialDto,
  CreateSausageRawMaterialInput,
  ReceiveSausageRawMaterialInput,
  TransferSausageRawToWorkshopInput,
  SausageFinishedProductDto,
  SausageRecipeDto,
  SausageClientDto,
  SausageProductionOrderDto,
  CreateSausageProductionOrderInput,
  StartSausageProductionOrderInput,
  SausageProductionBatchDto,
  ReleaseSausageProductionBatchInput,
  SausageStockMovementDto,
  WriteOffSausageStockInput,
  SausageLossDto
} from 'sausage-shared-types';

export class SausageApiClient {
  constructor(private baseUrl: string = '/api/sausage-production') {}

  private async fetch<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw err;
    }
    
    return response.json();
  }

  // Dashboard
  getDashboard(): Promise<SausageDashboardDto> {
    return this.fetch<SausageDashboardDto>('/dashboard');
  }

  // Raw Materials
  getRawMaterials(): Promise<SausageRawMaterialDto[]> {
    return this.fetch<SausageRawMaterialDto[]>('/raw-materials');
  }
  
  createRawMaterial(input: CreateSausageRawMaterialInput): Promise<SausageRawMaterialDto> {
    return this.fetch<SausageRawMaterialDto>('/raw-materials', { method: 'POST', body: JSON.stringify(input) });
  }

  receiveRawMaterial(id: string, input: ReceiveSausageRawMaterialInput): Promise<void> {
    return this.fetch<void>(`/raw-materials/${id}/receipt`, { method: 'POST', body: JSON.stringify(input) });
  }

  transferRawToWorkshop(id: string, input: TransferSausageRawToWorkshopInput): Promise<void> {
    return this.fetch<void>(`/raw-materials/${id}/transfer-to-workshop`, { method: 'POST', body: JSON.stringify(input) });
  }

  // Finished Products
  getFinishedProducts(): Promise<SausageFinishedProductDto[]> {
    return this.fetch<SausageFinishedProductDto[]>('/finished-products');
  }

  // Recipes
  getRecipes(): Promise<SausageRecipeDto[]> {
    return this.fetch<SausageRecipeDto[]>('/recipes');
  }

  // Clients
  getClients(): Promise<SausageClientDto[]> {
    return this.fetch<SausageClientDto[]>('/clients');
  }

  // Orders
  getOrders(): Promise<SausageProductionOrderDto[]> {
    return this.fetch<SausageProductionOrderDto[]>('/orders');
  }

  createOrder(input: CreateSausageProductionOrderInput): Promise<SausageProductionOrderDto> {
    return this.fetch<SausageProductionOrderDto>('/orders', { method: 'POST', body: JSON.stringify(input) });
  }

  startOrder(id: string, input: StartSausageProductionOrderInput): Promise<void> {
    return this.fetch<void>(`/orders/${id}/start`, { method: 'POST', body: JSON.stringify(input) });
  }

  // Batches
  getBatches(): Promise<SausageProductionBatchDto[]> {
    return this.fetch<SausageProductionBatchDto[]>('/batches');
  }

  releaseBatch(input: ReleaseSausageProductionBatchInput): Promise<SausageProductionBatchDto> {
    return this.fetch<SausageProductionBatchDto>('/batches/release', { method: 'POST', body: JSON.stringify(input) });
  }

  // Stock Movements & Losses
  getStockMovements(): Promise<SausageStockMovementDto[]> {
    return this.fetch<SausageStockMovementDto[]>('/stock-movements');
  }

  writeOffStock(input: WriteOffSausageStockInput): Promise<void> {
    return this.fetch<void>('/stock/write-off', { method: 'POST', body: JSON.stringify(input) });
  }

  getLosses(): Promise<SausageLossDto[]> {
    return this.fetch<SausageLossDto[]>('/losses');
  }
}

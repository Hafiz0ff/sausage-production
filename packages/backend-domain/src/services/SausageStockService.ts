import {
  SausageRawMaterialDto,
  SausageFinishedProductDto,
  ReceiveSausageRawMaterialInput,
  TransferSausageRawToWorkshopInput,
  WriteOffSausageStockInput,
  SausageStockMovementDto,
  SAUSAGE_ERROR_CODES
} from 'sausage-shared-types';
import { v4 as uuidv4 } from 'uuid';
import { InMemoryRepositories } from '../repositories/InMemoryRepositories';
import { SausageAuthPort } from '../ports/SausageAuthPort';

export class SausageStockService {
  constructor(
    private repos: InMemoryRepositories,
    private authPort: SausageAuthPort
  ) {}

  async getRawMaterials(): Promise<SausageRawMaterialDto[]> {
    const user = this.authPort.getCurrentUser();
    return this.repos.rawMaterials.filter(r => r.companyId === user.companyId);
  }

  async getFinishedProducts(): Promise<SausageFinishedProductDto[]> {
    const user = this.authPort.getCurrentUser();
    return this.repos.finishedProducts.filter(product => product.companyId === user.companyId);
  }

  async getStockMovements(): Promise<SausageStockMovementDto[]> {
    const user = this.authPort.getCurrentUser();
    return this.repos.movements.filter(movement => movement.companyId === user.companyId);
  }

  async getLosses() {
    const user = this.authPort.getCurrentUser();
    return this.repos.losses.filter(loss => loss.companyId === user.companyId);
  }

  async receiveRawMaterial(id: string, input: ReceiveSausageRawMaterialInput): Promise<void> {
    if (input.quantityQty <= 0) {
      throw { error: { code: SAUSAGE_ERROR_CODES.VALIDATION_ERROR, message: 'Quantity must be > 0' } };
    }

    const user = this.authPort.getCurrentUser();
    const material = this.repos.rawMaterials.find(m => m.id === id && m.companyId === user.companyId);
    if (!material) {
      throw { error: { code: SAUSAGE_ERROR_CODES.NOT_FOUND, message: 'Raw material not found' } };
    }

    material.warehouseQty += input.quantityQty;
    material.updatedAt = new Date().toISOString();

    const movement: SausageStockMovementDto = {
      id: uuidv4(),
      companyId: user.companyId,
      docNo: `RC-${Date.now()}`,
      type: 'RAW_RECEIPT',
      itemKind: 'RAW_MATERIAL',
      itemId: material.id,
      itemName: material.name,
      quantityQty: input.quantityQty,
      fromLocation: 'ADJUSTMENT', // Assuming coming from external supplier
      toLocation: 'RAW_WAREHOUSE',
      createdByUserId: user.id,
      createdByName: user.name,
      createdAt: new Date().toISOString(),
      reason: input.note
    };

    this.repos.movements.push(movement);
  }

  async transferToWorkshop(id: string, input: TransferSausageRawToWorkshopInput): Promise<void> {
    if (input.quantityQty <= 0) {
      throw { error: { code: SAUSAGE_ERROR_CODES.VALIDATION_ERROR, message: 'Quantity must be > 0' } };
    }

    const user = this.authPort.getCurrentUser();
    const material = this.repos.rawMaterials.find(m => m.id === id && m.companyId === user.companyId);
    if (!material) {
      throw { error: { code: SAUSAGE_ERROR_CODES.NOT_FOUND, message: 'Raw material not found' } };
    }

    if (material.warehouseQty < input.quantityQty) {
      throw { error: { code: SAUSAGE_ERROR_CODES.NEGATIVE_STOCK_FORBIDDEN, message: 'Insufficient warehouse stock' } };
    }

    material.warehouseQty -= input.quantityQty;
    material.workshopQty += input.quantityQty;
    material.updatedAt = new Date().toISOString();

    const movement: SausageStockMovementDto = {
      id: uuidv4(),
      companyId: user.companyId,
      docNo: `TR-${Date.now()}`,
      type: 'RAW_TRANSFER_TO_WORKSHOP',
      itemKind: 'RAW_MATERIAL',
      itemId: material.id,
      itemName: material.name,
      quantityQty: input.quantityQty,
      fromLocation: 'RAW_WAREHOUSE',
      toLocation: 'WORKSHOP',
      productionOrderId: input.productionOrderId,
      createdByUserId: user.id,
      createdByName: user.name,
      createdAt: new Date().toISOString(),
      reason: input.note
    };

    this.repos.movements.push(movement);
  }

  async writeOffStock(input: WriteOffSausageStockInput): Promise<void> {
    if (input.quantityQty <= 0) {
      throw { error: { code: SAUSAGE_ERROR_CODES.VALIDATION_ERROR, message: 'Quantity must be > 0' } };
    }

    const user = this.authPort.getCurrentUser();

    if (input.itemKind === 'RAW_MATERIAL') {
      const material = this.repos.rawMaterials.find(m => m.id === input.itemId && m.companyId === user.companyId);
      if (!material) throw { error: { code: SAUSAGE_ERROR_CODES.NOT_FOUND, message: 'Raw material not found' } };
      
      if (input.location === 'RAW_WAREHOUSE') {
        if (material.warehouseQty < input.quantityQty) throw { error: { code: SAUSAGE_ERROR_CODES.NEGATIVE_STOCK_FORBIDDEN, message: 'Insufficient warehouse stock' } };
        material.warehouseQty -= input.quantityQty;
      } else if (input.location === 'WORKSHOP') {
        if (material.workshopQty < input.quantityQty) throw { error: { code: SAUSAGE_ERROR_CODES.NEGATIVE_STOCK_FORBIDDEN, message: 'Insufficient workshop stock' } };
        material.workshopQty -= input.quantityQty;
      } else {
         throw { error: { code: SAUSAGE_ERROR_CODES.VALIDATION_ERROR, message: 'Invalid source location for raw material' } };
      }
    } else if (input.itemKind === 'FINISHED_PRODUCT') {
      const product = this.repos.finishedProducts.find(p => p.id === input.itemId && p.companyId === user.companyId);
      if (!product) throw { error: { code: SAUSAGE_ERROR_CODES.NOT_FOUND, message: 'Finished product not found' } };
      if (input.location !== 'FINISHED_WAREHOUSE') throw { error: { code: SAUSAGE_ERROR_CODES.VALIDATION_ERROR, message: 'Finished products must be in FINISHED_WAREHOUSE' } };
      if (product.stockQty < input.quantityQty) throw { error: { code: SAUSAGE_ERROR_CODES.NEGATIVE_STOCK_FORBIDDEN, message: 'Insufficient finished product stock' } };
      product.stockQty -= input.quantityQty;
    }

    const docNo = `WO-${Date.now()}`;
    const now = new Date().toISOString();

    const movement: SausageStockMovementDto = {
      id: uuidv4(),
      companyId: user.companyId,
      docNo,
      type: 'LOSS_WRITE_OFF',
      itemKind: input.itemKind,
      itemId: input.itemId,
      itemName: this.resolveItemName(input.itemKind, input.itemId, user.companyId),
      quantityQty: input.quantityQty,
      fromLocation: input.location,
      toLocation: 'LOSS',
      createdByUserId: user.id,
      createdByName: user.name,
      createdAt: now,
      reason: input.note
    };
    this.repos.movements.push(movement);

    this.repos.losses.push({
      id: uuidv4(),
      companyId: user.companyId,
      docNo,
      itemKind: input.itemKind,
      itemId: input.itemId,
      itemName: this.resolveItemName(input.itemKind, input.itemId, user.companyId),
      reason: input.reason,
      quantityQty: input.quantityQty,
      createdByUserId: user.id,
      createdByName: user.name,
      createdAt: now
    });
  }

  private resolveItemName(itemKind: 'RAW_MATERIAL' | 'FINISHED_PRODUCT', itemId: string, companyId: string): string {
    if (itemKind === 'RAW_MATERIAL') {
      return this.repos.rawMaterials.find(item => item.id === itemId && item.companyId === companyId)?.name ?? 'Unknown';
    }

    return this.repos.finishedProducts.find(item => item.id === itemId && item.companyId === companyId)?.name ?? 'Unknown';
  }
}

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
import { SausageRepositories } from '../repositories/SausageRepositories';
import { SausageAuthPort } from '../ports/SausageAuthPort';

export class SausageStockService {
  constructor(
    private repos: SausageRepositories,
    private authPort: SausageAuthPort
  ) {}

  async getRawMaterials(): Promise<SausageRawMaterialDto[]> {
    const user = this.authPort.getCurrentUser();
    return this.repos.rawMaterials.findMany(user.companyId);
  }

  async getFinishedProducts(): Promise<SausageFinishedProductDto[]> {
    const user = this.authPort.getCurrentUser();
    return this.repos.finishedProducts.findMany(user.companyId);
  }

  async getStockMovements(): Promise<SausageStockMovementDto[]> {
    const user = this.authPort.getCurrentUser();
    return this.repos.movements.findMany(user.companyId);
  }

  async getLosses() {
    const user = this.authPort.getCurrentUser();
    return this.repos.losses.findMany(user.companyId);
  }

  async receiveRawMaterial(id: string, input: ReceiveSausageRawMaterialInput): Promise<void> {
    if (input.quantityQty <= 0) {
      throw { error: { code: SAUSAGE_ERROR_CODES.VALIDATION_ERROR, message: 'Quantity must be > 0' } };
    }

    const user = this.authPort.getCurrentUser();

    await this.repos.runTransaction(async (tx) => {
      const material = await tx.rawMaterials.findById(id, user.companyId);
      if (!material) {
        throw { error: { code: SAUSAGE_ERROR_CODES.NOT_FOUND, message: 'Raw material not found' } };
      }

      await tx.rawMaterials.update(material.id, user.companyId, {
        warehouseQty: material.warehouseQty + input.quantityQty,
        updatedAt: new Date().toISOString()
      });

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

      await tx.movements.create(movement);
    });
  }

  async transferToWorkshop(id: string, input: TransferSausageRawToWorkshopInput): Promise<void> {
    if (input.quantityQty <= 0) {
      throw { error: { code: SAUSAGE_ERROR_CODES.VALIDATION_ERROR, message: 'Quantity must be > 0' } };
    }

    const user = this.authPort.getCurrentUser();

    await this.repos.runTransaction(async (tx) => {
      const material = await tx.rawMaterials.findById(id, user.companyId);
      if (!material) {
        throw { error: { code: SAUSAGE_ERROR_CODES.NOT_FOUND, message: 'Raw material not found' } };
      }

      if (material.warehouseQty < input.quantityQty) {
        throw { error: { code: SAUSAGE_ERROR_CODES.NEGATIVE_STOCK_FORBIDDEN, message: 'Insufficient warehouse stock' } };
      }

      await tx.rawMaterials.update(material.id, user.companyId, {
        warehouseQty: material.warehouseQty - input.quantityQty,
        workshopQty: material.workshopQty + input.quantityQty,
        updatedAt: new Date().toISOString()
      });

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

      await tx.movements.create(movement);
    });
  }

  async writeOffStock(input: WriteOffSausageStockInput): Promise<void> {
    if (input.quantityQty <= 0) {
      throw { error: { code: SAUSAGE_ERROR_CODES.VALIDATION_ERROR, message: 'Quantity must be > 0' } };
    }

    const user = this.authPort.getCurrentUser();
    
    await this.repos.runTransaction(async (tx) => {
      let itemName = 'Unknown';

      if (input.itemKind === 'RAW_MATERIAL') {
        const material = await tx.rawMaterials.findById(input.itemId, user.companyId);
        if (!material) throw { error: { code: SAUSAGE_ERROR_CODES.NOT_FOUND, message: 'Raw material not found' } };
        itemName = material.name;
        
        let warehouseQty = material.warehouseQty;
        let workshopQty = material.workshopQty;

        if (input.location === 'RAW_WAREHOUSE') {
          if (warehouseQty < input.quantityQty) throw { error: { code: SAUSAGE_ERROR_CODES.NEGATIVE_STOCK_FORBIDDEN, message: 'Insufficient warehouse stock' } };
          warehouseQty -= input.quantityQty;
        } else if (input.location === 'WORKSHOP') {
          if (workshopQty < input.quantityQty) throw { error: { code: SAUSAGE_ERROR_CODES.NEGATIVE_STOCK_FORBIDDEN, message: 'Insufficient workshop stock' } };
          workshopQty -= input.quantityQty;
        } else {
           throw { error: { code: SAUSAGE_ERROR_CODES.VALIDATION_ERROR, message: 'Invalid source location for raw material' } };
        }
        
        await tx.rawMaterials.update(material.id, user.companyId, {
          warehouseQty,
          workshopQty,
          updatedAt: new Date().toISOString()
        });
      } else if (input.itemKind === 'FINISHED_PRODUCT') {
        const product = await tx.finishedProducts.findById(input.itemId, user.companyId);
        if (!product) throw { error: { code: SAUSAGE_ERROR_CODES.NOT_FOUND, message: 'Finished product not found' } };
        if (input.location !== 'FINISHED_WAREHOUSE') throw { error: { code: SAUSAGE_ERROR_CODES.VALIDATION_ERROR, message: 'Finished products must be in FINISHED_WAREHOUSE' } };
        if (product.stockQty < input.quantityQty) throw { error: { code: SAUSAGE_ERROR_CODES.NEGATIVE_STOCK_FORBIDDEN, message: 'Insufficient finished product stock' } };
        
        itemName = product.name;
        await tx.finishedProducts.update(product.id, user.companyId, {
          stockQty: product.stockQty - input.quantityQty,
          updatedAt: new Date().toISOString()
        });
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
        itemName,
        quantityQty: input.quantityQty,
        fromLocation: input.location,
        toLocation: 'LOSS',
        createdByUserId: user.id,
        createdByName: user.name,
        createdAt: now,
        reason: input.note
      };
      await tx.movements.create(movement);

      await tx.losses.create({
        id: uuidv4(),
        companyId: user.companyId,
        docNo,
        itemKind: input.itemKind,
        itemId: input.itemId,
        itemName,
        reason: input.reason,
        quantityQty: input.quantityQty,
        createdByUserId: user.id,
        createdByName: user.name,
        createdAt: now
      });
    });
  }
}

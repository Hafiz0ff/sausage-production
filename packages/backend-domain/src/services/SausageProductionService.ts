import {
  CreateSausageProductionOrderInput,
  StartSausageProductionOrderInput,
  ReleaseSausageProductionBatchInput,
  SausageProductionOrderDto,
  SausageProductionBatchDto,
  SAUSAGE_ERROR_CODES,
  SausageStockMovementDto
} from 'sausage-shared-types';
import { v4 as uuidv4 } from 'uuid';
import { SausageRepositories } from '../repositories/SausageRepositories';
import { SausageAuthPort } from '../ports/SausageAuthPort';

export class SausageProductionService {
  constructor(
    private repos: SausageRepositories,
    private authPort: SausageAuthPort
  ) {}

  async getOrders(): Promise<SausageProductionOrderDto[]> {
    const user = this.authPort.getCurrentUser();
    return this.repos.orders.findMany(user.companyId);
  }

  async getRecipes() {
    const user = this.authPort.getCurrentUser();
    return this.repos.recipes.findMany(user.companyId);
  }

  async getClients() {
    const user = this.authPort.getCurrentUser();
    return this.repos.clients.findMany(user.companyId);
  }

  async getBatches(): Promise<SausageProductionBatchDto[]> {
    const user = this.authPort.getCurrentUser();
    return this.repos.batches.findMany(user.companyId);
  }

  async createOrder(input: CreateSausageProductionOrderInput): Promise<SausageProductionOrderDto> {
    if (input.quantityQty <= 0) {
      throw { error: { code: SAUSAGE_ERROR_CODES.VALIDATION_ERROR, message: 'Quantity must be > 0' } };
    }

    const user = this.authPort.getCurrentUser();
    const product = await this.repos.finishedProducts.findById(input.finishedProductId, user.companyId);
    if (!product) {
      throw { error: { code: SAUSAGE_ERROR_CODES.NOT_FOUND, message: 'Finished product not found' } };
    }

    const order: SausageProductionOrderDto = {
      id: uuidv4(),
      companyId: user.companyId,
      number: `PO-${Date.now()}`,
      finishedProductId: product.id,
      finishedProductName: product.name,
      quantityQty: input.quantityQty,
      clientId: input.clientId,
      clientName: input.clientName,
      status: 'PLANNED', // Or WAITING_MATERIALS based on real logic
      progressPercent: 0,
      dueAt: input.dueAt,
      shift: input.shift,
      externalOrderId: input.externalOrderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return await this.repos.orders.create(order);
  }

  async startOrder(id: string, input: StartSausageProductionOrderInput): Promise<void> {
    if (input.productionOrderId !== id) {
      throw { error: { code: SAUSAGE_ERROR_CODES.VALIDATION_ERROR, message: 'Route order id must match payload productionOrderId' } };
    }

    const user = this.authPort.getCurrentUser();
    const order = await this.repos.orders.findById(id, user.companyId);
    if (!order) {
      throw { error: { code: SAUSAGE_ERROR_CODES.NOT_FOUND, message: 'Order not found' } };
    }

    if (order.status !== 'PLANNED' && order.status !== 'WAITING_MATERIALS') {
      throw { error: { code: SAUSAGE_ERROR_CODES.FORBIDDEN_TRANSITION, message: 'Cannot start order from current status' } };
    }

    await this.repos.orders.update(id, user.companyId, {
      status: 'IN_PROGRESS',
      updatedAt: new Date().toISOString()
    });
  }

  async releaseBatch(input: ReleaseSausageProductionBatchInput): Promise<SausageProductionBatchDto> {
    if (input.producedQty <= 0) throw { error: { code: SAUSAGE_ERROR_CODES.VALIDATION_ERROR, message: 'producedQty must be > 0' } };
    if (input.acceptedQty < 0) throw { error: { code: SAUSAGE_ERROR_CODES.VALIDATION_ERROR, message: 'acceptedQty must be >= 0' } };
    if (input.rejectedQty < 0) throw { error: { code: SAUSAGE_ERROR_CODES.VALIDATION_ERROR, message: 'rejectedQty must be >= 0' } };
    if (input.acceptedQty + input.rejectedQty > input.producedQty) {
       throw { error: { code: SAUSAGE_ERROR_CODES.RELEASE_QTY_INVALID, message: 'acceptedQty + rejectedQty <= producedQty' } };
    }

    const user = this.authPort.getCurrentUser();
    
    return await this.repos.runTransaction(async (tx) => {
      const order = await tx.orders.findById(input.productionOrderId, user.companyId);
      if (!order) throw { error: { code: SAUSAGE_ERROR_CODES.NOT_FOUND, message: 'Order not found' } };
      
      if (order.status !== 'IN_PROGRESS' && order.status !== 'RELEASED') {
        throw { error: { code: SAUSAGE_ERROR_CODES.FORBIDDEN_TRANSITION, message: 'Cannot release batch for non in-progress order' } };
      }

      const recipe = await tx.recipes.findByFinishedProductId(order.finishedProductId, user.companyId);
      if (!recipe) throw { error: { code: SAUSAGE_ERROR_CODES.NOT_FOUND, message: 'Recipe not found' } };

      const now = new Date().toISOString();
      const batchId = uuidv4();

      // Decrease raw materials from workshop based on recipe
      for (const item of recipe.items) {
        const rawMaterial = await tx.rawMaterials.findById(item.rawMaterialId, user.companyId);
        if (!rawMaterial) throw { error: { code: SAUSAGE_ERROR_CODES.NOT_FOUND, message: `Raw material ${item.rawMaterialName} not found` } };
        
        const requiredRawQty = (item.quantityQty * input.producedQty) / recipe.outputQty;
        
        if (rawMaterial.workshopQty < requiredRawQty) {
           throw { error: { code: SAUSAGE_ERROR_CODES.NEGATIVE_STOCK_FORBIDDEN, message: `Insufficient workshop stock for ${rawMaterial.name}` } };
        }
        await tx.rawMaterials.update(rawMaterial.id, user.companyId, {
          workshopQty: rawMaterial.workshopQty - requiredRawQty
        });

        // Add RAW_CONSUMPTION movement
        await tx.movements.create({
          id: uuidv4(),
          companyId: user.companyId,
          docNo: `CON-${Date.now()}`,
          type: 'RAW_CONSUMPTION',
          itemKind: 'RAW_MATERIAL',
          itemId: rawMaterial.id,
          itemName: rawMaterial.name,
          quantityQty: requiredRawQty,
          fromLocation: 'WORKSHOP',
          toLocation: 'LOSS', // consumed logically goes away
          productionOrderId: order.id,
          productionBatchId: batchId,
          createdByUserId: user.id,
          createdByName: user.name,
          createdAt: now
        });
      }

      // Increase Finished Goods
      const product = await tx.finishedProducts.findById(order.finishedProductId, user.companyId);
      if (product && input.acceptedQty > 0) {
        await tx.finishedProducts.update(product.id, user.companyId, {
          stockQty: product.stockQty + input.acceptedQty
        });
        
        await tx.movements.create({
          id: uuidv4(),
          companyId: user.companyId,
          docNo: `FR-${Date.now()}`,
          type: 'FINISHED_RELEASE',
          itemKind: 'FINISHED_PRODUCT',
          itemId: product.id,
          itemName: product.name,
          quantityQty: input.acceptedQty,
          fromLocation: 'WORKSHOP', 
          toLocation: 'FINISHED_WAREHOUSE',
          productionOrderId: order.id,
          productionBatchId: batchId,
          createdByUserId: user.id,
          createdByName: user.name,
          createdAt: now
        });
      }

      // Rejected Qty -> Loss
      if (input.rejectedQty > 0 && input.lossReason) {
        const docNo = `WJ-${Date.now()}`;
        await tx.movements.create({
          id: uuidv4(),
          companyId: user.companyId,
          docNo,
          type: 'LOSS_WRITE_OFF',
          itemKind: 'FINISHED_PRODUCT',
          itemId: order.finishedProductId,
          itemName: order.finishedProductName,
          quantityQty: input.rejectedQty,
          fromLocation: 'WORKSHOP', 
          toLocation: 'LOSS',
          productionOrderId: order.id,
          productionBatchId: batchId,
          createdByUserId: user.id,
          createdByName: user.name,
          createdAt: now
        });
        
        await tx.losses.create({
          id: uuidv4(),
          companyId: user.companyId,
          docNo,
          itemKind: 'FINISHED_PRODUCT',
          itemId: order.finishedProductId,
          itemName: order.finishedProductName,
          reason: input.lossReason,
          quantityQty: input.rejectedQty,
          productionOrderId: order.id,
          productionBatchId: batchId,
          createdByUserId: user.id,
          createdByName: user.name,
          createdAt: now
        });
      }

      let yieldPercent = 0;
      const consumedRawQty = recipe.items.reduce((acc, item) => acc + (item.quantityQty * input.producedQty) / recipe.outputQty, 0);
      if (consumedRawQty > 0) {
        yieldPercent = (input.acceptedQty / consumedRawQty) * 100;
      }

      const batch: SausageProductionBatchDto = {
        id: batchId,
        companyId: user.companyId,
        batchNo: `BAT-${Date.now()}`,
        productionOrderId: order.id,
        productionOrderNumber: order.number,
        finishedProductId: order.finishedProductId,
        finishedProductName: order.finishedProductName,
        producedQty: input.producedQty,
        acceptedQty: input.acceptedQty,
        rejectedQty: input.rejectedQty,
        yieldPercent: yieldPercent,
        status: 'RELEASED',
        qualityStatus: 'NOT_CHECKED',
        releasedAt: now,
        createdAt: now,
        updatedAt: now
      };
      
      const createdBatch = await tx.batches.create(batch);

      await tx.orders.update(order.id, user.companyId, {
        status: input.acceptedQty >= order.quantityQty ? 'ACCEPTED' : 'RELEASED',
        updatedAt: now
      });

      return createdBatch;
    });
  }
}

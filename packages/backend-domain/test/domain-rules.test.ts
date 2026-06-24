import { describe, it, expect, beforeEach } from 'vitest';
import { SausageStockService } from '../src/services/SausageStockService';
import { SausageProductionService } from '../src/services/SausageProductionService';
import { InMemoryRepositories } from '../src/repositories/InMemoryRepositories';
import { SAUSAGE_ERROR_CODES } from 'sausage-shared-types';

describe('Sausage Production Domain Rules', () => {
  let repos: InMemoryRepositories;
  let stockService: SausageStockService;
  let productionService: SausageProductionService;

  beforeEach(async () => {
    repos = new InMemoryRepositories();
    const authPort = {
      getCurrentUser: () => ({ id: 'u1', companyId: 'c1', role: 'admin', name: 'Admin' }),
      requireRole: () => {},
      getCompanyScope: () => 'c1'
    };
    stockService = new SausageStockService(repos, authPort);
    productionService = new SausageProductionService(repos, authPort);

    // Initial seed
    await repos.rawMaterials.create({
      id: 'raw-1',
      companyId: 'c1',
      name: 'Beef',
      group: 'meat',
      unit: 'kg',
      warehouseQty: 200,
      workshopQty: 0,
      reservedQty: 0,
      minQty: 10,
      status: 'OK',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    await repos.finishedProducts.create({
      id: 'prod-1',
      companyId: 'c1',
      name: 'Beef Sausage',
      sku: 'SKU-001',
      unit: 'kg',
      stockQty: 0,
      reservedQty: 0,
      status: 'OK',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    await repos.recipes.create({
      id: 'rec-1',
      companyId: 'c1',
      finishedProductId: 'prod-1',
      finishedProductName: 'Beef Sausage',
      outputQty: 100,
      expectedYieldPercent: 90,
      items: [
        { id: 'ri-1', rawMaterialId: 'raw-1', rawMaterialName: 'Beef', quantityQty: 110 }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });

  it('prohibits negative stock on raw material transfer', async () => {
    await expect(stockService.transferToWorkshop('raw-1', {
      rawMaterialId: 'raw-1',
      quantityQty: 300
    })).rejects.toMatchObject({
      error: { code: SAUSAGE_ERROR_CODES.NEGATIVE_STOCK_FORBIDDEN }
    });
  });

  it('transfers raw material: warehouse decreases, workshop increases', async () => {
    await stockService.transferToWorkshop('raw-1', { rawMaterialId: 'raw-1', quantityQty: 50 });
    const raw = await repos.rawMaterials.findById('raw-1', 'c1');
    expect(raw?.warehouseQty).toBe(150);
    expect(raw?.workshopQty).toBe(50);

    const movements = await repos.movements.findMany('c1');
    const movement = movements.find(m => m.type === 'RAW_TRANSFER_TO_WORKSHOP');
    expect(movement).toBeDefined();
    expect(movement?.quantityQty).toBe(50);
  });

  it('rejects batch release if accepted + rejected > produced', async () => {
    const order = await productionService.createOrder({ finishedProductId: 'prod-1', quantityQty: 100 });
    await productionService.startOrder(order.id, { productionOrderId: order.id });

    await expect(productionService.releaseBatch({
      productionOrderId: order.id,
      producedQty: 100,
      acceptedQty: 90,
      rejectedQty: 20
    })).rejects.toMatchObject({
      error: { code: SAUSAGE_ERROR_CODES.RELEASE_QTY_INVALID }
    });
  });

  it('batch release decreases workshop raw materials and increases finished goods', async () => {
    // 1. Transfer raw to workshop
    await stockService.transferToWorkshop('raw-1', { rawMaterialId: 'raw-1', quantityQty: 110 });

    // 2. Create and start order
    const order = await productionService.createOrder({ finishedProductId: 'prod-1', quantityQty: 100 });
    await productionService.startOrder(order.id, { productionOrderId: order.id });

    // 3. Release batch
    const batch = await productionService.releaseBatch({
      productionOrderId: order.id,
      producedQty: 100,
      acceptedQty: 95,
      rejectedQty: 0
    });

    expect(batch.acceptedQty).toBe(95);

    // Workshop raw should decrease by 110 (from recipe)
    const raw = await repos.rawMaterials.findById('raw-1', 'c1');
    expect(raw?.workshopQty).toBe(0); // 110 - 110 = 0

    // Finished product should increase by 95
    const prod = await repos.finishedProducts.findById('prod-1', 'c1');
    expect(prod?.stockQty).toBe(95);

    // Check movements
    const movements = await repos.movements.findMany('c1');
    const consumedMovement = movements.find(m => m.type === 'RAW_CONSUMPTION');
    expect(consumedMovement?.quantityQty).toBe(110);

    const releaseMovement = movements.find(m => m.type === 'FINISHED_RELEASE');
    expect(releaseMovement?.quantityQty).toBe(95);
    expect(releaseMovement?.productionBatchId).toBe(batch.id);
  });

  it('loss write-off creates movement and loss record', async () => {
    await stockService.writeOffStock({
      itemKind: 'RAW_MATERIAL',
      itemId: 'raw-1',
      location: 'RAW_WAREHOUSE',
      quantityQty: 10,
      reason: 'DEFECT'
    });

    const raw = await repos.rawMaterials.findById('raw-1', 'c1');
    expect(raw?.warehouseQty).toBe(190);

    const movements = await repos.movements.findMany('c1');
    const movement = movements.find(m => m.type === 'LOSS_WRITE_OFF');
    expect(movement).toBeDefined();

    const losses = await repos.losses.findMany('c1');
    const loss = losses[0];
    expect(loss).toBeDefined();
    expect(loss.reason).toBe('DEFECT');
    expect(loss.quantityQty).toBe(10);
  });

  it('batch release with rejected qty creates loss', async () => {
    // Transfer 110 to workshop
    await stockService.transferToWorkshop('raw-1', { rawMaterialId: 'raw-1', quantityQty: 110 });

    const order = await productionService.createOrder({ finishedProductId: 'prod-1', quantityQty: 100 });
    await productionService.startOrder(order.id, { productionOrderId: order.id });

    await productionService.releaseBatch({
      productionOrderId: order.id,
      producedQty: 100,
      acceptedQty: 90,
      rejectedQty: 10,
      lossReason: 'DEFECT'
    });

    const losses = await repos.losses.findMany('c1');
    const loss = losses[0];
    expect(loss).toBeDefined();
    expect(loss.quantityQty).toBe(10);
    expect(loss.reason).toBe('DEFECT');
    expect(loss.productionBatchId).toBeDefined();
  });

  it('marks order as accepted when accepted quantity covers requested quantity', async () => {
    await stockService.transferToWorkshop('raw-1', { rawMaterialId: 'raw-1', quantityQty: 110 });

    const order = await productionService.createOrder({ finishedProductId: 'prod-1', quantityQty: 95 });
    await productionService.startOrder(order.id, { productionOrderId: order.id });

    await productionService.releaseBatch({
      productionOrderId: order.id,
      producedQty: 100,
      acceptedQty: 95,
      rejectedQty: 0
    });

    const updatedOrder = await repos.orders.findById(order.id, 'c1');
    expect(updatedOrder?.status).toBe('ACCEPTED');
  });

  it('isolates write operations by tenant', async () => {
    await repos.rawMaterials.create({
      id: 'raw-c2',
      companyId: 'c2',
      name: 'Other Tenant Beef',
      group: 'meat',
      unit: 'kg',
      warehouseQty: 200,
      workshopQty: 0,
      reservedQty: 0,
      minQty: 10,
      status: 'OK',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    await expect(stockService.transferToWorkshop('raw-c2', {
      rawMaterialId: 'raw-c2',
      quantityQty: 10
    })).rejects.toMatchObject({
      error: { code: SAUSAGE_ERROR_CODES.NOT_FOUND }
    });

    const rawC2 = await repos.rawMaterials.findById('raw-c2', 'c2');
    expect(rawC2?.warehouseQty).toBe(200);
    expect(rawC2?.workshopQty).toBe(0);
  });
});

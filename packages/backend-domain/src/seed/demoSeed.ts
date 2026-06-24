import { SausageRepositories } from '../repositories/SausageRepositories';
import type {
  SausageClientDto,
  SausageFinishedProductDto,
  SausageProductionOrderDto,
  SausageRawMaterialDto,
  SausageRecipeDto
} from 'sausage-shared-types';

export const DEMO_COMPANY_ID = 'demo-company';

export async function seedDemoSausageData(repos: SausageRepositories, companyId = DEMO_COMPANY_ID): Promise<void> {
  const now = new Date().toISOString();

  const raw1: SausageRawMaterialDto = {
    id: 'raw-1',
    companyId,
    name: 'Мясо говяжье (лопатка)',
    group: 'Мясо',
    unit: 'kg',
    warehouseQty: 1500,
    workshopQty: 300,
    reservedQty: 0,
    minQty: 500,
    status: 'OK',
    supplierName: 'Demo Supplier',
    createdAt: now,
    updatedAt: now
  };

  if (await repos.rawMaterials.findById(raw1.id, companyId)) {
    await repos.rawMaterials.update(raw1.id, companyId, raw1);
  } else {
    await repos.rawMaterials.create(raw1);
  }
  
  const raw2: SausageRawMaterialDto = {
    id: 'raw-2',
    companyId,
    name: 'Соль нитритная',
    group: 'Специи',
    unit: 'kg',
    warehouseQty: 35,
    workshopQty: 6,
    reservedQty: 0,
    minQty: 50,
    status: 'LOW',
    supplierName: 'Demo Supplier',
    createdAt: now,
    updatedAt: now
  };

  if (await repos.rawMaterials.findById(raw2.id, companyId)) {
    await repos.rawMaterials.update(raw2.id, companyId, raw2);
  } else {
    await repos.rawMaterials.create(raw2);
  }

  const product: SausageFinishedProductDto = {
    id: 'prod-1',
    companyId,
    name: 'Колбаса Докторская',
    sku: 'DOC-001',
    unit: 'kg',
    stockQty: 450,
    stockPcs: 900,
    reservedQty: 0,
    shelfLifeDays: 30,
    status: 'OK',
    createdAt: now,
    updatedAt: now
  };

  if (await repos.finishedProducts.findById(product.id, companyId)) {
    await repos.finishedProducts.update(product.id, companyId, product);
  } else {
    await repos.finishedProducts.create(product);
  }

  const client: SausageClientDto = {
    id: 'client-1',
    companyId,
    name: 'Demo Client',
    segment: 'RETAIL',
    phone: '+992 900 00 00 00',
    balanceAmount: 0,
    balanceCurrency: 'TJS',
    lastOrderAt: now,
    createdAt: now,
    updatedAt: now
  };

  if (!(await repos.clients.findById(client.id, companyId))) {
    await repos.clients.create(client);
  }

  const recipe: SausageRecipeDto = {
    id: 'rec-1',
    companyId,
    finishedProductId: 'prod-1',
    finishedProductName: 'Колбаса Докторская',
    outputQty: 100,
    expectedYieldPercent: 95,
    items: [
      { id: 'ri-1', rawMaterialId: 'raw-1', rawMaterialName: 'Мясо говяжье (лопатка)', quantityQty: 105 },
      { id: 'ri-2', rawMaterialId: 'raw-2', rawMaterialName: 'Соль нитритная', quantityQty: 2 }
    ],
    createdAt: now,
    updatedAt: now
  };

  if (await repos.recipes.findByFinishedProductId(recipe.finishedProductId, companyId)) {
    await repos.recipes.update(recipe.id, companyId, recipe);
  } else {
    await repos.recipes.create(recipe);
  }

  const order: SausageProductionOrderDto = {
    id: 'ord-1',
    companyId,
    number: 'PO-2026-001',
    finishedProductId: 'prod-1',
    finishedProductName: 'Колбаса Докторская',
    quantityQty: 200,
    clientId: 'client-1',
    clientName: 'Demo Client',
    status: 'IN_PROGRESS',
    progressPercent: 50,
    dueAt: now,
    shift: 'Утро',
    externalOrderId: undefined,
    createdAt: now,
    updatedAt: now
  };

  if (await repos.orders.findById(order.id, companyId)) {
    await repos.orders.update(order.id, companyId, order);
  } else {
    await repos.orders.create(order);
  }

  const batches = await repos.batches.findMany(companyId);
  if (!batches.some(batch => batch.id === 'batch-1')) {
    await repos.batches.create({
      id: 'batch-1',
      companyId,
      batchNo: 'BAT-2026-001',
      productionOrderId: 'ord-1',
      productionOrderNumber: 'PO-2026-001',
      finishedProductId: 'prod-1',
      finishedProductName: 'Колбаса Докторская',
      producedQty: 100,
      acceptedQty: 95,
      rejectedQty: 5,
      yieldPercent: 90.5,
      releasedAt: now,
      createdAt: now,
      updatedAt: now
    });
  }

  const movements = await repos.movements.findMany(companyId);
  if (!movements.some(movement => movement.id === 'mov-1')) {
    await repos.movements.create({
      id: 'mov-1',
      companyId,
      docNo: 'TR-2026-001',
      type: 'RAW_TRANSFER_TO_WORKSHOP',
      itemKind: 'RAW_MATERIAL',
      itemId: 'raw-1',
      itemName: 'Мясо говяжье (лопатка)',
      quantityQty: 300,
      fromLocation: 'RAW_WAREHOUSE',
      toLocation: 'WORKSHOP',
      productionOrderId: 'ord-1',
      productionBatchId: undefined,
      createdByUserId: 'dev-user',
      createdByName: 'Dev Admin',
      createdAt: now,
      reason: undefined
    });
  }

  const losses = await repos.losses.findMany(companyId);
  if (!losses.some(loss => loss.id === 'loss-1')) {
    await repos.losses.create({
      id: 'loss-1',
      companyId,
      docNo: 'WJ-2026-001',
      itemKind: 'FINISHED_PRODUCT',
      itemId: 'prod-1',
      itemName: 'Колбаса Докторская',
      reason: 'TRIMMING',
      quantityQty: 5,
      costAmount: 25,
      costCurrency: 'TJS',
      productionOrderId: 'ord-1',
      productionBatchId: 'batch-1',
      createdByUserId: 'dev-user',
      createdByName: 'Dev Admin',
      createdAt: now
    });
  }
}

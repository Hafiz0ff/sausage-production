import { InMemoryRepositories } from '../repositories/InMemoryRepositories';

export const DEMO_COMPANY_ID = 'demo-company';

export function seedDemoSausageData(repos: InMemoryRepositories, companyId = DEMO_COMPANY_ID): void {
  const now = new Date().toISOString();

  repos.rawMaterials.push(
    {
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
    },
    {
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
    }
  );

  repos.finishedProducts.push({
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
  });

  repos.clients.push({
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
  });

  repos.recipes.push({
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
  });

  repos.orders.push({
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
    createdAt: now,
    updatedAt: now
  });

  repos.batches.push({
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

  repos.movements.push({
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
    createdByUserId: 'dev-user',
    createdByName: 'Dev Admin',
    createdAt: now
  });

  repos.losses.push({
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

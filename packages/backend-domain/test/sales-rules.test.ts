import { describe, expect, it, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { InMemoryRepositories } from '../src/repositories/InMemoryRepositories';

describe('Sausage Sales Orders and Reservations', () => {
  let repos: InMemoryRepositories;
  let app: ReturnType<typeof createApp>;

  beforeEach(async () => {
    repos = new InMemoryRepositories();
    app = createApp(repos, {
      getCurrentUser: () => ({ id: 'u1', companyId: 'c1', role: 'admin', name: 'Admin' }),
      requireRole: () => {},
      getCompanyScope: () => 'c1'
    });

    const now = new Date().toISOString();
    await repos.finishedProducts.create({
      id: 'prod-1',
      companyId: 'c1',
      name: 'Beef Sausage',
      sku: 'SKU-001',
      unit: 'kg',
      stockQty: 100,
      reservedQty: 0,
      status: 'OK',
      createdAt: now,
      updatedAt: now
    });

    await repos.finishedProducts.create({
      id: 'prod-c2',
      companyId: 'c2',
      name: 'Other Tenant Product',
      sku: 'SKU-C2',
      unit: 'kg',
      stockQty: 100,
      reservedQty: 0,
      status: 'OK',
      createdAt: now,
      updatedAt: now
    });
  });

  async function createAndConfirmOrder(quantityQty: number) {
    const createResponse = await request(app)
      .post('/api/sausage-production/sales-orders')
      .send({
        clientId: 'client-1',
        clientName: 'Client One',
        items: [{ finishedProductId: 'prod-1', quantityQty }]
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.companyId).toBe('c1');
    expect(createResponse.body.items).toHaveLength(1);

    const confirmResponse = await request(app)
      .post(`/api/sausage-production/sales-orders/${createResponse.body.id}/confirm`)
      .send({});

    expect(confirmResponse.status).toBe(200);
    expect(confirmResponse.body.status).toBe('CONFIRMED');
    return confirmResponse.body;
  }

  it('creates sales orders in auth company scope, not request header scope', async () => {
    const response = await request(app)
      .post('/api/sausage-production/sales-orders')
      .set('x-company-id', 'c2')
      .send({
        clientName: 'Header Spoof',
        items: [{ finishedProductId: 'prod-1', quantityQty: 10 }]
      });

    expect(response.status).toBe(201);
    expect(response.body.companyId).toBe('c1');
    expect(await repos.salesOrders.findMany('c2')).toHaveLength(0);
  });

  it('rejects over-reservation when partial reservation is not allowed', async () => {
    const order = await createAndConfirmOrder(120);

    const response = await request(app)
      .post(`/api/sausage-production/sales-orders/${order.id}/reserve`)
      .send({
        salesOrderItemId: order.items[0].id,
        quantityQty: 120,
        allowPartial: false
      });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('SAUSAGE_INSUFFICIENT_STOCK');
  });

  it('reserves, releases, and completes finished goods without negative balances', async () => {
    const order = await createAndConfirmOrder(100);

    const reserveResponse = await request(app)
      .post(`/api/sausage-production/sales-orders/${order.id}/reserve`)
      .send({
        salesOrderItemId: order.items[0].id,
        quantityQty: 100
      });

    expect(reserveResponse.status).toBe(201);
    expect(reserveResponse.body.status).toBe('ACTIVE');

    const productAfterReserve = await repos.finishedProducts.findById('prod-1', 'c1');
    expect(productAfterReserve?.stockQty).toBe(100);
    expect(productAfterReserve?.reservedQty).toBe(100);

    const reservedOrder = await repos.salesOrders.findById(order.id, 'c1');
    expect(reservedOrder?.status).toBe('RESERVED');

    const releaseResponse = await request(app)
      .post(`/api/sausage-production/reservations/${reserveResponse.body.id}/release`)
      .send({ reason: 'Customer changed order' });

    expect(releaseResponse.status).toBe(200);
    expect(releaseResponse.body.status).toBe('RELEASED');

    const productAfterRelease = await repos.finishedProducts.findById('prod-1', 'c1');
    expect(productAfterRelease?.reservedQty).toBe(0);

    const orderAfterRelease = await repos.salesOrders.findById(order.id, 'c1');
    expect(orderAfterRelease?.status).toBe('CONFIRMED');

    const secondReserveResponse = await request(app)
      .post(`/api/sausage-production/sales-orders/${order.id}/reserve`)
      .send({
        salesOrderItemId: order.items[0].id,
        quantityQty: 100
      });

    const completeResponse = await request(app)
      .post(`/api/sausage-production/reservations/${secondReserveResponse.body.id}/complete`)
      .send({});

    expect(completeResponse.status).toBe(200);
    expect(completeResponse.body.status).toBe('COMPLETED');

    const productAfterComplete = await repos.finishedProducts.findById('prod-1', 'c1');
    expect(productAfterComplete?.stockQty).toBe(0);
    expect(productAfterComplete?.reservedQty).toBe(0);

    const completedOrder = await repos.salesOrders.findById(order.id, 'c1');
    expect(completedOrder?.status).toBe('COMPLETED');
  });

  it('calculates production demand shortage and creates a production order from demand', async () => {
    const order = await createAndConfirmOrder(150);

    const demandResponse = await request(app).get('/api/sausage-production/production-demand');
    expect(demandResponse.status).toBe(200);
    const demand = demandResponse.body.find((item: any) => item.finishedProductId === 'prod-1');
    expect(demand.requiredQty).toBe(150);
    expect(demand.availableQty).toBe(100);
    expect(demand.shortageQty).toBe(50);
    expect(demand.suggestedProductionQty).toBe(50);

    const createProductionResponse = await request(app)
      .post('/api/sausage-production/production-demand/create-production-order')
      .send({
        finishedProductId: 'prod-1',
        quantityQty: 50,
        salesOrderId: order.id,
        salesOrderItemId: order.items[0].id
      });

    expect(createProductionResponse.status).toBe(201);
    const productionOrders = await repos.orders.findMany('c1');
    expect(productionOrders).toHaveLength(1);
    expect(productionOrders[0].finishedProductId).toBe('prod-1');
    expect(productionOrders[0].quantityQty).toBe(50);

    const updatedOrder = await repos.salesOrders.findById(order.id, 'c1');
    expect(updatedOrder?.status).toBe('IN_PRODUCTION');
  });
});

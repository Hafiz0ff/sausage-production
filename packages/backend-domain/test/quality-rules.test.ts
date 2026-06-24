import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { InMemoryRepositories } from '../src/repositories/InMemoryRepositories';
import { SausageProductionBatchDto } from 'sausage-shared-types';

describe('Sausage Batch Quality and Loss Control', () => {
  let repos: InMemoryRepositories;
  let app: ReturnType<typeof createApp>;

  beforeEach(async () => {
    repos = new InMemoryRepositories();
    app = createApp(repos, {
      getCurrentUser: () => ({ id: 'quality-user', companyId: 'c1', role: 'admin', name: 'Quality Admin' }),
      requireRole: () => {},
      getCompanyScope: () => 'c1'
    });
  });

  async function createBatch(overrides: Partial<SausageProductionBatchDto> = {}) {
    const now = new Date().toISOString();
    return repos.batches.create({
      id: overrides.id || 'batch-1',
      companyId: overrides.companyId || 'c1',
      batchNo: overrides.batchNo || 'BAT-001',
      productionOrderId: overrides.productionOrderId || 'order-1',
      productionOrderNumber: overrides.productionOrderNumber || 'PO-001',
      finishedProductId: overrides.finishedProductId || 'prod-1',
      finishedProductName: overrides.finishedProductName || 'Doctor Sausage',
      producedQty: overrides.producedQty ?? 100,
      acceptedQty: overrides.acceptedQty ?? 95,
      rejectedQty: overrides.rejectedQty ?? 5,
      yieldPercent: overrides.yieldPercent ?? 90,
      status: overrides.status || 'RELEASED',
      qualityStatus: overrides.qualityStatus || 'NOT_CHECKED',
      plannedQty: overrides.plannedQty,
      varianceQty: overrides.varianceQty,
      variancePercent: overrides.variancePercent,
      masterUserId: overrides.masterUserId,
      masterName: overrides.masterName,
      operatorUserId: overrides.operatorUserId,
      operatorName: overrides.operatorName,
      qualityCheckedByUserId: overrides.qualityCheckedByUserId,
      qualityCheckedByName: overrides.qualityCheckedByName,
      qualityCheckedAt: overrides.qualityCheckedAt,
      qualityNote: overrides.qualityNote,
      releasedAt: overrides.releasedAt || now,
      createdAt: overrides.createdAt || now,
      updatedAt: overrides.updatedAt || now
    });
  }

  it('rejects invalid quality quantities', async () => {
    await createBatch();

    const response = await request(app)
      .post('/api/sausage-production/batches/batch-1/quality-check')
      .send({ checkedQty: 100, acceptedQty: -1, rejectedQty: 0 });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('SAUSAGE_VALIDATION_ERROR');
  });

  it('marks passed quality as accepted', async () => {
    await createBatch();

    const response = await request(app)
      .post('/api/sausage-production/batches/batch-1/quality-check')
      .send({ checkedQty: 100, acceptedQty: 100, rejectedQty: 0, note: 'OK' });

    expect(response.status).toBe(201);
    expect(response.body.qualityStatus).toBe('PASSED');

    const batch = await repos.batches.findById('batch-1', 'c1');
    expect(batch?.status).toBe('ACCEPTED');
    expect(batch?.qualityStatus).toBe('PASSED');
    expect(batch?.qualityCheckedByUserId).toBe('quality-user');
  });

  it('marks failed quality as rejected and creates a quality loss', async () => {
    await createBatch();

    const response = await request(app)
      .post('/api/sausage-production/batches/batch-1/quality-check')
      .send({ checkedQty: 100, acceptedQty: 0, rejectedQty: 100, note: 'Failed sample' });

    expect(response.status).toBe(201);
    expect(response.body.qualityStatus).toBe('FAILED');

    const batch = await repos.batches.findById('batch-1', 'c1');
    expect(batch?.status).toBe('REJECTED');
    expect(batch?.qualityStatus).toBe('FAILED');

    const losses = await repos.losses.findMany('c1');
    expect(losses).toHaveLength(1);
    expect(losses[0].reason).toBe('QUALITY_REJECT');
    expect(losses[0].category).toBe('QUALITY_REJECT');
    expect(losses[0].stage).toBe('QUALITY_CONTROL');
    expect(losses[0].quantityQty).toBe(100);
  });

  it('marks partial quality as partially accepted and creates a loss for rejected qty', async () => {
    await createBatch();

    const response = await request(app)
      .post('/api/sausage-production/batches/batch-1/quality-check')
      .send({ checkedQty: 100, acceptedQty: 80, rejectedQty: 20, note: 'Partial accept' });

    expect(response.status).toBe(201);
    expect(response.body.qualityStatus).toBe('PARTIAL');

    const batch = await repos.batches.findById('batch-1', 'c1');
    expect(batch?.status).toBe('PARTIALLY_ACCEPTED');
    expect(batch?.qualityStatus).toBe('PARTIAL');

    const losses = await repos.losses.findMany('c1');
    expect(losses).toHaveLength(1);
    expect(losses[0].quantityQty).toBe(20);
  });

  it('approves losses without changing stock quantities', async () => {
    await repos.losses.create({
      id: 'loss-1',
      companyId: 'c1',
      docNo: 'LOSS-001',
      itemKind: 'FINISHED_PRODUCT',
      itemId: 'prod-1',
      itemName: 'Doctor Sausage',
      reason: 'QUALITY_REJECT',
      category: 'QUALITY_REJECT',
      stage: 'QUALITY_CONTROL',
      quantityQty: 10,
      createdByUserId: 'quality-user',
      createdByName: 'Quality Admin',
      createdAt: new Date().toISOString()
    });

    const response = await request(app)
      .post('/api/sausage-production/losses/loss-1/approve')
      .send({ note: 'Approved' });

    expect(response.status).toBe(200);
    expect(response.body.approvedByUserId).toBe('quality-user');
    expect(response.body.approvedByName).toBe('Quality Admin');
    expect(response.body.quantityQty).toBe(10);
  });

  it('isolates quality checks by tenant', async () => {
    await createBatch({ id: 'batch-c2', companyId: 'c2' });

    const response = await request(app)
      .post('/api/sausage-production/batches/batch-c2/quality-check')
      .send({ checkedQty: 100, acceptedQty: 100, rejectedQty: 0 });

    expect(response.status).toBe(404);
    expect(await repos.qualityChecks.findMany('c1')).toHaveLength(0);
  });
});

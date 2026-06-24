import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { SAUSAGE_ERROR_CODES } from 'sausage-shared-types';
import { createApp } from '../src/app';
import { InMemoryRepositories } from '../src/repositories/InMemoryRepositories';

describe('TZ-008 Documents and Audit API', () => {
  let app: any;
  let repos: InMemoryRepositories;

  beforeEach(async () => {
    repos = new InMemoryRepositories();
    const authPort = {
      getCurrentUser: () => ({ id: 'u1', companyId: 'c1', role: 'admin', name: 'Admin User' }),
      requireRole: () => {},
      getCompanyScope: () => 'c1'
    };

    await repos.rawMaterials.create({
      id: 'raw-1',
      companyId: 'c1',
      name: 'Beef',
      group: 'meat',
      unit: 'kg',
      warehouseQty: 100,
      workshopQty: 20,
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
      stockQty: 15,
      reservedQty: 0,
      status: 'OK',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    app = createApp(repos, authPort);
  });

  it('creates and posts a raw receipt document through TZ-008 endpoints', async () => {
    const createResponse = await request(app)
      .post('/api/sausage-production/documents/raw-receipt')
      .set('x-company-id', 'spoofed-company')
      .send({
        supplierName: 'Supplier',
        externalDocumentNo: 'SUP-1',
        lines: [{ rawMaterialId: 'raw-1', quantityQty: 25 }]
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.companyId).toBe('c1');
    expect(createResponse.body.type).toBe('RAW_RECEIPT');
    expect(createResponse.body.status).toBe('DRAFT');

    const postResponse = await request(app)
      .post(`/api/sausage-production/documents/${createResponse.body.id}/post`)
      .send({ note: 'posted' });

    expect(postResponse.status).toBe(200);
    expect(postResponse.body.status).toBe('POSTED');

    const raw = await repos.rawMaterials.findById('raw-1', 'c1');
    expect(raw?.warehouseQty).toBe(125);

    const printResponse = await request(app).get(`/api/sausage-production/documents/${createResponse.body.id}/print-view`);
    expect(printResponse.status).toBe(200);
    expect(printResponse.body.html).toContain(createResponse.body.number);

    const auditResponse = await request(app).get('/api/sausage-production/audit-log');
    expect(auditResponse.status).toBe(200);
    expect(auditResponse.body.map((log: any) => log.action)).toEqual(
      expect.arrayContaining(['DOCUMENT_CREATED', 'DOCUMENT_POSTED', 'RAW_RECEIVED'])
    );

    const entityAuditResponse = await request(app).get(`/api/sausage-production/audit-log/entity/DOCUMENT/${createResponse.body.id}`);
    expect(entityAuditResponse.status).toBe(200);
    expect(entityAuditResponse.body.length).toBeGreaterThan(0);
  });

  it('rejects negative stock when posting write-off documents', async () => {
    const createResponse = await request(app)
      .post('/api/sausage-production/documents/write-off')
      .send({
        lines: [{
          itemKind: 'RAW_MATERIAL',
          itemId: 'raw-1',
          quantityQty: 999,
          fromLocation: 'WORKSHOP',
          reason: 'TRIMMING'
        }]
      });

    expect(createResponse.status).toBe(201);

    const postResponse = await request(app)
      .post(`/api/sausage-production/documents/${createResponse.body.id}/post`)
      .send({});

    expect(postResponse.status).toBe(409);
    expect(postResponse.body.error.code).toBe(SAUSAGE_ERROR_CODES.NEGATIVE_STOCK_FORBIDDEN);

    const raw = await repos.rawMaterials.findById('raw-1', 'c1');
    expect(raw?.workshopQty).toBe(20);
  });

  it('keeps forbidden document and audit namespaces unavailable', async () => {
    await expect(request(app).get('/api/documents')).resolves.toHaveProperty('status', 404);
    await expect(request(app).get('/api/audit')).resolves.toHaveProperty('status', 404);
    await expect(request(app).get('/api/sausage-production/audit-logs')).resolves.toHaveProperty('status', 404);
  });
});

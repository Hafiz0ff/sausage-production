import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { InMemoryRepositories } from '../src/repositories/InMemoryRepositories';
import { DEMO_COMPANY_ID, seedDemoSausageData } from '../src/seed/demoSeed';

describe('Dev Server Seed Data & Endpoints', () => {
  it('serves seed data through endpoints', async () => {
    const repos = new InMemoryRepositories();
    const companyId = DEMO_COMPANY_ID;
    seedDemoSausageData(repos, companyId);

    const app = createApp(repos, {
      getCurrentUser: () => ({ id: 'dev', companyId, role: 'admin', name: 'Dev Admin' }),
      requireRole: () => {},
      getCompanyScope: () => companyId,
    });

    // Test raw-materials endpoint
    const response = await request(app).get('/api/sausage-production/raw-materials');
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(1);
    expect(response.body.some((item: any) => item.id === 'raw-1')).toBe(true);

    // Test dashboard endpoint
    const dashboardResponse = await request(app).get('/api/sausage-production/dashboard');
    expect(dashboardResponse.status).toBe(200);
    expect(dashboardResponse.body.metrics).toBeDefined();
    expect(dashboardResponse.body.metrics.length).toBeGreaterThan(0);
    expect(dashboardResponse.body.finishedProducts.length).toBeGreaterThan(0);

    const endpoints = [
      '/api/sausage-production/finished-products',
      '/api/sausage-production/recipes',
      '/api/sausage-production/clients',
      '/api/sausage-production/orders',
      '/api/sausage-production/batches',
      '/api/sausage-production/stock-movements',
      '/api/sausage-production/losses'
    ];

    for (const endpoint of endpoints) {
      const endpointResponse = await request(app).get(endpoint);
      expect(endpointResponse.status, endpoint).toBe(200);
      expect(endpointResponse.body, endpoint).toBeInstanceOf(Array);
      expect(endpointResponse.body.length, endpoint).toBeGreaterThan(0);
    }
    
    // Command mutation check (Transfer)
    const transferResponse = await request(app)
      .post('/api/sausage-production/raw-materials/raw-1/transfer-to-workshop')
      .send({ rawMaterialId: 'raw-1', quantityQty: 50 });
      
    expect(transferResponse.status).toBe(200);

    // Verify it changed workshopQty
    const rawMaterialsAfter = await request(app).get('/api/sausage-production/raw-materials');
    const updatedRaw = rawMaterialsAfter.body.find((r: any) => r.id === 'raw-1');
    expect(updatedRaw.workshopQty).toBe(350); // 300 + 50
  });
});

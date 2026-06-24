import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { InMemoryRepositories } from '../src/repositories/InMemoryRepositories';

describe('API Namespace rules', () => {
  let app: any;
  let repos: InMemoryRepositories;
  
  beforeEach(() => {
    repos = new InMemoryRepositories();
    const authPort = {
      getCurrentUser: () => ({ id: 'u1', companyId: 'c1', role: 'admin' }),
      requireRole: () => {},
      getCompanyScope: () => 'c1'
    };
    app = createApp(repos, authPort);
  });

  it('should have routes under /api/sausage-production', async () => {
    const res = await request(app).get('/api/sausage-production/dashboard');
    expect(res.status).toBe(200);
  });

  it('should not expose any /api/production routes', async () => {
    const res = await request(app).get('/api/production/dashboard');
    expect(res.status).toBe(404);
  });
});

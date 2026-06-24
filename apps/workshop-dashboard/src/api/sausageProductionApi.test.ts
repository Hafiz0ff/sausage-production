import { describe, expect, it } from 'vitest';
import { buildSausageProductionUrl, SAUSAGE_PRODUCTION_API_NAMESPACE } from './sausageProductionApi';

describe('sausage production API namespace', () => {
  it('uses the standalone sausage-production namespace', () => {
    expect(SAUSAGE_PRODUCTION_API_NAMESPACE).toBe('/api/sausage-production');
    expect(buildSausageProductionUrl('/dashboard')).toBe('/api/sausage-production/dashboard');
  });

  it('does not use the legacy Siyoma production namespace', () => {
    expect(buildSausageProductionUrl('/orders')).not.toContain('/api/production');
  });
});

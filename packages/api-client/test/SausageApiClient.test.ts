import { describe, expect, it, vi } from 'vitest';
import { SausageApiClient } from '../src/SausageApiClient';
import { SAUSAGE_ERROR_CODES } from 'sausage-shared-types';

// Mock the global fetch
global.fetch = vi.fn();

describe('SausageApiClient', () => {
  it('builds URLs under /api/sausage-production', async () => {
    const client = new SausageApiClient();
    const mockResponse = { json: vi.fn().mockResolvedValue({}) };
    (global.fetch as any).mockResolvedValue({
      ok: true,
      ...mockResponse
    });

    await client.getDashboard();

    expect(global.fetch).toHaveBeenCalledWith('/api/sausage-production/dashboard', expect.any(Object));
  });

  it('rejects /api/production namespace at construction time', async () => {
    expect(() => new SausageApiClient('/api/production')).toThrow('/api/production');
  });

  it('propagates API error body', async () => {
    const client = new SausageApiClient();
    (global.fetch as any).mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ error: { code: SAUSAGE_ERROR_CODES.NEGATIVE_STOCK_FORBIDDEN } })
    });

    await expect(client.getRawMaterials()).rejects.toMatchObject({ error: { code: SAUSAGE_ERROR_CODES.NEGATIVE_STOCK_FORBIDDEN } });
  });

  it('calls command endpoints with JSON body', async () => {
    const client = new SausageApiClient();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({})
    });

    await client.transferRawToWorkshop('raw-1', { rawMaterialId: 'raw-1', quantityQty: 50 });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/sausage-production/raw-materials/raw-1/transfer-to-workshop',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ rawMaterialId: 'raw-1', quantityQty: 50 })
      })
    );
  });

  it('calls TZ-008 document and audit endpoints from the contract', async () => {
    const client = new SausageApiClient();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({})
    });

    await client.createRawReceiptDocument({
      lines: [{ rawMaterialId: 'raw-1', quantityQty: 10 }]
    });
    await client.getAuditLogs();

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/sausage-production/documents/raw-receipt',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ lines: [{ rawMaterialId: 'raw-1', quantityQty: 10 }] })
      })
    );
    expect(global.fetch).toHaveBeenCalledWith('/api/sausage-production/audit-log', expect.any(Object));
  });
});

import { mockSausageProductionData } from '../data/mockSausageProductionData';
import type { ModalKind, WorkshopDataset } from '../domain/types';

export const SAUSAGE_PRODUCTION_API_NAMESPACE = '/api/sausage-production';

export type SausageProductionEndpoint =
  | '/dashboard'
  | '/orders'
  | '/batches'
  | '/movements'
  | '/raw-materials'
  | '/finished-products'
  | '/recipes'
  | '/clients'
  | '/losses';

export function buildSausageProductionUrl(endpoint: SausageProductionEndpoint): string {
  return `${SAUSAGE_PRODUCTION_API_NAMESPACE}${endpoint}`;
}

export interface ApiActionResult {
  ok: true;
  message: string;
  kind: ModalKind;
}

const delay = (ms = 40) => new Promise((resolve) => window.setTimeout(resolve, ms));

export const sausageProductionApi = {
  async getDataset(): Promise<WorkshopDataset> {
    await delay();
    return structuredClone(mockSausageProductionData);
  },

  async submitAction(kind: ModalKind): Promise<ApiActionResult> {
    await delay();
    return {
      ok: true,
      kind,
      message: 'Операция сохранена в mock API',
    };
  },
};

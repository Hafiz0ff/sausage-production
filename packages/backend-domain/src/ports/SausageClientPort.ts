import { SausageClientDto } from 'sausage-shared-types';

export interface SausageClientPort {
  findClientById(clientId: string): Promise<SausageClientDto | null>;
  listClients(companyId: string, query?: any): Promise<SausageClientDto[]>;
}

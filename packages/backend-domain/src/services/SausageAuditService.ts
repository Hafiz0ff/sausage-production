import { 
  SausageAuditLogDto, 
  SausageAuditAction, 
  SausageAuditEntityKind,
  SausageAuditLogFilterDto
} from 'sausage-shared-types';
import { SausageRepositories } from '../repositories/SausageRepositories';
import { SausageAuthPort } from '../ports/SausageAuthPort';

export class SausageAuditService {
  constructor(
    private repos: SausageRepositories,
    private authPort: SausageAuthPort
  ) {}

  async logAction(
    companyId: string,
    action: SausageAuditAction,
    entityKind: SausageAuditEntityKind,
    entityId: string,
    userId: string,
    userName?: string,
    documentId?: string,
    beforeJson?: any,
    afterJson?: any,
    metadataJson?: any,
    reposOverride?: SausageRepositories
  ): Promise<SausageAuditLogDto> {
    const repos = reposOverride || this.repos;

    return repos.auditLogs.create({
      id: crypto.randomUUID(),
      companyId,
      action,
      entityKind,
      entityId,
      documentId,
      userId,
      userName,
      beforeJson,
      afterJson,
      metadataJson,
      createdAt: new Date().toISOString()
    });
  }

  async getAuditLogs(filter?: SausageAuditLogFilterDto): Promise<SausageAuditLogDto[]> {
    const companyId = this.authPort.getCompanyScope();
    return this.repos.auditLogs.findMany(companyId, filter);
  }

  async getAuditLogsForEntity(entityKind: SausageAuditEntityKind, entityId: string): Promise<SausageAuditLogDto[]> {
    return this.getAuditLogs({ entityKind, entityId });
  }
}

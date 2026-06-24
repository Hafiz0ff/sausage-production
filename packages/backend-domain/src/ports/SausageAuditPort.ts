export interface SausageAuditEvent {
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  companyId: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface SausageAuditPort {
  recordAuditEvent(event: SausageAuditEvent): Promise<void>;
}

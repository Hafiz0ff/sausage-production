export interface SausageUser {
  id: string;
  companyId: string;
  role: string;
  name?: string;
}

export interface SausageAuthPort {
  getCurrentUser(): SausageUser;
  requireRole(role: string): void;
  getCompanyScope(): string;
}

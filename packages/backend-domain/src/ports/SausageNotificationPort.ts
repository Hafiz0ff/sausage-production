export interface SausageNotificationPort {
  notifyLowStock(companyId: string, materialName: string, currentQty: number): Promise<void>;
  notifyOrderCompleted(companyId: string, orderNumber: string): Promise<void>;
}

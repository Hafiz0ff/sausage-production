export interface SausageDocumentPort {
  generateProductionDocument(input: any): Promise<string>;
  generateStockMovementDocument(input: any): Promise<string>;
}

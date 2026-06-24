export interface SausageWarehousePort {
  // Can be used if integration with Siyoma's main inventory system is needed
  reserveFinishedGoods(input: any): Promise<void>;
  releaseReservation(reservationId: string): Promise<void>;
  listReservations(filters: any): Promise<any[]>;
}

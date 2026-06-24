import { SausageRepositories } from '../repositories/SausageRepositories';
import {
  CreateSausageSalesOrderInput,
  CreateSausageReservationInput,
  CreateProductionOrderFromDemandInput,
  SausageSalesOrderDto,
  SausageFinishedGoodsReservationDto,
  SausageProductionDemandDto,
} from 'sausage-shared-types';
import { SAUSAGE_ERROR_CODES, SausageApiError } from 'sausage-shared-types';
import { SausageAuthPort } from '../ports/SausageAuthPort';

export class SausageSalesService {
  constructor(
    private repositories: SausageRepositories,
    private authPort: SausageAuthPort
  ) {}

  private throwError(code: string, message: string): never {
    const error: SausageApiError = {
      error: { code, message }
    };
    throw error;
  }

  private getCompanyId(): string {
    return this.authPort.getCurrentUser().companyId;
  }

  private async refreshSalesOrderStatus(tx: SausageRepositories, orderId: string, companyId: string): Promise<void> {
    const items = await tx.salesOrderItems.findByOrderId(orderId, companyId);
    if (items.length === 0) {
      return;
    }

    const allShipped = items.every(item => item.shippedQty >= item.quantityQty);
    const allReserved = items.every(item => item.shortageQty <= 0);
    const anyReserved = items.some(item => item.reservedQty > 0);
    const nextStatus = allShipped
      ? 'COMPLETED'
      : allReserved
        ? 'RESERVED'
        : anyReserved
          ? 'PARTIALLY_RESERVED'
          : 'CONFIRMED';

    await tx.salesOrders.update(orderId, companyId, {
      status: nextStatus,
      updatedAt: new Date().toISOString()
    });
  }

  async getSalesOrders(): Promise<SausageSalesOrderDto[]> {
    return this.repositories.salesOrders.findMany(this.getCompanyId());
  }

  async getSalesOrderById(id: string): Promise<SausageSalesOrderDto | null> {
    return this.repositories.salesOrders.findById(id, this.getCompanyId());
  }

  async createSalesOrder(
    input: CreateSausageSalesOrderInput
  ): Promise<SausageSalesOrderDto> {
    if (!input.items.length) {
      this.throwError(SAUSAGE_ERROR_CODES.VALIDATION_ERROR, 'Sales order must contain at least one item');
    }

    for (const item of input.items) {
      if (item.quantityQty <= 0) {
        this.throwError(SAUSAGE_ERROR_CODES.VALIDATION_ERROR, 'Item quantity must be > 0');
      }
    }

    const companyId = this.getCompanyId();

    return this.repositories.runTransaction(async (tx) => {
      const now = new Date().toISOString();
      const order = await tx.salesOrders.create({
        id: crypto.randomUUID(),
        companyId,
        number: `SO-${Date.now()}`,
        clientId: input.clientId,
        clientName: input.clientName,
        externalOrderId: input.externalOrderId,
        status: 'DRAFT',
        requestedDate: input.requestedDate,
        dueDate: input.dueDate,
        note: input.note,
        createdAt: now,
        updatedAt: now,
        items: []
      });

      for (const item of input.items) {
        const product = await tx.finishedProducts.findById(item.finishedProductId, companyId);
        if (!product) {
          this.throwError(SAUSAGE_ERROR_CODES.NOT_FOUND, `Product not found: ${item.finishedProductId}`);
        }

        await tx.salesOrderItems.create({
          id: crypto.randomUUID(),
          companyId,
          salesOrderId: order.id,
          finishedProductId: product.id,
          finishedProductName: product.name,
          quantityQty: item.quantityQty,
          reservedQty: 0,
          producedQty: 0,
          shippedQty: 0,
          shortageQty: item.quantityQty,
          createdAt: now,
          updatedAt: now
        });
      }

      const completeOrder = await tx.salesOrders.findById(order.id, companyId);
      return completeOrder!;
    });
  }

  async confirmSalesOrder(id: string): Promise<SausageSalesOrderDto> {
    const companyId = this.getCompanyId();

    return this.repositories.runTransaction(async (tx) => {
      const order = await tx.salesOrders.findById(id, companyId);
      if (!order) this.throwError(SAUSAGE_ERROR_CODES.NOT_FOUND, 'Sales order not found');

      if (order.status !== 'DRAFT') {
        this.throwError(SAUSAGE_ERROR_CODES.INVALID_ORDER_STATUS, 'Only DRAFT orders can be confirmed');
      }

      await tx.salesOrders.update(id, companyId, {
        status: 'CONFIRMED',
        updatedAt: new Date().toISOString()
      });

      const updated = await tx.salesOrders.findById(id, companyId);
      return updated!;
    });
  }

  async cancelSalesOrder(id: string): Promise<SausageSalesOrderDto> {
    const companyId = this.getCompanyId();

    return this.repositories.runTransaction(async (tx) => {
      const order = await tx.salesOrders.findById(id, companyId);
      if (!order) this.throwError(SAUSAGE_ERROR_CODES.NOT_FOUND, 'Sales order not found');

      if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
        this.throwError(SAUSAGE_ERROR_CODES.INVALID_ORDER_STATUS, 'Cannot cancel COMPLETED or CANCELLED order');
      }

      // Automatically release all active reservations for this order
      const reservations = await tx.reservations.findMany(companyId);
      const activeRes = reservations.filter(r => r.salesOrderId === id && r.status === 'ACTIVE');
      for (const res of activeRes) {
        await this.releaseReservationInternal(tx, res.id, companyId, 'Order cancelled');
      }

      await tx.salesOrders.update(id, companyId, {
        status: 'CANCELLED',
        updatedAt: new Date().toISOString()
      });

      const updated = await tx.salesOrders.findById(id, companyId);
      return updated!;
    });
  }

  async reserveSalesOrderItem(
    orderId: string,
    itemId: string,
    input: CreateSausageReservationInput
  ): Promise<SausageFinishedGoodsReservationDto> {
    if (input.quantityQty <= 0) {
      this.throwError(SAUSAGE_ERROR_CODES.VALIDATION_ERROR, 'Reservation quantity must be > 0');
    }

    const user = this.authPort.getCurrentUser();
    const companyId = user.companyId;

    return this.repositories.runTransaction(async (tx) => {
      const order = await tx.salesOrders.findById(orderId, companyId);
      if (!order) this.throwError(SAUSAGE_ERROR_CODES.NOT_FOUND, 'Sales order not found');

      const item = order.items.find(i => i.id === itemId);
      if (!item) this.throwError(SAUSAGE_ERROR_CODES.NOT_FOUND, 'Sales order item not found');

      if (!['CONFIRMED', 'PARTIALLY_RESERVED', 'RESERVED', 'IN_PRODUCTION'].includes(order.status)) {
        this.throwError(SAUSAGE_ERROR_CODES.INVALID_ORDER_STATUS, 'Order must be confirmed before reservation');
      }

      const product = await tx.finishedProducts.findById(item.finishedProductId, companyId);
      if (!product) this.throwError(SAUSAGE_ERROR_CODES.NOT_FOUND, 'Product not found');

      const availableToReserve = product.stockQty - product.reservedQty;
      let qtyToReserve = input.quantityQty;

      if (qtyToReserve > item.shortageQty) {
        qtyToReserve = item.shortageQty;
      }

      if (qtyToReserve > availableToReserve) {
        if (!input.allowPartial) {
          this.throwError(SAUSAGE_ERROR_CODES.INSUFFICIENT_STOCK, 'Insufficient stock for reservation');
        }
        qtyToReserve = availableToReserve;
      }

      if (qtyToReserve <= 0) {
        this.throwError(SAUSAGE_ERROR_CODES.RELEASE_QTY_INVALID, 'Cannot reserve 0 qty');
      }

      // Update product reserved qty
      await tx.finishedProducts.update(product.id, companyId, {
        reservedQty: product.reservedQty + qtyToReserve,
        updatedAt: new Date().toISOString()
      });

      // Update order item reserved and shortage qty
      await tx.salesOrderItems.update(itemId, companyId, {
        reservedQty: item.reservedQty + qtyToReserve,
        shortageQty: item.shortageQty - qtyToReserve,
        updatedAt: new Date().toISOString()
      });

      // Create reservation record
      const reservation = await tx.reservations.create({
        id: crypto.randomUUID(),
        companyId,
        salesOrderId: order.id,
        salesOrderItemId: item.id,
        finishedProductId: product.id,
        finishedProductName: product.name,
        quantityQty: qtyToReserve,
        status: 'ACTIVE',
        createdByUserId: user.id,
        createdByName: user.name,
        createdAt: new Date().toISOString()
      });

      await this.refreshSalesOrderStatus(tx, orderId, companyId);
      return reservation;
    });
  }

  private async releaseReservationInternal(tx: SausageRepositories, id: string, companyId: string, reason?: string) {
    const res = await tx.reservations.findById(id, companyId);
    if (!res) this.throwError(SAUSAGE_ERROR_CODES.NOT_FOUND, 'Reservation not found');

    if (res.status !== 'ACTIVE') {
      this.throwError(SAUSAGE_ERROR_CODES.INVALID_ORDER_STATUS, 'Can only release ACTIVE reservations');
    }

    const product = await tx.finishedProducts.findById(res.finishedProductId, companyId);
    if (!product) this.throwError(SAUSAGE_ERROR_CODES.NOT_FOUND, 'Product not found');

    const orderItems = await tx.salesOrderItems.findByOrderId(res.salesOrderId, companyId);
    const item = orderItems.find(i => i.id === res.salesOrderItemId);

    if (item) {
      if (item.reservedQty < res.quantityQty) {
        this.throwError(SAUSAGE_ERROR_CODES.NEGATIVE_STOCK_FORBIDDEN, 'Reservation item quantity would become negative');
      }

      await tx.salesOrderItems.update(item.id, companyId, {
        reservedQty: item.reservedQty - res.quantityQty,
        shortageQty: item.shortageQty + res.quantityQty,
        updatedAt: new Date().toISOString()
      });
    }

    if (product.reservedQty < res.quantityQty) {
      this.throwError(SAUSAGE_ERROR_CODES.NEGATIVE_STOCK_FORBIDDEN, 'Product reserved quantity would become negative');
    }

    await tx.finishedProducts.update(product.id, companyId, {
      reservedQty: product.reservedQty - res.quantityQty,
      updatedAt: new Date().toISOString()
    });

    await tx.reservations.update(id, companyId, {
      status: 'RELEASED',
      releasedAt: new Date().toISOString(),
      reason
    });

    await this.refreshSalesOrderStatus(tx, res.salesOrderId, companyId);
  }

  async releaseReservation(id: string, reason?: string): Promise<SausageFinishedGoodsReservationDto> {
    const companyId = this.getCompanyId();

    return this.repositories.runTransaction(async (tx) => {
      await this.releaseReservationInternal(tx, id, companyId, reason);
      const res = await tx.reservations.findById(id, companyId);
      return res!;
    });
  }

  async completeReservation(id: string): Promise<SausageFinishedGoodsReservationDto> {
    const companyId = this.getCompanyId();

    return this.repositories.runTransaction(async (tx) => {
      const res = await tx.reservations.findById(id, companyId);
      if (!res) this.throwError(SAUSAGE_ERROR_CODES.NOT_FOUND, 'Reservation not found');

      if (res.status !== 'ACTIVE') {
        this.throwError(SAUSAGE_ERROR_CODES.INVALID_ORDER_STATUS, 'Can only complete ACTIVE reservations');
      }

      const product = await tx.finishedProducts.findById(res.finishedProductId, companyId);
      if (!product) this.throwError(SAUSAGE_ERROR_CODES.NOT_FOUND, 'Product not found');

      const orderItems = await tx.salesOrderItems.findByOrderId(res.salesOrderId, companyId);
      const item = orderItems.find(i => i.id === res.salesOrderItemId);
      
      if (!item) this.throwError(SAUSAGE_ERROR_CODES.NOT_FOUND, 'Order item not found');

      if (product.stockQty < res.quantityQty || product.reservedQty < res.quantityQty) {
        this.throwError(SAUSAGE_ERROR_CODES.NEGATIVE_STOCK_FORBIDDEN, 'Insufficient reserved finished stock');
      }

      if (item.reservedQty < res.quantityQty) {
        this.throwError(SAUSAGE_ERROR_CODES.NEGATIVE_STOCK_FORBIDDEN, 'Order item reserved quantity would become negative');
      }

      // Deduct from stock and reserved
      await tx.finishedProducts.update(product.id, companyId, {
        stockQty: product.stockQty - res.quantityQty,
        reservedQty: product.reservedQty - res.quantityQty,
        updatedAt: new Date().toISOString()
      });

      await tx.salesOrderItems.update(item.id, companyId, {
        reservedQty: item.reservedQty - res.quantityQty,
        shippedQty: item.shippedQty + res.quantityQty,
        updatedAt: new Date().toISOString()
      });

      await tx.reservations.update(id, companyId, {
        status: 'COMPLETED',
        completedAt: new Date().toISOString()
      });

      await this.refreshSalesOrderStatus(tx, res.salesOrderId, companyId);

      const updated = await tx.reservations.findById(id, companyId);
      return updated!;
    });
  }

  async getReservations(): Promise<SausageFinishedGoodsReservationDto[]> {
    return this.repositories.reservations.findMany(this.getCompanyId());
  }

  async getProductionDemand(): Promise<SausageProductionDemandDto[]> {
    const companyId = this.getCompanyId();
    const products = await this.repositories.finishedProducts.findMany(companyId);
    const orders = await this.repositories.salesOrders.findMany(companyId);
    
    // Only consider confirmed and in_progress orders
    const activeOrders = orders.filter(o =>
      ['CONFIRMED', 'PARTIALLY_RESERVED', 'RESERVED', 'IN_PRODUCTION'].includes(o.status)
    );
    
    const demandMap = new Map<string, SausageProductionDemandDto>();

    for (const p of products) {
      demandMap.set(p.id, {
        finishedProductId: p.id,
        finishedProductName: p.name,
        requiredQty: 0,
        availableQty: Math.max(0, p.stockQty - p.reservedQty),
        reservedQty: p.reservedQty,
        shortageQty: 0,
        suggestedProductionQty: 0,
        linkedProductionOrders: []
      });
    }

    for (const o of activeOrders) {
      for (const item of o.items) {
        const d = demandMap.get(item.finishedProductId);
        if (d) {
          d.requiredQty += item.shortageQty;
        }
      }
    }

    const prodOrders = await this.repositories.orders.findMany(companyId);
    const activeProdOrders = prodOrders.filter(o => o.status !== 'ACCEPTED' && o.status !== 'SHIPPED' && o.status !== 'CANCELLED');

    for (const d of Array.from(demandMap.values())) {
      const inFlightQty = activeProdOrders.filter(po => po.finishedProductId === d.finishedProductId).reduce((sum, po) => sum + (po.quantityQty * (1 - po.progressPercent / 100)), 0);
      d.shortageQty = Math.max(0, d.requiredQty - d.availableQty);
      d.suggestedProductionQty = Math.max(0, d.shortageQty - inFlightQty);
    }

    return Array.from(demandMap.values());
  }

  async createProductionOrderFromDemand(
    input: CreateProductionOrderFromDemandInput
  ): Promise<void> {
    if (input.quantityQty <= 0) {
      this.throwError(SAUSAGE_ERROR_CODES.VALIDATION_ERROR, 'Production order quantity must be > 0');
    }

    const companyId = this.getCompanyId();

    return this.repositories.runTransaction(async (tx) => {
      const product = await tx.finishedProducts.findById(input.finishedProductId, companyId);
      if (!product) this.throwError(SAUSAGE_ERROR_CODES.NOT_FOUND, 'Product not found');

      // Check if we need a recipe? In previous logic we did not strict check here, but let's see.
      
      await tx.orders.create({
        id: crypto.randomUUID(),
        companyId,
        number: `PO-D-${Date.now()}`,
        finishedProductId: product.id,
        finishedProductName: product.name,
        quantityQty: input.quantityQty,
        status: 'PLANNED',
        progressPercent: 0,
        dueAt: input.dueAt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      if (input.salesOrderId) {
        const salesOrder = await tx.salesOrders.findById(input.salesOrderId, companyId);
        if (!salesOrder) {
          this.throwError(SAUSAGE_ERROR_CODES.NOT_FOUND, 'Sales order not found');
        }

        await tx.salesOrders.update(input.salesOrderId, companyId, {
          status: 'IN_PRODUCTION',
          updatedAt: new Date().toISOString()
        });
      }
    });
  }
}

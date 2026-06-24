import {
  SausageRawMaterialDto,
  SausageFinishedProductDto,
  SausageRecipeDto,
  SausageClientDto,
  SausageProductionOrderDto,
  SausageProductionBatchDto,
  SausageStockMovementDto,
  SausageLossDto
} from 'sausage-shared-types';
import { PrismaClient, Prisma } from '@prisma/client';
import {
  SausageRepositories,
  SausageRawMaterialRepository,
  SausageFinishedProductRepository,
  SausageRecipeRepository,
  SausageClientRepository,
  SausageProductionOrderRepository,
  SausageProductionBatchRepository,
  SausageStockMovementRepository,
  SausageLossRepository
} from './SausageRepositories';

type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

function toRawMaterialDto(row: Prisma.SausageRawMaterialGetPayload<{}>): SausageRawMaterialDto {
  return {
    ...row,
    supplierName: row.supplierName ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  } as SausageRawMaterialDto;
}

function toFinishedProductDto(row: Prisma.SausageFinishedProductGetPayload<{}>): SausageFinishedProductDto {
  return {
    ...row,
    stockPcs: row.stockPcs ?? undefined,
    shelfLifeDays: row.shelfLifeDays ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  } as SausageFinishedProductDto;
}

type RecipeWithItems = Prisma.SausageRecipeGetPayload<{ include: { items: true } }>;

function toRecipeDto(row: RecipeWithItems): SausageRecipeDto {
  return {
    id: row.id,
    companyId: row.companyId,
    finishedProductId: row.finishedProductId,
    finishedProductName: row.finishedProductName,
    outputQty: row.outputQty,
    expectedYieldPercent: row.expectedYieldPercent,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    items: row.items.map(item => ({
      id: item.id,
      rawMaterialId: item.rawMaterialId,
      rawMaterialName: item.rawMaterialName,
      quantityQty: item.quantityQty
    }))
  };
}

function toClientDto(row: Prisma.SausageClientGetPayload<{}>): SausageClientDto {
  return {
    ...row,
    phone: row.phone ?? undefined,
    externalClientId: row.externalClientId ?? undefined,
    balanceAmount: row.balanceAmount ?? undefined,
    balanceCurrency: row.balanceCurrency ?? undefined,
    lastOrderAt: row.lastOrderAt ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  } as SausageClientDto;
}

function toOrderDto(row: Prisma.SausageProductionOrderGetPayload<{}>): SausageProductionOrderDto {
  return {
    ...row,
    clientId: row.clientId ?? undefined,
    clientName: row.clientName ?? undefined,
    dueAt: row.dueAt ?? undefined,
    shift: row.shift ?? undefined,
    externalOrderId: row.externalOrderId ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  } as SausageProductionOrderDto;
}

function toBatchDto(row: Prisma.SausageProductionBatchGetPayload<{}>): SausageProductionBatchDto {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  } as SausageProductionBatchDto;
}

function toMovementDto(row: Prisma.SausageStockMovementGetPayload<{}>): SausageStockMovementDto {
  return {
    ...row,
    productionOrderId: row.productionOrderId ?? undefined,
    productionBatchId: row.productionBatchId ?? undefined,
    createdByName: row.createdByName ?? undefined,
    reason: row.reason ?? undefined,
    createdAt: row.createdAt.toISOString()
  } as SausageStockMovementDto;
}

function toLossDto(row: Prisma.SausageLossGetPayload<{}>): SausageLossDto {
  return {
    ...row,
    costAmount: row.costAmount ?? undefined,
    costCurrency: row.costCurrency ?? undefined,
    productionOrderId: row.productionOrderId ?? undefined,
    productionBatchId: row.productionBatchId ?? undefined,
    createdByName: row.createdByName ?? undefined,
    createdAt: row.createdAt.toISOString()
  } as SausageLossDto;
}

type SalesOrderWithItems = Prisma.SausageSalesOrderGetPayload<{ include: { items: true } }>;
function toSalesOrderDto(row: SalesOrderWithItems): import('sausage-shared-types').SausageSalesOrderDto {
  return {
    ...row,
    clientId: row.clientId ?? undefined,
    clientName: row.clientName ?? undefined,
    externalOrderId: row.externalOrderId ?? undefined,
    requestedDate: row.requestedDate ?? undefined,
    dueDate: row.dueDate ?? undefined,
    note: row.note ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    items: row.items.map(toSalesOrderItemDto)
  } as import('sausage-shared-types').SausageSalesOrderDto;
}

function toSalesOrderItemDto(row: Prisma.SausageSalesOrderItemGetPayload<{}>): import('sausage-shared-types').SausageSalesOrderItemDto {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  } as import('sausage-shared-types').SausageSalesOrderItemDto;
}

function toReservationDto(row: Prisma.SausageFinishedGoodsReservationGetPayload<{}>): import('sausage-shared-types').SausageFinishedGoodsReservationDto {
  return {
    ...row,
    createdByName: row.createdByName ?? undefined,
    releasedAt: row.releasedAt?.toISOString(),
    completedAt: row.completedAt?.toISOString(),
    reason: row.reason ?? undefined,
    createdAt: row.createdAt.toISOString()
  } as import('sausage-shared-types').SausageFinishedGoodsReservationDto;
}

async function assertUpdated(count: number): Promise<void> {
  if (count === 0) {
    throw new Error('Not found');
  }
}

export class PrismaSausageRepositories implements SausageRepositories {
  constructor(private prisma: PrismaClient | TransactionClient) {}

  readonly rawMaterials: SausageRawMaterialRepository = {
    findMany: async (companyId) => {
      const rows = await this.prisma.sausageRawMaterial.findMany({ where: { companyId } });
      return rows.map(toRawMaterialDto);
    },
    findById: async (id, companyId) => {
      const r = await this.prisma.sausageRawMaterial.findFirst({ where: { id, companyId } });
      if (!r) return null;
      return toRawMaterialDto(r);
    },
    create: async (data) => {
      const r = await this.prisma.sausageRawMaterial.create({
        data: {
          id: data.id,
          companyId: data.companyId,
          name: data.name,
          group: data.group,
          unit: data.unit,
          warehouseQty: data.warehouseQty,
          workshopQty: data.workshopQty,
          reservedQty: data.reservedQty,
          minQty: data.minQty,
          status: data.status,
          supplierName: data.supplierName,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt)
        }
      });
      return toRawMaterialDto(r);
    },
    update: async (id, companyId, data) => {
      const result = await this.prisma.sausageRawMaterial.updateMany({
        where: { id, companyId },
        data: {
          warehouseQty: data.warehouseQty,
          workshopQty: data.workshopQty,
          reservedQty: data.reservedQty,
          minQty: data.minQty,
          status: data.status,
          supplierName: data.supplierName,
          updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date()
        }
      });
      await assertUpdated(result.count);
      const updated = await this.rawMaterials.findById(id, companyId);
      if (!updated) throw new Error('Not found');
      return updated;
    }
  };

  readonly finishedProducts: SausageFinishedProductRepository = {
    findMany: async (companyId) => {
      const rows = await this.prisma.sausageFinishedProduct.findMany({ where: { companyId } });
      return rows.map(toFinishedProductDto);
    },
    findById: async (id, companyId) => {
      const r = await this.prisma.sausageFinishedProduct.findFirst({ where: { id, companyId } });
      if (!r) return null;
      return toFinishedProductDto(r);
    },
    create: async (data) => {
      const r = await this.prisma.sausageFinishedProduct.create({
        data: {
          id: data.id,
          companyId: data.companyId,
          name: data.name,
          sku: data.sku,
          unit: data.unit,
          stockQty: data.stockQty,
          stockPcs: data.stockPcs,
          reservedQty: data.reservedQty,
          shelfLifeDays: data.shelfLifeDays,
          status: data.status,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt)
        }
      });
      return toFinishedProductDto(r);
    },
    update: async (id, companyId, data) => {
      const result = await this.prisma.sausageFinishedProduct.updateMany({
        where: { id, companyId },
        data: {
          stockQty: data.stockQty,
          stockPcs: data.stockPcs,
          reservedQty: data.reservedQty,
          shelfLifeDays: data.shelfLifeDays,
          status: data.status,
          updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date()
        }
      });
      await assertUpdated(result.count);
      const updated = await this.finishedProducts.findById(id, companyId);
      if (!updated) throw new Error('Not found');
      return updated;
    }
  };

  readonly recipes: SausageRecipeRepository = {
    findMany: async (companyId) => {
      const rows = await this.prisma.sausageRecipe.findMany({ where: { companyId }, include: { items: true } });
      return rows.map(toRecipeDto);
    },
    findByFinishedProductId: async (finishedProductId, companyId) => {
      const r = await this.prisma.sausageRecipe.findFirst({ where: { finishedProductId, companyId }, include: { items: true } });
      if (!r) return null;
      return toRecipeDto(r);
    },
    create: async (data) => {
      const r = await this.prisma.sausageRecipe.create({
        data: {
          id: data.id,
          companyId: data.companyId,
          finishedProductId: data.finishedProductId,
          finishedProductName: data.finishedProductName,
          outputQty: data.outputQty,
          expectedYieldPercent: data.expectedYieldPercent,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt),
          items: {
            create: data.items.map(i => ({
              id: i.id,
              rawMaterialId: i.rawMaterialId,
              rawMaterialName: i.rawMaterialName,
              quantityQty: i.quantityQty
            }))
          }
        },
        include: { items: true }
      });
      return toRecipeDto(r);
    },
    update: async (id, companyId, data) => {
      const existing = await this.prisma.sausageRecipe.findFirst({ where: { id, companyId } });
      if (!existing) {
        throw new Error('Not found');
      }

      const r = await this.prisma.sausageRecipe.update({
        where: { id },
        data: {
          finishedProductId: data.finishedProductId,
          finishedProductName: data.finishedProductName,
          outputQty: data.outputQty,
          expectedYieldPercent: data.expectedYieldPercent,
          updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
          ...(data.items
            ? {
                items: {
                  deleteMany: {},
                  create: data.items.map(item => ({
                    id: item.id,
                    rawMaterialId: item.rawMaterialId,
                    rawMaterialName: item.rawMaterialName,
                    quantityQty: item.quantityQty
                  }))
                }
              }
            : {})
        },
        include: { items: true }
      });
      return toRecipeDto(r);
    }
  };

  readonly clients: SausageClientRepository = {
    findMany: async (companyId) => {
      const rows = await this.prisma.sausageClient.findMany({ where: { companyId } });
      return rows.map(toClientDto);
    },
    findById: async (id, companyId) => {
      const r = await this.prisma.sausageClient.findFirst({ where: { id, companyId } });
      if (!r) return null;
      return toClientDto(r);
    },
    create: async (data) => {
      const r = await this.prisma.sausageClient.create({
        data: {
          id: data.id,
          companyId: data.companyId,
          name: data.name,
          segment: data.segment,
          phone: data.phone,
          externalClientId: data.externalClientId,
          balanceAmount: data.balanceAmount,
          balanceCurrency: data.balanceCurrency,
          lastOrderAt: data.lastOrderAt,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt)
        }
      });
      return toClientDto(r);
    }
  };

  readonly orders: SausageProductionOrderRepository = {
    findMany: async (companyId) => {
      const rows = await this.prisma.sausageProductionOrder.findMany({ where: { companyId } });
      return rows.map(toOrderDto);
    },
    findById: async (id, companyId) => {
      const r = await this.prisma.sausageProductionOrder.findFirst({ where: { id, companyId } });
      if (!r) return null;
      return toOrderDto(r);
    },
    create: async (data) => {
      const r = await this.prisma.sausageProductionOrder.create({
        data: {
          id: data.id,
          companyId: data.companyId,
          number: data.number,
          finishedProductId: data.finishedProductId,
          finishedProductName: data.finishedProductName,
          quantityQty: data.quantityQty,
          clientId: data.clientId,
          clientName: data.clientName,
          status: data.status,
          progressPercent: data.progressPercent,
          dueAt: data.dueAt,
          shift: data.shift,
          externalOrderId: data.externalOrderId,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt)
        }
      });
      return toOrderDto(r);
    },
    update: async (id, companyId, data) => {
      const result = await this.prisma.sausageProductionOrder.updateMany({
        where: { id, companyId },
        data: {
          quantityQty: data.quantityQty,
          clientId: data.clientId,
          clientName: data.clientName,
          status: data.status,
          progressPercent: data.progressPercent,
          dueAt: data.dueAt,
          shift: data.shift,
          externalOrderId: data.externalOrderId,
          updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date()
        }
      });
      await assertUpdated(result.count);
      const updated = await this.orders.findById(id, companyId);
      if (!updated) throw new Error('Not found');
      return updated;
    }
  };

  readonly batches: SausageProductionBatchRepository = {
    findMany: async (companyId) => {
      const rows = await this.prisma.sausageProductionBatch.findMany({ where: { companyId } });
      return rows.map(toBatchDto);
    },
    create: async (data) => {
      const r = await this.prisma.sausageProductionBatch.create({
        data: {
          id: data.id,
          companyId: data.companyId,
          batchNo: data.batchNo,
          productionOrderId: data.productionOrderId,
          productionOrderNumber: data.productionOrderNumber,
          finishedProductId: data.finishedProductId,
          finishedProductName: data.finishedProductName,
          producedQty: data.producedQty,
          acceptedQty: data.acceptedQty,
          rejectedQty: data.rejectedQty,
          yieldPercent: data.yieldPercent,
          releasedAt: data.releasedAt,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt)
        }
      });
      return toBatchDto(r);
    }
  };

  readonly movements: SausageStockMovementRepository = {
    findMany: async (companyId) => {
      const rows = await this.prisma.sausageStockMovement.findMany({ where: { companyId } });
      return rows.map(toMovementDto);
    },
    create: async (data) => {
      const r = await this.prisma.sausageStockMovement.create({
        data: {
          id: data.id,
          companyId: data.companyId,
          docNo: data.docNo,
          type: data.type,
          itemKind: data.itemKind,
          itemId: data.itemId,
          itemName: data.itemName,
          quantityQty: data.quantityQty,
          fromLocation: data.fromLocation,
          toLocation: data.toLocation,
          productionOrderId: data.productionOrderId,
          productionBatchId: data.productionBatchId,
          createdByUserId: data.createdByUserId,
          createdByName: data.createdByName,
          createdAt: new Date(data.createdAt),
          reason: data.reason
        }
      });
      return toMovementDto(r);
    }
  };

  readonly losses: SausageLossRepository = {
    findMany: async (companyId) => {
      const rows = await this.prisma.sausageLoss.findMany({ where: { companyId } });
      return rows.map(toLossDto);
    },
    create: async (data) => {
      const r = await this.prisma.sausageLoss.create({
        data: {
          id: data.id,
          companyId: data.companyId,
          docNo: data.docNo,
          itemKind: data.itemKind,
          itemId: data.itemId,
          itemName: data.itemName,
          reason: data.reason,
          quantityQty: data.quantityQty,
          costAmount: data.costAmount,
          costCurrency: data.costCurrency,
          productionOrderId: data.productionOrderId,
          productionBatchId: data.productionBatchId,
          createdByUserId: data.createdByUserId,
          createdByName: data.createdByName,
          createdAt: new Date(data.createdAt)
        }
      });
      return toLossDto(r);
    }
  };

  readonly salesOrders: import('./SausageRepositories').SausageSalesOrderRepository = {
    findMany: async (companyId) => {
      const rows = await this.prisma.sausageSalesOrder.findMany({ where: { companyId }, include: { items: true } });
      return rows.map(toSalesOrderDto);
    },
    findById: async (id, companyId) => {
      const r = await this.prisma.sausageSalesOrder.findFirst({ where: { id, companyId }, include: { items: true } });
      if (!r) return null;
      return toSalesOrderDto(r);
    },
    create: async (data) => {
      const r = await this.prisma.sausageSalesOrder.create({
        data: {
          id: data.id,
          companyId: data.companyId,
          number: data.number,
          clientId: data.clientId,
          clientName: data.clientName,
          externalOrderId: data.externalOrderId,
          status: data.status,
          requestedDate: data.requestedDate,
          dueDate: data.dueDate,
          note: data.note,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt),
          items: {
            create: data.items.map(i => ({
              id: i.id,
              companyId: i.companyId,
              finishedProductId: i.finishedProductId,
              finishedProductName: i.finishedProductName,
              quantityQty: i.quantityQty,
              reservedQty: i.reservedQty,
              producedQty: i.producedQty,
              shippedQty: i.shippedQty,
              shortageQty: i.shortageQty,
              createdAt: new Date(i.createdAt),
              updatedAt: new Date(i.updatedAt)
            }))
          }
        },
        include: { items: true }
      });
      return toSalesOrderDto(r);
    },
    update: async (id, companyId, data) => {
      const result = await this.prisma.sausageSalesOrder.updateMany({
        where: { id, companyId },
        data: {
          clientId: data.clientId,
          clientName: data.clientName,
          externalOrderId: data.externalOrderId,
          status: data.status,
          requestedDate: data.requestedDate,
          dueDate: data.dueDate,
          note: data.note,
          updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date()
        }
      });
      await assertUpdated(result.count);
      const updated = await this.salesOrders.findById(id, companyId);
      if (!updated) throw new Error('Not found');
      return updated;
    }
  };

  readonly salesOrderItems: import('./SausageRepositories').SausageSalesOrderItemRepository = {
    findMany: async (companyId) => {
      const rows = await this.prisma.sausageSalesOrderItem.findMany({ where: { companyId } });
      return rows.map(toSalesOrderItemDto);
    },
    findByOrderId: async (salesOrderId, companyId) => {
      const rows = await this.prisma.sausageSalesOrderItem.findMany({ where: { salesOrderId, companyId } });
      return rows.map(toSalesOrderItemDto);
    },
    create: async (data) => {
      const r = await this.prisma.sausageSalesOrderItem.create({
        data: {
          id: data.id,
          companyId: data.companyId,
          salesOrderId: data.salesOrderId,
          finishedProductId: data.finishedProductId,
          finishedProductName: data.finishedProductName,
          quantityQty: data.quantityQty,
          reservedQty: data.reservedQty,
          producedQty: data.producedQty,
          shippedQty: data.shippedQty,
          shortageQty: data.shortageQty,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt)
        }
      });
      return toSalesOrderItemDto(r);
    },
    update: async (id, companyId, data) => {
      const result = await this.prisma.sausageSalesOrderItem.updateMany({
        where: { id, companyId },
        data: {
          reservedQty: data.reservedQty,
          producedQty: data.producedQty,
          shippedQty: data.shippedQty,
          shortageQty: data.shortageQty,
          updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date()
        }
      });
      await assertUpdated(result.count);
      const r = await this.prisma.sausageSalesOrderItem.findFirst({ where: { id, companyId } });
      if (!r) throw new Error('Not found');
      return toSalesOrderItemDto(r);
    }
  };

  readonly reservations: import('./SausageRepositories').SausageReservationRepository = {
    findMany: async (companyId) => {
      const rows = await this.prisma.sausageFinishedGoodsReservation.findMany({ where: { companyId } });
      return rows.map(toReservationDto);
    },
    findById: async (id, companyId) => {
      const r = await this.prisma.sausageFinishedGoodsReservation.findFirst({ where: { id, companyId } });
      if (!r) return null;
      return toReservationDto(r);
    },
    create: async (data) => {
      const r = await this.prisma.sausageFinishedGoodsReservation.create({
        data: {
          id: data.id,
          companyId: data.companyId,
          salesOrderId: data.salesOrderId,
          salesOrderItemId: data.salesOrderItemId,
          finishedProductId: data.finishedProductId,
          finishedProductName: data.finishedProductName,
          quantityQty: data.quantityQty,
          status: data.status,
          createdByUserId: data.createdByUserId,
          createdByName: data.createdByName,
          createdAt: new Date(data.createdAt),
          releasedAt: data.releasedAt ? new Date(data.releasedAt) : null,
          completedAt: data.completedAt ? new Date(data.completedAt) : null,
          reason: data.reason
        }
      });
      return toReservationDto(r);
    },
    update: async (id, companyId, data) => {
      const result = await this.prisma.sausageFinishedGoodsReservation.updateMany({
        where: { id, companyId },
        data: {
          status: data.status,
          releasedAt: data.releasedAt ? new Date(data.releasedAt) : null,
          completedAt: data.completedAt ? new Date(data.completedAt) : null,
          reason: data.reason
        }
      });
      await assertUpdated(result.count);
      const updated = await this.reservations.findById(id, companyId);
      if (!updated) throw new Error('Not found');
      return updated;
    }
  };

  async runTransaction<T>(fn: (tx: SausageRepositories) => Promise<T>): Promise<T> {
    if ('$transaction' in this.prisma) {
      return this.prisma.$transaction(async (txClient) => {
        return fn(new PrismaSausageRepositories(txClient));
      });
    } else {
      // Already in transaction
      return fn(this);
    }
  }
}

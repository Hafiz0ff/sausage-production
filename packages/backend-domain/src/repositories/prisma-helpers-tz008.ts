import { Prisma } from '@prisma/client';

export function toDocumentDto(row: Prisma.SausageDocumentGetPayload<{ include: { lines: true } }>): import('sausage-shared-types').SausageDocumentDto {
  return {
    id: row.id,
    companyId: row.companyId,
    type: row.type as import('sausage-shared-types').SausageDocumentType,
    number: row.number,
    status: row.status as import('sausage-shared-types').SausageDocumentStatus,
    title: row.title ?? undefined,
    sourceEntityKind: row.sourceEntityKind ?? undefined,
    sourceEntityId: row.sourceEntityId ?? undefined,
    externalDocumentId: row.externalDocumentId ?? undefined,
    relatedOrderId: row.relatedOrderId ?? undefined,
    relatedBatchId: row.relatedBatchId ?? undefined,
    clientId: row.clientId ?? undefined,
    clientName: row.clientName ?? undefined,
    totalQty: row.totalQty,
    totalAmount: row.totalAmount,
    currency: row.currency ?? undefined,
    note: row.note ?? undefined,
    createdByUserId: row.createdByUserId,
    createdByName: row.createdByName ?? undefined,
    postedByUserId: row.postedByUserId ?? undefined,
    postedByName: row.postedByName ?? undefined,
    postedAt: row.postedAt?.toISOString(),
    cancelledByUserId: row.cancelledByUserId ?? undefined,
    cancelledByName: row.cancelledByName ?? undefined,
    cancelledAt: row.cancelledAt?.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    lines: row.lines.map(line => ({
      id: line.id,
      companyId: line.companyId,
      documentId: line.documentId,
      lineNo: line.lineNo,
      itemKind: line.itemKind as import('sausage-shared-types').SausageDocumentItemKind,
      itemId: line.itemId,
      itemName: line.itemName,
      quantityQty: line.quantityQty,
      unit: line.unit,
      fromLocation: (line.fromLocation as import('sausage-shared-types').SausageStockLocation) ?? undefined,
      toLocation: (line.toLocation as import('sausage-shared-types').SausageStockLocation) ?? undefined,
      priceAmount: line.priceAmount ?? undefined,
      costAmount: line.costAmount ?? undefined,
      currency: line.currency ?? undefined,
      note: line.note ?? undefined,
      createdAt: line.createdAt.toISOString(),
      updatedAt: line.updatedAt.toISOString(),
    }))
  };
}

export function toAuditLogDto(row: Prisma.SausageAuditLogGetPayload<{}>): import('sausage-shared-types').SausageAuditLogDto {
  return {
    id: row.id,
    companyId: row.companyId,
    action: row.action as import('sausage-shared-types').SausageAuditAction,
    entityKind: row.entityKind as import('sausage-shared-types').SausageAuditEntityKind,
    entityId: row.entityId,
    documentId: row.documentId ?? undefined,
    userId: row.userId,
    userName: row.userName ?? undefined,
    beforeJson: row.beforeJson ? JSON.parse(JSON.stringify(row.beforeJson)) : undefined,
    afterJson: row.afterJson ? JSON.parse(JSON.stringify(row.afterJson)) : undefined,
    metadataJson: row.metadataJson ? JSON.parse(JSON.stringify(row.metadataJson)) : undefined,
    createdAt: row.createdAt.toISOString()
  };
}

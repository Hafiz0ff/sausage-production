# TZ-008: Documents and Audit

## Objective

Добавить операционные документы и журнал аудита для критичных операций
`sausage-production`.

После TZ-007 система умеет учитывать партии, качество, брак и потери. TZ-008
должен закрыть документальный слой: поступление сырья, перемещение сырья в цех,
акт выпуска партии, акт списания, корректировка остатков и audit trail.

Документы нужны для traceability и будущего отделения `sausage-production` от
Siyoma. Реализация не должна создавать зависимость от документов, продаж,
склада или бухгалтерии Siyoma.

## Scope

Нужно добавить:

- document registry для операций колбасного цеха;
- document lines/items;
- server-side numbering;
- document statuses;
- raw receipt document;
- raw transfer document;
- production batch act;
- write-off act;
- stock adjustment act;
- quality check act;
- append-only audit log;
- frontend screens для документов и аудита;
- typed API client methods;
- tests для document/audit rules.

## Non-Goals

- Не делать бухгалтерские счета, invoices, payments.
- Не делать delivery/shipping документы.
- Не делать государственный EDI/e-invoicing.
- Не делать полноценную PDF генерацию обязательной частью этого ТЗ.
- Не делать QR/labeling/traceability по единицам упаковки.
- Не импортировать Siyoma document/accounting/warehouse modules напрямую.
- Не менять namespace `/api/sausage-production/*`.

## Architecture Rules

Все новые endpoints должны быть только под:

```text
/api/sausage-production/*
```

Запрещено:

```text
/api/production/*
/api/documents/*
/api/audit/*
```

Все новые Prisma models должны иметь prefix `Sausage`.
Все новые SQL tables должны иметь prefix `sausage_`.

Service layer должен работать через repository contract. Прямой импорт Prisma в
service layer запрещен.

Tenant scope должен приходить из `SausageAuthPort`.

Audit log должен быть append-only. Обычные business flows не должны обновлять или
удалять audit records.

## Domain Changes

### SausageDocument

Новая сущность для документов цеха.

Minimum fields:

- `id`
- `companyId`
- `type`
- `number`
- `status`
- `title`
- `sourceEntityKind`
- `sourceEntityId`
- `externalDocumentId`
- `relatedOrderId`
- `relatedBatchId`
- `clientId`
- `clientName`
- `totalQty`
- `totalAmount`
- `currency`
- `note`
- `createdByUserId`
- `createdByName`
- `postedByUserId`
- `postedByName`
- `postedAt`
- `cancelledByUserId`
- `cancelledByName`
- `cancelledAt`
- `createdAt`
- `updatedAt`

Document types:

- `RAW_RECEIPT`
- `RAW_TRANSFER`
- `PRODUCTION_BATCH_ACT`
- `WRITE_OFF_ACT`
- `STOCK_ADJUSTMENT`
- `QUALITY_CHECK_ACT`

Document statuses:

- `DRAFT`
- `POSTED`
- `CANCELLED`

SQL table:

```text
sausage_documents
```

Prisma model:

```text
SausageDocument
```

### SausageDocumentLine

Новая сущность для строк документа.

Minimum fields:

- `id`
- `companyId`
- `documentId`
- `lineNo`
- `itemKind`
- `itemId`
- `itemName`
- `quantityQty`
- `unit`
- `fromLocation`
- `toLocation`
- `priceAmount`
- `costAmount`
- `currency`
- `note`
- `createdAt`
- `updatedAt`

Item kinds:

- `RAW_MATERIAL`
- `FINISHED_PRODUCT`
- `LOSS`
- `SERVICE`
- `OTHER`

SQL table:

```text
sausage_document_lines
```

Prisma model:

```text
SausageDocumentLine
```

### SausageAuditLog

Новая append-only сущность для критичных операций.

Minimum fields:

- `id`
- `companyId`
- `action`
- `entityKind`
- `entityId`
- `documentId`
- `userId`
- `userName`
- `beforeJson`
- `afterJson`
- `metadataJson`
- `createdAt`

Audit actions:

- `DOCUMENT_CREATED`
- `DOCUMENT_POSTED`
- `DOCUMENT_CANCELLED`
- `RAW_RECEIVED`
- `RAW_TRANSFERRED`
- `BATCH_RELEASED`
- `QUALITY_CHECKED`
- `LOSS_WRITTEN_OFF`
- `LOSS_APPROVED`
- `RESERVATION_CREATED`
- `RESERVATION_RELEASED`
- `RESERVATION_COMPLETED`
- `STOCK_ADJUSTED`

Entity kinds:

- `DOCUMENT`
- `DOCUMENT_LINE`
- `RAW_MATERIAL`
- `FINISHED_PRODUCT`
- `PRODUCTION_ORDER`
- `PRODUCTION_BATCH`
- `QUALITY_CHECK`
- `LOSS`
- `STOCK`
- `STOCK_MOVEMENT`
- `RESERVATION`
- `CLIENT`

SQL table:

```text
sausage_audit_logs
```

Prisma model:

```text
SausageAuditLog
```

## API Endpoints

Documents:

```text
GET  /api/sausage-production/documents
GET  /api/sausage-production/documents/:id
POST /api/sausage-production/documents
POST /api/sausage-production/documents/:id/post
POST /api/sausage-production/documents/:id/cancel
GET  /api/sausage-production/documents/:id/print-view
```

Document factory endpoints:

```text
POST /api/sausage-production/documents/raw-receipt
POST /api/sausage-production/documents/raw-transfer
POST /api/sausage-production/documents/write-off
POST /api/sausage-production/documents/stock-adjustment
POST /api/sausage-production/documents/production-batch-act
POST /api/sausage-production/documents/quality-check-act
```

Audit:

```text
GET /api/sausage-production/audit-log
GET /api/sausage-production/audit-log/entity/:entityKind/:entityId
```

## Business Rules

### Document Numbering

- Document number must be generated server-side.
- Number must be unique per `companyId + type`.
- Manual number override is not required in this TZ.
- Number format can be simple and deterministic, for example:

```text
RR-000001
RT-000001
PBA-000001
WO-000001
SA-000001
QC-000001
```

### Document Lifecycle

- New document can be created as `DRAFT`.
- `DRAFT` documents must not mutate stock.
- `POSTED` documents are immutable for normal business fields.
- `CANCELLED` documents cannot be posted.
- `POSTED` stock-changing documents cannot be cancelled in TZ-008 unless a
  reversal document is implemented. Preferred behavior for TZ-008: reject
  cancellation of posted stock documents with a typed validation error.
- Cancelling a `DRAFT` document is allowed.

### Stock Mutations

- Posting raw receipt document must increase raw material stock in warehouse.
- Posting raw transfer document must move raw material from warehouse to
  workshop.
- Posting write-off act must create loss/write-off movement and must not create
  negative stock.
- Posting stock adjustment must adjust stock through explicit stock movement and
  audit record.
- Posting production batch act must link to an existing production batch.
- Production batch act must not double-release stock if the batch was already
  released by existing production flow.
- All stock-changing posting operations must be transactional.

### Audit

- Creating a document writes `DOCUMENT_CREATED`.
- Posting a document writes `DOCUMENT_POSTED`.
- Cancelling a document writes `DOCUMENT_CANCELLED`.
- Stock-changing document posting also writes domain-specific audit action:
  - raw receipt -> `RAW_RECEIVED`;
  - raw transfer -> `RAW_TRANSFERRED`;
  - write-off -> `LOSS_WRITTEN_OFF`;
  - stock adjustment -> `STOCK_ADJUSTED`;
  - production batch act -> `BATCH_RELEASED` only if the batch release happens
    in this operation.
- Existing critical mutations from previous TZs should emit audit logs where
  practical without broad refactoring.
- Audit records must be append-only.

## Shared Types

Add or update shared types in `packages/shared-types`:

- `SausageDocumentType`
- `SausageDocumentStatus`
- `SausageDocumentItemKind`
- `SausageAuditAction`
- `SausageAuditEntityKind`
- `SausageDocumentDto`
- `SausageDocumentLineDto`
- `SausageAuditLogDto`
- `CreateSausageDocumentInput`
- `PostSausageDocumentInput`
- `CancelSausageDocumentInput`
- `CreateRawReceiptDocumentInput`
- `CreateRawTransferDocumentInput`
- `CreateWriteOffDocumentInput`
- `CreateStockAdjustmentDocumentInput`
- `CreateProductionBatchActInput`
- `CreateQualityCheckActInput`
- `SausageDocumentPrintViewDto`
- list filter DTOs for documents and audit logs.

## Backend Requirements

- Add Prisma models and migration for documents, document lines and audit logs.
- Update repository contracts.
- Update InMemory repositories.
- Update Prisma repositories.
- Add `SausageDocumentService`.
- Add `SausageAuditService` or an internal append-only audit helper.
- Wire routes under `/api/sausage-production/*`.
- Ensure all document posting flows use transactions.
- Ensure typed validation errors are returned for invalid lifecycle operations.
- Keep memory mode working.
- Keep PostgreSQL mode working.

## Frontend Requirements

Update `apps/workshop-dashboard`:

- add Documents screen;
- add Audit screen;
- add navigation items if navigation exists;
- documents table:
  - number;
  - type;
  - status;
  - date;
  - related entity;
  - user;
- document detail view or side panel:
  - header fields;
  - lines;
  - status;
  - actions for post/cancel when allowed;
- print-view placeholder:
  - can be an HTML-style read-only view;
  - PDF export is not required in this TZ;
- audit log table:
  - action;
  - entity kind;
  - entity id;
  - document number if available;
  - user;
  - timestamp.

Frontend must use `packages/api-client`. Direct `fetch` from screens is
forbidden unless this is already the local project pattern.

Mock mode must be updated so the dashboard still works without backend.

## Tests

Backend:

- create draft document;
- generated document number is unique per company and type;
- post raw receipt document changes raw warehouse stock;
- post raw transfer document decreases warehouse and increases workshop stock;
- post write-off act creates loss/write-off movement;
- stock-changing document cannot create negative stock;
- cannot post cancelled document;
- cannot cancel posted stock-changing document without reversal;
- production batch act does not double-release existing released batch;
- document create/post/cancel writes audit log;
- audit log is append-only;
- tenant isolation.

API:

- endpoints work under `/api/sausage-production/*`;
- `/api/production/*`, `/api/documents/*` and `/api/audit/*` remain unavailable;
- validation errors return typed error response.

Frontend:

- documents screen renders list and statuses;
- document detail renders lines;
- audit screen renders actions and entity metadata;
- API failure state remains visible.

Architecture:

- `npm run check:architecture` passes.

## Verification

Before completion run:

```bash
rm -rf packages/*/dist apps/workshop-dashboard/dist
npm run build
npm test
npm run check:architecture
npm run prisma:generate -w sausage-backend-domain
```

If `DATABASE_URL` is available:

```bash
npm run db:migrate -w sausage-backend-domain
npm run db:seed -w sausage-backend-domain
SAUSAGE_STORAGE_MODE=postgres npm run dev:api
```

If `DATABASE_URL` is not available, explicitly mention this in the final report.

## Acceptance Criteria

- Documents and audit are implemented only inside `sausage-production`.
- No direct Siyoma business module imports are introduced.
- All new API routes use `/api/sausage-production/*`.
- New Prisma models and SQL tables use required prefixes.
- Document posting uses existing stock rules and does not allow negative stock.
- Audit log is append-only.
- Memory mode and PostgreSQL mode both remain supported.
- Existing TZ-003 through TZ-007 behavior remains working.

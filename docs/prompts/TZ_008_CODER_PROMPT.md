# Coder Prompt: Execute TZ 008

```text
Работай только в main.

Репозиторий:

/Users/hafizov/sausage-production

Основной документ:

/Users/hafizov/sausage-production/docs/tz/TZ_008_DOCUMENTS_AND_AUDIT.md

Перед началом прочитай:

1. /Users/hafizov/sausage-production/docs/tz/TZ_008_DOCUMENTS_AND_AUDIT.md
2. /Users/hafizov/sausage-production/docs/tz/TZ_007_BATCH_QUALITY_LOSS_CONTROL.md
3. /Users/hafizov/sausage-production/docs/tz/TZ_006_ORDERS_RESERVATIONS_CLIENTS.md
4. /Users/hafizov/sausage-production/docs/tz/TZ_005_SAUSAGE_PRODUCTION_PERSISTENCE.md
5. /Users/hafizov/sausage-production/docs/rules/BOUNDARIES.md
6. /Users/hafizov/sausage-production/docs/rules/DEVELOPMENT_RULES.md
7. /Users/hafizov/sausage-production/docs/architecture/ARCHITECTURE.md
8. /Users/hafizov/sausage-production/docs/plans/ROADMAP.md

Контекст:

- `sausage-production` уже имеет separate frontend, typed API client, backend-domain, Prisma persistence и memory mode.
- TZ-006 добавил client orders, reservations и production demand.
- TZ-007 добавил batch quality и loss control.
- Следующий этап: операционные документы и append-only audit log.
- Единственный API namespace: `/api/sausage-production/*`.
- Прямые импорты из Siyoma business modules запрещены.
- Код должен оставаться готовым к будущему отделению `sausage-production` в standalone сервис.

Задача:

Реализовать TZ-008: Documents and Audit.

Что сделать:

1. Обновить `packages/shared-types`:
   - `SausageDocumentType`;
   - `SausageDocumentStatus`;
   - `SausageDocumentItemKind`;
   - `SausageAuditAction`;
   - `SausageAuditEntityKind`;
   - document DTOs;
   - document line DTOs;
   - audit log DTOs;
   - create/post/cancel document inputs;
   - factory inputs для raw receipt, raw transfer, write-off, stock adjustment, production batch act, quality check act;
   - print-view DTO;
   - list filter DTOs.
2. Добавить Prisma models:
   - `SausageDocument` -> `sausage_documents`;
   - `SausageDocumentLine` -> `sausage_document_lines`;
   - `SausageAuditLog` -> `sausage_audit_logs`.
3. Добавить migration/schema update.
4. Обновить repository contracts.
5. Обновить InMemory repositories.
6. Обновить Prisma repositories.
7. Добавить `SausageDocumentService`.
8. Добавить `SausageAuditService` или internal audit helper.
9. Добавить endpoints:
   - `GET /api/sausage-production/documents`;
   - `GET /api/sausage-production/documents/:id`;
   - `POST /api/sausage-production/documents`;
   - `POST /api/sausage-production/documents/:id/post`;
   - `POST /api/sausage-production/documents/:id/cancel`;
   - `GET /api/sausage-production/documents/:id/print-view`;
   - `POST /api/sausage-production/documents/raw-receipt`;
   - `POST /api/sausage-production/documents/raw-transfer`;
   - `POST /api/sausage-production/documents/write-off`;
   - `POST /api/sausage-production/documents/stock-adjustment`;
   - `POST /api/sausage-production/documents/production-batch-act`;
   - `POST /api/sausage-production/documents/quality-check-act`;
   - `GET /api/sausage-production/audit-log`;
   - `GET /api/sausage-production/audit-log/entity/:entityKind/:entityId`.
10. Обновить `packages/api-client` typed methods.
11. Обновить `apps/workshop-dashboard`:
   - Documents screen;
   - Audit screen;
   - document detail or side panel;
   - print-view placeholder;
   - document statuses and actions;
   - audit table.
12. Обновить mock data так, чтобы frontend mock mode не ломался.

Business rules:

- Document number is generated server-side.
- Document number is unique per `companyId + type`.
- New document can be `DRAFT`.
- `DRAFT` documents must not mutate stock.
- `POSTED` documents are immutable for normal business fields.
- `CANCELLED` documents cannot be posted.
- Cancelling `DRAFT` documents is allowed.
- Cancelling `POSTED` stock-changing documents should be rejected in this TZ unless a reversal document is implemented.
- Posting raw receipt document increases raw material stock in warehouse.
- Posting raw transfer document moves raw material from warehouse to workshop.
- Posting write-off act creates loss/write-off movement and must not create negative stock.
- Posting stock adjustment uses explicit stock movement and audit record.
- Posting production batch act links to existing batch and must not double-release stock.
- All stock-changing document posting operations must be transactional.
- Audit log is append-only.
- Document create/post/cancel must write audit log.
- Stock-changing document posting must also write domain-specific audit action.
- Tenant scope must come from `SausageAuthPort`, not request headers.

Запреты:

- Не использовать `/api/production/*`.
- Не использовать `/api/documents/*`.
- Не использовать `/api/audit/*`.
- Не создавать Prisma models без `Sausage` prefix.
- Не создавать SQL tables без `sausage_` prefix.
- Не импортировать Siyoma document/accounting/warehouse/sales modules напрямую.
- Не удалять memory mode.
- Не ломать existing endpoints из TZ-003/TZ-004/TZ-005/TZ-006/TZ-007.
- Не делать полноценную PDF генерацию обязательной частью этого ТЗ.
- Не делать QR/labeling/HACCP.
- Не создавать новую ветку.

Обязательные тесты:

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
- tenant isolation;
- existing TZ-003 through TZ-007 tests still pass.

API:

- endpoints work under `/api/sausage-production/*`;
- `/api/production/*` remains unavailable;
- `/api/documents/*` remains unavailable;
- `/api/audit/*` remains unavailable;
- validation errors return typed error response.

Frontend:

- documents screen renders list and statuses;
- document detail renders lines;
- audit screen renders actions and entity metadata;
- API failure state remains visible.

Architecture:

- `npm run check:architecture` passes.

Обязательные проверки перед завершением:

rm -rf packages/*/dist apps/workshop-dashboard/dist
npm run build
npm test
npm run check:architecture
npm run prisma:generate -w sausage-backend-domain

Если DATABASE_URL доступен:

npm run db:migrate -w sausage-backend-domain
npm run db:seed -w sausage-backend-domain
SAUSAGE_STORAGE_MODE=postgres npm run dev:api

Если DATABASE_URL недоступен, явно напиши это в отчете.

Git:

- работай только в `main`;
- commit и push только в `origin main`;
- не создавай feature branch.

Финальный отчет:

- какие DTO/enums добавлены;
- какие Prisma models/tables/migrations добавлены;
- какие endpoints добавлены;
- как работает document lifecycle;
- как работает document posting для stock operations;
- как реализован append-only audit log;
- какие frontend экраны/секции обновлены;
- какие проверки прошли;
- что не проверялось из-за внешней среды.
```

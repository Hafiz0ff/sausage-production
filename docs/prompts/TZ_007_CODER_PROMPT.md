# Coder Prompt: Execute TZ 007

```text
Работай только в main.

Репозиторий:

/Users/hafizov/sausage-production

Основной документ:

/Users/hafizov/sausage-production/docs/tz/TZ_007_BATCH_QUALITY_LOSS_CONTROL.md

Перед началом прочитай:

1. /Users/hafizov/sausage-production/docs/tz/TZ_007_BATCH_QUALITY_LOSS_CONTROL.md
2. /Users/hafizov/sausage-production/docs/tz/TZ_006_ORDERS_RESERVATIONS_CLIENTS.md
3. /Users/hafizov/sausage-production/docs/tz/TZ_005_SAUSAGE_PRODUCTION_PERSISTENCE.md
4. /Users/hafizov/sausage-production/docs/rules/BOUNDARIES.md
5. /Users/hafizov/sausage-production/docs/rules/DEVELOPMENT_RULES.md
6. /Users/hafizov/sausage-production/docs/architecture/ARCHITECTURE.md
7. /Users/hafizov/sausage-production/docs/plans/ROADMAP.md

Контекст:

- `sausage-production` уже имеет separate frontend, typed API client, backend-domain, Prisma persistence и memory mode.
- TZ-006 добавил sales orders, reservations и production demand.
- Следующий этап: контроль качества партий, причины брака, категории потерь, статусы приемки и planned vs actual analytics.
- Единственный API namespace: `/api/sausage-production/*`.
- Прямые импорты из Siyoma business modules запрещены.

Задача:

Реализовать TZ-007: Batch Quality and Loss Control.

Что сделать:

1. Обновить `packages/shared-types`:
   - batch status enum;
   - quality status enum;
   - loss category enum;
   - loss stage enum;
   - quality check DTO/input;
   - batch accept/reject inputs;
   - loss approval input;
   - quality/loss summary DTOs.
2. Расширить production batch model:
   - status;
   - qualityStatus;
   - plannedQty;
   - varianceQty;
   - variancePercent;
   - master/operator fields;
   - quality checked fields.
3. Добавить `SausageQualityCheck`:
   - Prisma model;
   - SQL table `sausage_quality_checks`;
   - migration;
   - repository contract;
   - InMemory implementation;
   - Prisma implementation.
4. Расширить `SausageLoss`:
   - category;
   - stage;
   - isRecoverable;
   - approvedBy/approvedAt fields.
5. Добавить service layer для quality/loss control.
6. Добавить endpoints:
   - `GET /api/sausage-production/quality-checks`;
   - `GET /api/sausage-production/quality-checks/:id`;
   - `POST /api/sausage-production/batches/:id/quality-check`;
   - `POST /api/sausage-production/batches/:id/accept`;
   - `POST /api/sausage-production/batches/:id/reject`;
   - `POST /api/sausage-production/batches/:id/reopen-quality`;
   - `GET /api/sausage-production/loss-categories`;
   - `POST /api/sausage-production/losses/:id/approve`;
   - `GET /api/sausage-production/analytics/quality-summary`;
   - `GET /api/sausage-production/analytics/loss-summary`.
7. Обновить existing batch release:
   - сохранить текущие stock rules;
   - добавить status/qualityStatus/planned-vs-actual fields;
   - не сломать существующие tests.
8. Обновить `packages/api-client` typed methods.
9. Обновить `apps/workshop-dashboard`:
   - batch quality/status display;
   - loss category/stage/approval display;
   - quality summary and loss summary;
   - actions for quality check and loss approval.
10. Обновить mock data так, чтобы frontend mock mode не ломался.

Business rules:

- Quality check allowed only for existing batch in current tenant.
- `checkedQty > 0`.
- `acceptedQty >= 0`.
- `rejectedQty >= 0`.
- `acceptedQty + rejectedQty <= checkedQty`.
- Cannot quality-check `CANCELLED` batch.
- `rejectedQty == 0` -> quality `PASSED`, batch `ACCEPTED`.
- `acceptedQty == 0 && rejectedQty > 0` -> quality `FAILED`, batch `REJECTED`.
- `acceptedQty > 0 && rejectedQty > 0` -> quality `PARTIAL`, batch `PARTIALLY_ACCEPTED`.
- Failed/partial quality must create or update loss records for rejected qty.
- Loss approval must not mutate stock quantities again.
- All quality/loss mutations must be transactional.
- Tenant scope must come from `SausageAuthPort`, not request headers.

Запреты:

- Не использовать `/api/production/*`.
- Не создавать Prisma models без `Sausage` prefix.
- Не создавать SQL tables без `sausage_` prefix.
- Не импортировать Siyoma sales/delivery/inventory/client modules напрямую.
- Не удалять memory mode.
- Не ломать existing endpoints из TZ-003/TZ-004/TZ-005/TZ-006.
- Не делать documents/acts/print forms в этом ТЗ.
- Не делать QR/labeling/HACCP.
- Не создавать новую ветку.

Обязательные тесты:

Backend:

- create quality check for batch;
- invalid quality quantities rejected;
- PASSED quality updates batch to ACCEPTED;
- FAILED quality updates batch to REJECTED and creates/updates loss;
- PARTIAL quality updates batch to PARTIALLY_ACCEPTED;
- loss approval sets approved fields;
- tenant isolation;
- existing batch release/reservation tests still pass.

API:

- endpoints work under `/api/sausage-production/*`;
- `/api/production/*` remains 404;
- validation errors return typed error response.

Frontend:

- batches screen renders batch/quality status;
- losses screen renders category/stage/approval;
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
- какие endpoints добавлены;
- какие migrations/schema changes добавлены;
- как работает quality check flow;
- как работает loss approval;
- какие frontend экраны/секции обновлены;
- какие проверки прошли;
- что не проверялось из-за внешней среды.
```

# TZ-007: Batch Quality and Loss Control

## Objective

Добавить полноценный контроль качества партий и учет производственных потерь в
`sausage-production`.

После TZ-006 система уже умеет работать с клиентскими заказами, резервами и
производственной потребностью. TZ-007 должен усилить операционный контур цеха:
фиксировать фактическое качество выпуска, причины брака, потери по категориям,
мастера/оператора, статусы приемки и аналитику planned vs actual.

## Scope

Нужно добавить:

- расширенную модель качества партии;
- статусы партии и приемки;
- quality check для batch release;
- loss categories/reason codes;
- master/operator fields;
- planned vs actual analytics;
- frontend screen/sections для качества и потерь;
- tests для batch quality rules.

## Non-Goals

- Не делать документы/акты печати. Это TZ-008.
- Не делать QR/labeling/traceability по сырью.
- Не делать HACCP журнал.
- Не делать delivery/shipping.
- Не делать invoices/payments.
- Не менять namespace `/api/sausage-production/*`.
- Не импортировать Siyoma business modules напрямую.

## Architecture Rules

Все новые endpoints должны быть только под:

```text
/api/sausage-production/*
```

Запрещено:

```text
/api/production/*
/api/quality/*
/api/losses/*
```

Все новые Prisma models должны иметь prefix `Sausage`.
Все новые SQL tables должны иметь prefix `sausage_`.

Service layer должен работать через repository contract. Прямой импорт Prisma в
service layer запрещен.

Tenant scope должен приходить из `SausageAuthPort`.

## Domain Changes

### SausageProductionBatch

Расширить batch DTO/model полями:

- `status`
- `qualityStatus`
- `plannedQty`
- `varianceQty`
- `variancePercent`
- `masterUserId`
- `masterName`
- `operatorUserId`
- `operatorName`
- `qualityCheckedByUserId`
- `qualityCheckedByName`
- `qualityCheckedAt`
- `qualityNote`

Batch statuses:

- `DRAFT`
- `RELEASED`
- `QUALITY_PENDING`
- `ACCEPTED`
- `REJECTED`
- `PARTIALLY_ACCEPTED`
- `CANCELLED`

Quality statuses:

- `NOT_CHECKED`
- `PASSED`
- `FAILED`
- `PARTIAL`

### SausageQualityCheck

Новая сущность для контроля качества партии.

Minimum fields:

- `id`
- `companyId`
- `productionBatchId`
- `productionOrderId`
- `batchNo`
- `finishedProductId`
- `finishedProductName`
- `checkedQty`
- `acceptedQty`
- `rejectedQty`
- `qualityStatus`
- `temperatureCelsius`
- `humidityPercent`
- `sampleWeightQty`
- `note`
- `checkedByUserId`
- `checkedByName`
- `checkedAt`
- `createdAt`
- `updatedAt`

SQL table:

```text
sausage_quality_checks
```

Prisma model:

```text
SausageQualityCheck
```

### SausageLoss

Расширить loss DTO/model полями:

- `category`
- `stage`
- `isRecoverable`
- `approvedByUserId`
- `approvedByName`
- `approvedAt`

Loss categories:

- `RAW_MATERIAL`
- `PRODUCTION`
- `QUALITY_REJECT`
- `PACKAGING`
- `EXPIRY`
- `ADJUSTMENT`
- `OTHER`

Loss stages:

- `RAW_WAREHOUSE`
- `WORKSHOP_PREP`
- `MIXING`
- `THERMAL_PROCESSING`
- `PACKAGING`
- `FINISHED_WAREHOUSE`
- `QUALITY_CONTROL`
- `OTHER`

Existing `SausageLossReason` can stay, but reason codes must cover:

- `TRIMMING`
- `THERMAL_LOSS`
- `DEFECT`
- `EXPIRY`
- `CALIBRATION`
- `PACKAGING_DAMAGE`
- `QUALITY_REJECT`
- `WEIGHT_VARIANCE`
- `OTHER`

## API Endpoints

Quality checks:

```text
GET  /api/sausage-production/quality-checks
GET  /api/sausage-production/quality-checks/:id
POST /api/sausage-production/batches/:id/quality-check
```

Batch quality:

```text
POST /api/sausage-production/batches/:id/accept
POST /api/sausage-production/batches/:id/reject
POST /api/sausage-production/batches/:id/reopen-quality
```

Loss control:

```text
GET  /api/sausage-production/loss-categories
POST /api/sausage-production/losses/:id/approve
```

Analytics:

```text
GET /api/sausage-production/analytics/quality-summary
GET /api/sausage-production/analytics/loss-summary
```

## Business Rules

### Batch Release

Existing batch release must continue to:

- consume raw material from workshop;
- add accepted finished goods to finished warehouse;
- create stock movements;
- create losses for rejected quantity.

TZ-007 must additionally:

- calculate planned vs actual from production order quantity and produced qty;
- set batch status and quality status;
- store master/operator info from auth/user context or request payload;
- require `acceptedQty + rejectedQty <= producedQty`;
- require non-negative quantities.

### Quality Check

Quality check can be created only for an existing batch in current tenant.

Rules:

- `checkedQty > 0`;
- `acceptedQty >= 0`;
- `rejectedQty >= 0`;
- `acceptedQty + rejectedQty <= checkedQty`;
- cannot quality-check a `CANCELLED` batch;
- failed or partial quality must create/update loss records for rejected qty;
- operation must be transactional.

Quality status calculation:

```text
if rejectedQty == 0 -> PASSED
if acceptedQty == 0 and rejectedQty > 0 -> FAILED
if acceptedQty > 0 and rejectedQty > 0 -> PARTIAL
```

Batch status calculation:

```text
PASSED  -> ACCEPTED
FAILED  -> REJECTED
PARTIAL -> PARTIALLY_ACCEPTED
```

### Loss Approval

Loss approval:

- only existing loss in current tenant can be approved;
- approval sets approved user/name/date;
- approval must be idempotent or return a validation error with clear message;
- must not mutate stock quantities again.

### Analytics

Quality summary must return:

- total batches;
- accepted batches;
- rejected batches;
- partial batches;
- total produced qty;
- total accepted qty;
- total rejected qty;
- average yield percent;
- average variance percent.

Loss summary must return:

- total loss qty;
- loss qty by category;
- loss qty by stage;
- loss qty by reason;
- approved/unapproved loss counts.

## Shared Types

Update `packages/shared-types`:

- batch status enum;
- quality status enum;
- loss category enum;
- loss stage enum;
- `SausageQualityCheckDto`;
- `CreateSausageQualityCheckInput`;
- `AcceptSausageBatchInput`;
- `RejectSausageBatchInput`;
- `ApproveSausageLossInput`;
- `SausageQualitySummaryDto`;
- `SausageLossSummaryDto`.

Avoid inline `import('./domain-enums')` type references inside DTOs when normal
imports are clearer.

## Backend

Update `packages/backend-domain`:

- Prisma schema and migration;
- repository contract;
- InMemory repository;
- Prisma repository;
- service layer for quality/loss control;
- routes under `/api/sausage-production/*`;
- seed/demo data if useful.

Existing endpoints must remain backward compatible.

## API Client

Update `packages/api-client` with typed methods for:

- quality checks;
- batch accept/reject/reopen-quality;
- loss approval;
- quality summary;
- loss summary.

## Frontend

Update `apps/workshop-dashboard`:

- add quality status and batch status display to batches screen;
- add quality summary to analytics or a dedicated quality section;
- add loss category/stage/approval display to losses screen;
- add actions for quality check and loss approval using api-client methods;
- keep screen components free of direct `fetch` calls;
- keep mock mode working.

## Tests

Required backend tests:

- create quality check for batch;
- reject invalid quality quantities;
- quality PASSED updates batch to ACCEPTED;
- quality FAILED updates batch to REJECTED and creates/updates loss;
- quality PARTIAL updates batch to PARTIALLY_ACCEPTED;
- loss approval sets approved fields;
- tenant isolation;
- existing batch release tests still pass.

Required API tests:

- new endpoints are under `/api/sausage-production/*`;
- `/api/production/*` remains unavailable;
- validation errors return typed error response.

Required frontend tests:

- batches screen renders quality/batch status;
- losses screen renders category/stage/approval;
- API failure remains visible as error state.

## Verification

Required commands:

```text
rm -rf packages/*/dist apps/workshop-dashboard/dist
npm run build
npm test
npm run check:architecture
npm run prisma:generate -w sausage-backend-domain
```

If PostgreSQL is available:

```text
npm run db:migrate -w sausage-backend-domain
npm run db:seed -w sausage-backend-domain
SAUSAGE_STORAGE_MODE=postgres npm run dev:api
```

If `DATABASE_URL` is not available, report that PostgreSQL migration/seed was
not run and show memory-mode checks.

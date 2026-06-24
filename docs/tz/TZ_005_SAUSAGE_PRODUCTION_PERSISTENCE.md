# TZ 005: Sausage Production Persistence

## Objective

Заменить in-memory storage в `packages/backend-domain` на устойчивый persistence
слой для `sausage-production`, сохранив текущий API contract, service layer и
архитектурные границы.

Главная цель: данные колбасного цеха должны переживать перезапуск backend dev
server, а доменная логика должна продолжать работать через repository
interfaces, без прямой зависимости от Siyoma business modules.

## Context

После ТЗ-004 есть рабочий локальный flow:

```text
apps/workshop-dashboard
  -> packages/api-client
  -> /api/sausage-production/*
  -> packages/backend-domain
  -> InMemoryRepositories
```

Текущий backend использует `InMemoryRepositories` и demo seed data. Это подходит
для prototype, но не подходит для реальной эксплуатации.

ТЗ-005 должен добавить persistent repository implementation и оставить
in-memory режим доступным для быстрых tests/dev scenarios.

## Non-Goals

- Не менять frontend UX.
- Не переписывать service layer без необходимости.
- Не добавлять full standalone deployment.
- Не интегрировать Siyoma sales/delivery/inventory напрямую.
- Не использовать `/api/production/*`.
- Не делать сложный HACCP, QR, этикетки и серийную маркировку.
- Не удалять in-memory repositories, если они нужны для unit tests.

## Storage Decision

Предпочтительный persistence stack:

```text
PostgreSQL + Prisma
```

Допустимая структура:

```text
packages/backend-domain/prisma/schema.prisma
packages/backend-domain/prisma/migrations/*
packages/backend-domain/src/repositories/PrismaSausageRepositories.ts
```

Если исполнитель выбирает другой persistence stack, он должен сначала явно
объяснить причину и убедиться, что:

- есть migrations;
- есть typed schema;
- есть tests;
- данные можно будет вынести в standalone product.

## Required Architecture

### Repository Boundary

Service layer не должен зависеть от конкретного хранилища.

Нужно ввести repository contract, например:

```text
packages/backend-domain/src/repositories/SausageRepositories.ts
```

Минимальная идея:

```ts
interface SausageRepositories {
  rawMaterials: SausageRawMaterialRepository;
  finishedProducts: SausageFinishedProductRepository;
  recipes: SausageRecipeRepository;
  clients: SausageClientRepository;
  orders: SausageProductionOrderRepository;
  batches: SausageProductionBatchRepository;
  movements: SausageStockMovementRepository;
  losses: SausageLossRepository;
}
```

`InMemoryRepositories` должен либо реализовать этот contract, либо быть
адаптирован к нему.

`PrismaSausageRepositories` должен реализовать тот же contract.

### Dependency Direction

Разрешено:

```text
services -> repository interfaces
Prisma repositories -> Prisma client
devServer -> repository factory
```

Запрещено:

```text
services -> Prisma client напрямую
services -> SQL напрямую
services -> Siyoma business modules
```

### Repository Factory

Backend должен уметь выбирать storage mode через env:

```text
SAUSAGE_STORAGE_MODE=memory
SAUSAGE_STORAGE_MODE=postgres
DATABASE_URL=postgresql://...
```

Default для local dev может быть:

```text
SAUSAGE_STORAGE_MODE=memory
```

Для persistence проверки:

```text
SAUSAGE_STORAGE_MODE=postgres
```

## Database Schema

Все таблицы должны иметь `sausage_` prefix.

Required tables:

```text
sausage_raw_materials
sausage_finished_products
sausage_recipes
sausage_recipe_items
sausage_clients
sausage_production_orders
sausage_production_batches
sausage_stock_movements
sausage_losses
```

Optional but recommended:

```text
sausage_stock_balances
sausage_reservations
```

### Common Columns

Every persisted core table must include:

```text
id
company_id
created_at
updated_at
```

For movement/audit-like tables:

```text
created_by_user_id
created_by_name
```

External integration references must be nullable plain values, not hard foreign
keys to Siyoma tables:

```text
external_client_id
external_order_id
external_warehouse_id
host_company_id
```

### Naming Rules

Prisma model names:

```text
SausageRawMaterial
SausageFinishedProduct
SausageRecipe
SausageRecipeItem
SausageClient
SausageProductionOrder
SausageProductionBatch
SausageStockMovement
SausageLoss
```

SQL table names:

```text
@@map("sausage_raw_materials")
@@map("sausage_finished_products")
...
```

Запрещено создавать модели без `Sausage` prefix:

```text
RawMaterial
FinishedProduct
ProductionOrder
StockMovement
```

## Stock Persistence Rules

### Movement Journal Is Source Of Truth

`sausage_stock_movements` является audit/source-of-truth для всех изменений
остатков.

Materialized balances допускаются, но только если:

- обновляются в одной transaction с movement;
- имеют tests;
- могут быть пересчитаны из movement journal.

### Separate Locations

Persistence должен явно различать:

```text
RAW_WAREHOUSE
WORKSHOP
FINISHED_WAREHOUSE
LOSS
ADJUSTMENT
```

Нельзя хранить один общий `stockQty` без location для сырья.

### Transactions

Все операции, которые меняют остатки, должны быть transactional:

- receipt сырья;
- transfer сырья в цех;
- release batch;
- write-off;
- stock adjustment.

Если один шаг операции падает, movement и stock changes не должны частично
сохраняться.

## Required Repository Operations

Минимально repository layer должен поддерживать:

### Raw Materials

- list by company;
- find by id + company;
- create;
- update warehouse/workshop quantities transactionally;

### Finished Products

- list by company;
- find by id + company;
- create;
- update finished stock quantity transactionally;

### Recipes

- list by company;
- find by finished product id + company;
- create/update with recipe items;

### Clients

- list by company;
- create;
- find by id + company;

### Production Orders

- list by company;
- find by id + company;
- create;
- update status/progress;

### Production Batches

- list by company;
- create with batch number;

### Stock Movements

- list by company;
- create movement;
- filter by item/order/batch/date later;

### Losses

- list by company;
- create loss;

## Backend API Behavior

Existing endpoints from ТЗ-004 must continue to work:

```text
GET  /api/sausage-production/dashboard
GET  /api/sausage-production/raw-materials
GET  /api/sausage-production/finished-products
GET  /api/sausage-production/recipes
GET  /api/sausage-production/clients
GET  /api/sausage-production/orders
GET  /api/sausage-production/batches
GET  /api/sausage-production/stock-movements
GET  /api/sausage-production/losses
GET  /api/sausage-production/analytics/summary
POST /api/sausage-production/raw-materials/:id/receipt
POST /api/sausage-production/raw-materials/:id/transfer-to-workshop
POST /api/sausage-production/orders
POST /api/sausage-production/orders/:id/start
POST /api/sausage-production/batches/release
POST /api/sausage-production/stock/write-off
```

The frontend should not need API path changes.

## Seed And Migrations

Add seed command for local persistence mode:

```bash
npm run db:seed -w sausage-backend-domain
```

Seed data should match current demo UI:

- `companyId = demo-company`;
- raw materials;
- finished products;
- recipes;
- clients;
- orders;
- batches;
- movements;
- losses.

Add migration command:

```bash
npm run db:migrate -w sausage-backend-domain
```

If Prisma is used, add:

```bash
npm run prisma:generate -w sausage-backend-domain
```

## Environment Files

Do not commit `.env` with secrets.

Commit example files only:

```text
packages/backend-domain/.env.example
```

Required example variables:

```text
SAUSAGE_STORAGE_MODE=postgres
DATABASE_URL=postgresql://user:password@localhost:5432/sausage_production
SAUSAGE_DEMO_COMPANY_ID=demo-company
SAUSAGE_API_PORT=4014
```

## Tests

### Unit Tests

Keep current service tests against in-memory repositories.

### Repository Contract Tests

Add shared repository contract tests that can run against:

- `InMemoryRepositories`;
- `PrismaSausageRepositories` if `DATABASE_URL` is available.

Required scenarios:

- tenant A cannot read tenant B records;
- raw receipt persists after repository reload;
- raw transfer persists warehouse/workshop changes;
- release batch persists batch, movements and finished stock;
- write-off persists movement and loss;
- negative stock is rejected;
- `acceptedQty + rejectedQty > producedQty` is rejected;
- movement journal contains every stock-changing operation.

### API Integration Tests

Run existing endpoint tests in memory mode.

If test database is configured, run endpoint tests in postgres mode too.

### Architecture Tests

Extend `scripts/check-architecture.sh`:

- no `/api/production` runtime usage;
- no direct Siyoma business imports;
- no Prisma model names without `Sausage` prefix;
- no SQL table names for this domain without `sausage_` prefix.

## Run Requirements

After implementation, these must pass:

```bash
rm -rf packages/*/dist apps/workshop-dashboard/dist
npm test
npm run build
npm run check:architecture
```

For persistence mode:

```bash
npm run prisma:generate -w sausage-backend-domain
npm run db:migrate -w sausage-backend-domain
npm run db:seed -w sausage-backend-domain
SAUSAGE_STORAGE_MODE=postgres npm run dev:api
```

If local PostgreSQL is not available, executor must document what was not run
and still verify memory mode.

## Acceptance Criteria

- Persistent repository implementation exists.
- In-memory repository remains available for fast tests.
- Services depend on repository interfaces, not direct arrays or Prisma client.
- Tables/models use `Sausage` and `sausage_` prefixes.
- Migrations and seed scripts exist.
- Stock-changing commands are transactional in persistent mode.
- Existing frontend real API mode works without path changes.
- Existing API tests pass.
- New repository/persistence tests pass.
- Architecture check protects naming and namespace boundaries.
- Documentation explains memory mode and postgres mode.

## Next TZ

Recommended next document:

```text
TZ_006_SAUSAGE_PRODUCTION_ROLES_AUDIT.md
```

Scope:

- production roles and permissions;
- audit event persistence;
- document numbers;
- operation history UI;
- safer command authorization.

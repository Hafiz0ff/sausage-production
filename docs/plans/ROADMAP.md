# Sausage Production Roadmap

## Phase 0: Documentation And Boundaries

Goal: зафиксировать архитектурную границу до разработки.

Deliverables:

- repository README;
- architecture document;
- domain boundary rules;
- development rules;
- terminology;
- Siyoma integration strategy;
- staged roadmap.

Acceptance criteria:

- домен называется `sausage-production`;
- документация запрещает смешивание с Siyoma beverage/water domain;
- зафиксирован future extraction path.

## Phase 1: Workshop Frontend Prototype

Goal: создать отдельный frontend `sausage-workshop` на основе HTML-референса.

Scope:

- отдельное приложение;
- sidebar/navigation;
- dashboard;
- production orders view;
- raw materials view;
- finished products view;
- recipes view;
- movements view;
- batches view;
- losses view;
- analytics placeholder.

Rules:

- не внедрять как вкладку в Siyoma dashboard;
- не подключать fake backend permanently;
- использовать typed API client или adapter layer.

## Phase 2: Backend Domain MVP

Goal: реализовать core backend для колбасного цеха.

Scope:

- `SausageRawMaterial`;
- `SausageFinishedProduct`;
- `SausageRecipe`;
- `SausageProductionOrder`;
- `SausageProductionBatch`;
- `SausageStock`;
- `SausageStockMovement`;
- raw receipt;
- raw transfer to workshop;
- production completion;
- losses;
- summary.

Rules:

- API namespace `/api/sausage-production`;
- no direct sales/delivery/routes/reps imports;
- all Siyoma calls through ports/adapters.

## Phase 3: Orders, Reservations, Clients

Goal: связать производство с клиентской потребностью без жесткой зависимости
от Siyoma sales.

Scope:

- internal production orders;
- client-linked production orders;
- finished goods reservations;
- reserve/release operations;
- low-stock and planned production indicators.

Important decision:

- production order can be internal;
- client reference is optional at first;
- reservation uses external references.

## Phase 4: Batch Quality And Loss Control

Goal: добавить цеховую аналитику по фактическому выпуску.

Scope:

- planned vs actual output;
- yield percent;
- loss categories;
- defect quantity;
- master/operator fields;
- batch status;
- acceptance status;
- reason codes.

## Phase 5: Documents And Audit

Goal: закрыть операционные документы и traceability.

Scope:

- raw receipt document;
- raw transfer document;
- production batch act;
- write-off act;
- stock adjustment act;
- audit log for critical operations.

## Phase 6: Standalone Readiness

Goal: подготовить отделение от Siyoma.

Scope:

- standalone env config;
- separate database schema or database;
- replace Siyoma adapters with standalone adapters;
- migration/export plan;
- independent deployment plan;
- auth strategy.

Exit criteria:

- `sausage-production` can run without importing Siyoma business modules;
- data model does not require Siyoma-specific foreign keys;
- API and frontend can be deployed separately.


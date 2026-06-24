# TZ 004: Sausage Workshop Real API Integration

## Objective

Подключить frontend `sausage-workshop` к real API слою `sausage-production`,
который был подготовлен в ТЗ-003, сохранив возможность fallback на mock data для
локальной разработки.

Главная цель: заменить прямую зависимость UI от mock data на typed API layer,
не смешивая домен колбасного цеха с Siyoma.

## Context

После предыдущих этапов есть две независимые части:

```text
apps/workshop-dashboard
packages/shared-types
packages/api-client
packages/backend-domain
```

`apps/workshop-dashboard` был создан как отдельный frontend для цеха.

`packages/shared-types`, `packages/api-client` и `packages/backend-domain`
созданы для API contract и доменных правил `sausage-production`.

ТЗ-004 должен связать эти части в один локально запускаемый flow:

```text
workshop-dashboard
  -> packages/api-client
  -> /api/sausage-production/*
  -> packages/backend-domain Express app
```

## Important Branch Dependency

Если на момент выполнения ТЗ-004 frontend PR и backend/API PR еще не слиты в
`main`, исполнитель должен работать в ветке, где доступны обе части:

- UI из ТЗ-002;
- API/domain packages из ТЗ-003.

Нельзя переписывать UI заново, если он уже существует в другой ветке. Нужно
объединить актуальные изменения через merge/rebase или создать рабочую ветку от
ветки, содержащей обе части.

## Non-Goals

- Не писать новую бизнес-логику производства сверх правил ТЗ-003.
- Не создавать PostgreSQL/Prisma persistence.
- Не интегрировать Siyoma backend напрямую.
- Не встраивать `sausage-workshop` как вкладку в Siyoma dashboard.
- Не использовать `/api/production/*`.
- Не удалять mock mode полностью.
- Не делать production deployment.

## Required Architecture

### Frontend API Layer

Frontend должен получать данные через один adapter layer.

Разрешено:

```text
apps/workshop-dashboard/src/api/sausageProductionApi.ts
  -> packages/api-client
```

Запрещено:

```text
screen component -> fetch(...)
screen component -> mockSausageProductionData
screen component -> /api/production
```

Screens должны работать с данными через app state/hooks/services, а не знать,
mock это или real API.

### Backend Dev Server

Нужен локальный backend entrypoint для разработки.

Минимально:

```text
packages/backend-domain/src/devServer.ts
```

или отдельное приложение:

```text
apps/api-server
```

На этом этапе предпочтителен минимальный entrypoint внутри
`packages/backend-domain`, если он не смешивает доменную логику с host-specific
кодом.

Backend должен слушать отдельный порт, например:

```text
http://127.0.0.1:4014
```

Frontend Vite dev server должен проксировать:

```text
/api/sausage-production/* -> http://127.0.0.1:4014
```

### API Namespace

Единственный разрешенный namespace:

```text
/api/sausage-production/*
```

Запрещенный namespace:

```text
/api/production/*
```

## Environment Contract

Frontend должен поддерживать режим источника данных:

```text
VITE_SAUSAGE_API_MODE=real
VITE_SAUSAGE_API_MODE=mock
```

Default:

```text
mock
```

Для локальной real API разработки:

```text
VITE_SAUSAGE_API_MODE=real
VITE_SAUSAGE_API_BASE_URL=/api/sausage-production
```

Rules:

- `mock` mode использует локальные mock данные.
- `real` mode использует `SausageApiClient`.
- UI не должен падать, если backend временно недоступен.
- Ошибка API должна отображаться в рабочем интерфейсе, а не только в console.

## Backend Seed Data

Для локального real API режима backend должен иметь seed data, совместимую с UI:

- raw materials;
- finished products;
- recipes;
- clients;
- production orders;
- stock movements;
- losses;
- dashboard summary.

Seed data может быть in-memory на этом этапе.

Важно: seed data должен соблюдать tenant boundary:

```text
companyId = demo-company
```

## Required Frontend Changes

### 1. Use Shared Types

Frontend domain types должны быть синхронизированы с `packages/shared-types`.

Допустимые варианты:

1. Импортировать DTO напрямую из `sausage-shared-types`.
2. Иметь local UI view models, но mapping должен быть явным:

```text
SausageRawMaterialDto -> RawMaterialViewModel
SausageProductionOrderDto -> ProductionOrderViewModel
```

Нельзя держать расходящиеся enum/status values без mapping.

### 2. Replace Direct Mock Access

Все прямые импорты:

```text
mockSausageProductionData
```

должны остаться только внутри mock adapter.

Screens не должны импортировать mock data.

### 3. Add Loading And Error States

UI должен показывать:

- loading state при первичной загрузке;
- error state при недоступном backend;
- retry action;
- empty state для пустых таблиц.

### 4. Wire Commands

Минимально должны работать через API client:

- raw material receipt;
- raw transfer to workshop;
- production order create;
- production order start;
- production batch release;
- stock write-off.

После успешной команды UI должен обновлять snapshot/list data.

### 5. Preserve Modal Validation

Frontend validation из ТЗ-002 остается:

```text
acceptedQty + rejectedQty <= producedQty
```

Backend validation из ТЗ-003 также остается обязательной.

Frontend не должен считать свою validation достаточной.

## Required Backend Changes

### 1. Dev App Entrypoint

Добавить команду запуска backend:

```text
npm run dev:api
```

или workspace command:

```text
npm run dev -w sausage-backend-domain
```

### 2. Read Endpoints Return Real In-Memory Data

Минимально:

```text
GET /api/sausage-production/dashboard
GET /api/sausage-production/raw-materials
GET /api/sausage-production/finished-products
GET /api/sausage-production/recipes
GET /api/sausage-production/clients
GET /api/sausage-production/orders
GET /api/sausage-production/batches
GET /api/sausage-production/stock-movements
GET /api/sausage-production/losses
GET /api/sausage-production/analytics/summary
```

### 3. Command Endpoints Use Services

Минимально:

```text
POST /api/sausage-production/raw-materials/:id/receipt
POST /api/sausage-production/raw-materials/:id/transfer-to-workshop
POST /api/sausage-production/orders
POST /api/sausage-production/orders/:id/start
POST /api/sausage-production/batches/release
POST /api/sausage-production/stock/write-off
```

### 4. CORS And JSON

Для локальной разработки backend должен принимать JSON и, если Vite proxy не
используется, поддерживать CORS только для local dev origin.

## Testing Requirements

### Backend Tests

Добавить или расширить tests:

- dashboard endpoint returns non-empty demo snapshot;
- list endpoints return tenant-scoped seed data;
- command endpoints mutate in-memory state;
- command endpoint errors use `SausageApiError`;
- `/api/production/*` still returns 404.

### API Client Tests

Добавить tests для `packages/api-client`:

- builds URLs under `/api/sausage-production`;
- rejects `/api/production`;
- propagates API error body;
- calls command endpoints with JSON body.

### Frontend Tests

Добавить tests для `apps/workshop-dashboard`:

- app renders from real API adapter mock;
- loading state appears;
- error state appears with retry action;
- release modal blocks invalid accepted/rejected quantity;
- screens do not import `mockSausageProductionData` directly.

### Architecture Boundary Tests

Добавить script/test, который проверяет:

- no `/api/production` in runtime API code except negative tests/docs;
- no direct imports from Siyoma business modules;
- no screen-level import of mock data.

## Run Requirements

После выполнения должно быть возможно запустить:

```bash
npm install
npm test
npm run build
```

И локальный dev flow:

```bash
npm run dev:api
npm run dev -w sausage-workshop
```

Если frontend package называется иначе, команда должна быть указана в README.

## Documentation Updates

Обновить:

```text
README.md
apps/workshop-dashboard/README.md
```

Документация должна объяснять:

- как запустить frontend в mock mode;
- как запустить frontend в real API mode;
- какой backend port используется;
- какой API namespace используется;
- что `/api/production/*` запрещен.

## Acceptance Criteria

- Frontend может работать в `mock` mode.
- Frontend может работать в `real` mode через `SausageApiClient`.
- Backend dev server запускается локально.
- Vite proxy направляет `/api/sausage-production/*` на backend dev server.
- Dashboard получает данные из backend in-memory seed в real mode.
- Команды receipt, transfer, order create, order start, release и write-off
  проходят через backend service layer.
- После command UI обновляет данные.
- Все tests проходят.
- Clean build проходит после удаления `dist`.
- Нет runtime usage `/api/production/*`.
- Нет прямых imports из Siyoma business modules.
- Mock data не импортируется screen components напрямую.

## Next TZ

После ТЗ-004 рекомендуемый следующий документ:

```text
TZ_005_SAUSAGE_PRODUCTION_PERSISTENCE.md
```

Scope:

- database schema;
- migrations;
- repository implementation;
- persistence tests;
- seed/dev data;
- migration path from in-memory repositories.

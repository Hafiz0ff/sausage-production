# Sausage Production Architecture

## Статус

Этот документ фиксирует целевую архитектуру до начала разработки.

`sausage-production` стартует как отдельный репозиторий и отдельный домен,
который может интегрироваться с Siyoma. При этом все решения должны сохранять
возможность последующего выделения в независимый продукт.

## Целевая структура репозитория

```text
sausage-production/
  apps/
    workshop-dashboard/       # отдельный frontend для цеха
  packages/
    backend-domain/           # доменная логика sausage-production
    api-client/               # typed API client для frontend
    shared-types/             # общие типы, DTO, enums
  docs/
    architecture/
    plans/
    rules/
    tz/
```

На первом этапе допускается более простая структура, но названия должны
сохранять границу домена.

## Доменная модель

Базовые сущности:

- `SausageRawMaterial`
- `SausageFinishedProduct`
- `SausageRecipe`
- `SausageRecipeItem`
- `SausageProductionOrder`
- `SausageProductionBatch`
- `SausageStock`
- `SausageStockMovement`
- `SausageLoss`
- `SausageReservation`

Если используется SQL naming, таблицы должны иметь префикс `sausage_`.

Примеры:

- `sausage_raw_materials`
- `sausage_finished_products`
- `sausage_production_orders`
- `sausage_stock_movements`

## API Namespace

Все API маршруты должны начинаться с:

```text
/api/sausage-production
```

Примеры:

```text
GET  /api/sausage-production/summary
POST /api/sausage-production/raw-materials
POST /api/sausage-production/raw-receipts
POST /api/sausage-production/transfers/raw-to-workshop
POST /api/sausage-production/orders
POST /api/sausage-production/orders/:id/start
POST /api/sausage-production/orders/:id/complete
GET  /api/sausage-production/batches
GET  /api/sausage-production/losses
```

Запрещено создавать новые маршруты под `/api/production` для этого домена.

## Dependency Direction

Разрешенное направление зависимостей:

```text
apps/workshop-dashboard
  -> packages/api-client
  -> packages/shared-types

packages/backend-domain
  -> ports
  -> adapters
  -> host platform
```

Доменная логика не должна импортировать Siyoma modules напрямую.

Запрещено:

```text
sausage-production -> src/modules/sales
sausage-production -> src/modules/delivery
sausage-production -> src/modules/routes
sausage-production -> src/modules/reps
sausage-production -> src/modules/inventory
```

Разрешено только через port interface:

```text
ClientPort
InventoryPort
DocumentPort
AuthPort
AuditPort
NotificationPort
```

## Separation Strategy

Система проектируется в два режима.

### Hosted Mode

На старте `sausage-production` работает рядом с Siyoma:

- использует Siyoma auth;
- использует Siyoma company/users;
- может использовать общую PostgreSQL БД;
- интегрируется через adapters.

### Standalone Mode

Позже `sausage-production` может быть вынесен:

- отдельный backend;
- отдельная БД;
- собственная auth/user model или внешний identity provider;
- собственный frontend deployment;
- собственные migrations.

Для этого в коде нельзя смешивать доменную логику с host-specific логикой.

## Frontend Principle

`sausage-workshop` должен быть отдельным приложением, а не вкладкой внутри
Siyoma dashboard.

Основные экраны:

- Дашборд производства;
- Заказы на производство;
- Партии выпуска;
- Перемещения;
- Сырье;
- Готовая продукция;
- Рецептуры;
- Клиенты/резервы;
- Потери;
- Аналитика.

Визуальная основа: плотный операционный интерфейс, похожий на цеховой control
room: темная рабочая поверхность, таблицы, KPI, быстрые действия, минимум
маркетингового текста.


# TZ 003: Sausage Production API Contract

## Objective

Зафиксировать backend API contract и доменные правила для
`sausage-production`, чтобы `sausage-workshop` мог перейти с mock data на real
API без переписывания UI и без смешивания с Siyoma beverage/water domain.

Этот ТЗ является подготовкой к backend implementation. В рамках ТЗ-003 код
backend не пишется.

## Context

После ТЗ-002 у `sausage-production` есть отдельный frontend workspace:

```text
apps/workshop-dashboard
```

Frontend должен работать через namespace:

```text
/api/sausage-production/*
```

Новый backend contract должен повторять данные, которые нужны цеховой панели:

- сырье на основном складе;
- сырье в цехе;
- готовая продукция на складе;
- заказы на производство;
- партии выпуска;
- перемещения;
- потери;
- рецептуры;
- клиенты;
- аналитика и dashboard summary.

## Non-Goals

- Не писать backend implementation.
- Не создавать Prisma schema.
- Не делать migrations.
- Не менять `apps/workshop-dashboard`.
- Не подключать frontend к real API.
- Не переносить backend Siyoma.
- Не использовать `/api/production/*`.
- Не проектировать полный HACCP, QR, этикетки и маркировку.

## Naming Rules

Все backend types, DTO, services, routes и будущие tables должны явно иметь
контекст `sausage`.

Разрешено:

```text
SausageRawMaterial
SausageFinishedProduct
SausageRecipe
SausageProductionOrder
SausageProductionBatch
SausageStockMovement
SausageLoss
sausageProductionRouter
sausageProductionService
/api/sausage-production
```

Запрещено:

```text
ProductionOrder
RawMaterial
FinishedProduct
StockMovement
productionRouter
/api/production
```

Исключение: внутри frontend label можно показывать короткие пользовательские
названия вроде `Сырье`, `Готовая продукция`, `Партии выпуска`.

## API Namespace

Все endpoints должны начинаться с:

```text
/api/sausage-production
```

Запрещенный namespace:

```text
/api/production
```

Backend tests должны отдельно проверять, что route registry не содержит
`/api/production` для `sausage-production`.

## Tenant Boundary

Все core-сущности должны иметь tenant boundary.

Минимально:

```ts
companyId: string;
```

Дополнительно для режима hosted integration допускаются external references:

```ts
hostCompanyId?: string;
externalClientId?: string;
externalOrderId?: string;
externalWarehouseId?: string;
```

Доменная логика не должна зависеть от Siyoma foreign keys напрямую. Любая связь
с host platform должна идти через port/adapter.

## Common DTO Fields

Все DTO, которые возвращают persisted entities, должны содержать:

```ts
id: string;
companyId: string;
createdAt: string; // ISO datetime
updatedAt: string; // ISO datetime
```

Для журналируемых операций:

```ts
createdByUserId: string;
createdByName?: string;
```

Для денежных значений на первом этапе допускается строка display value в read
DTO, но command DTO должен использовать числовое значение и currency:

```ts
amount: number;
currency: 'TJS' | 'USD';
```

## Domain Enums

### SausageStockLocation

```ts
type SausageStockLocation =
  | 'RAW_WAREHOUSE'
  | 'WORKSHOP'
  | 'FINISHED_WAREHOUSE'
  | 'LOSS'
  | 'ADJUSTMENT';
```

Правила:

- `RAW_WAREHOUSE` хранит сырье на основном складе.
- `WORKSHOP` хранит сырье, уже переданное в цех.
- `FINISHED_WAREHOUSE` хранит готовую продукцию.
- `LOSS` используется только для списаний и потерь.
- `ADJUSTMENT` используется только для корректировок с причиной.

### SausageMovementType

```ts
type SausageMovementType =
  | 'RAW_RECEIPT'
  | 'RAW_TRANSFER_TO_WORKSHOP'
  | 'RAW_CONSUMPTION'
  | 'FINISHED_RELEASE'
  | 'LOSS_WRITE_OFF'
  | 'STOCK_ADJUSTMENT';
```

### SausageProductionOrderStatus

```ts
type SausageProductionOrderStatus =
  | 'PLANNED'
  | 'WAITING_MATERIALS'
  | 'IN_PROGRESS'
  | 'RELEASED'
  | 'ACCEPTED'
  | 'SHIPPED'
  | 'CANCELLED';
```

Allowed transitions:

```text
PLANNED -> WAITING_MATERIALS
PLANNED -> IN_PROGRESS
WAITING_MATERIALS -> IN_PROGRESS
IN_PROGRESS -> RELEASED
RELEASED -> ACCEPTED
ACCEPTED -> SHIPPED
PLANNED -> CANCELLED
WAITING_MATERIALS -> CANCELLED
```

Forbidden transitions:

```text
CANCELLED -> any status
SHIPPED -> any status
ACCEPTED -> IN_PROGRESS
RELEASED -> PLANNED
```

### SausageStockStatus

```ts
type SausageStockStatus =
  | 'OK'
  | 'LOW'
  | 'CRITICAL';
```

### SausageLossReason

```ts
type SausageLossReason =
  | 'TRIMMING'
  | 'THERMAL_LOSS'
  | 'DEFECT'
  | 'EXPIRY'
  | 'CALIBRATION'
  | 'OTHER';
```

## Core DTOs

### SausageRawMaterialDto

```ts
interface SausageRawMaterialDto {
  id: string;
  companyId: string;
  name: string;
  group: string;
  unit: 'kg' | 'pcs' | 'pack';
  warehouseQty: number;
  workshopQty: number;
  reservedQty: number;
  minQty: number;
  status: SausageStockStatus;
  supplierName?: string;
  createdAt: string;
  updatedAt: string;
}
```

### SausageFinishedProductDto

```ts
interface SausageFinishedProductDto {
  id: string;
  companyId: string;
  name: string;
  sku: string;
  unit: 'kg' | 'pcs' | 'pack';
  stockQty: number;
  stockPcs?: number;
  reservedQty: number;
  shelfLifeDays?: number;
  status: SausageStockStatus;
  createdAt: string;
  updatedAt: string;
}
```

### SausageRecipeDto

```ts
interface SausageRecipeDto {
  id: string;
  companyId: string;
  finishedProductId: string;
  finishedProductName: string;
  outputQty: number;
  expectedYieldPercent: number;
  items: SausageRecipeItemDto[];
  createdAt: string;
  updatedAt: string;
}

interface SausageRecipeItemDto {
  id: string;
  rawMaterialId: string;
  rawMaterialName: string;
  quantityQty: number;
}
```

### SausageClientDto

```ts
interface SausageClientDto {
  id: string;
  companyId: string;
  name: string;
  segment: 'RETAIL' | 'WHOLESALE' | 'HORECA' | 'INTERNAL' | 'OTHER';
  phone?: string;
  externalClientId?: string;
  balanceAmount?: number;
  balanceCurrency?: 'TJS' | 'USD';
  lastOrderAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

### SausageProductionOrderDto

```ts
interface SausageProductionOrderDto {
  id: string;
  companyId: string;
  number: string;
  finishedProductId: string;
  finishedProductName: string;
  quantityQty: number;
  clientId?: string;
  clientName: string;
  status: SausageProductionOrderStatus;
  progressPercent: number;
  dueAt?: string;
  shift?: string;
  externalOrderId?: string;
  createdAt: string;
  updatedAt: string;
}
```

### SausageProductionBatchDto

```ts
interface SausageProductionBatchDto {
  id: string;
  companyId: string;
  batchNo: string;
  productionOrderId: string;
  productionOrderNumber: string;
  finishedProductId: string;
  finishedProductName: string;
  producedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  yieldPercent: number;
  releasedAt: string;
  createdAt: string;
  updatedAt: string;
}
```

### SausageStockMovementDto

```ts
interface SausageStockMovementDto {
  id: string;
  companyId: string;
  docNo: string;
  type: SausageMovementType;
  itemKind: 'RAW_MATERIAL' | 'FINISHED_PRODUCT';
  itemId: string;
  itemName: string;
  quantityQty: number;
  fromLocation: SausageStockLocation;
  toLocation: SausageStockLocation;
  productionOrderId?: string;
  productionBatchId?: string;
  reason?: string;
  createdByUserId: string;
  createdByName?: string;
  createdAt: string;
}
```

### SausageLossDto

```ts
interface SausageLossDto {
  id: string;
  companyId: string;
  docNo: string;
  itemKind: 'RAW_MATERIAL' | 'FINISHED_PRODUCT';
  itemId: string;
  itemName: string;
  reason: SausageLossReason;
  quantityQty: number;
  costAmount?: number;
  costCurrency?: 'TJS' | 'USD';
  productionOrderId?: string;
  productionBatchId?: string;
  createdByUserId: string;
  createdByName?: string;
  createdAt: string;
}
```

## Command DTOs

### Create Raw Material

```ts
interface CreateSausageRawMaterialInput {
  name: string;
  group: string;
  unit: 'kg' | 'pcs' | 'pack';
  minQty: number;
  supplierName?: string;
}
```

### Receive Raw Material

```ts
interface ReceiveSausageRawMaterialInput {
  rawMaterialId: string;
  quantityQty: number;
  supplierName?: string;
  externalDocumentNo?: string;
  note?: string;
}
```

Rules:

- `quantityQty > 0`.
- Creates `RAW_RECEIPT` movement.
- Increases `RAW_WAREHOUSE` balance.

### Transfer Raw Material To Workshop

```ts
interface TransferSausageRawToWorkshopInput {
  rawMaterialId: string;
  quantityQty: number;
  productionOrderId?: string;
  note?: string;
}
```

Rules:

- `quantityQty > 0`.
- Available raw warehouse balance must be enough.
- Decreases `RAW_WAREHOUSE`.
- Increases `WORKSHOP`.
- Creates `RAW_TRANSFER_TO_WORKSHOP` movement.

### Create Production Order

```ts
interface CreateSausageProductionOrderInput {
  finishedProductId: string;
  quantityQty: number;
  clientId?: string;
  clientName?: string;
  dueAt?: string;
  shift?: string;
  externalOrderId?: string;
}
```

Rules:

- `quantityQty > 0`.
- If no `clientId`, order is treated as internal.
- Initial status is `PLANNED` or `WAITING_MATERIALS`, depending on raw stock
  availability.

### Start Production Order

```ts
interface StartSausageProductionOrderInput {
  productionOrderId: string;
}
```

Rules:

- Allowed only from `PLANNED` or `WAITING_MATERIALS`.
- Required raw materials must be available in `WORKSHOP` or transferable from
  `RAW_WAREHOUSE`.
- Status becomes `IN_PROGRESS`.

### Release Production Batch

```ts
interface ReleaseSausageProductionBatchInput {
  productionOrderId: string;
  producedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  lossReason?: SausageLossReason;
  note?: string;
}
```

Rules:

- `producedQty > 0`.
- `acceptedQty >= 0`.
- `rejectedQty >= 0`.
- `acceptedQty + rejectedQty <= producedQty`.
- `acceptedQty` increases `FINISHED_WAREHOUSE`.
- consumed recipe raw materials decrease `WORKSHOP`.
- creates `RAW_CONSUMPTION` movements for consumed raw materials.
- creates `FINISHED_RELEASE` movement for accepted finished goods.
- if `rejectedQty > 0`, creates `SausageLossDto` and `LOSS_WRITE_OFF`
  movement.
- production order status becomes `RELEASED` if not all quantity is accepted,
  or `ACCEPTED` if the order is fully accepted.

### Write Off Stock

```ts
interface WriteOffSausageStockInput {
  itemKind: 'RAW_MATERIAL' | 'FINISHED_PRODUCT';
  itemId: string;
  location: SausageStockLocation;
  quantityQty: number;
  reason: SausageLossReason;
  note?: string;
}
```

Rules:

- `quantityQty > 0`.
- Source balance must be enough.
- Creates `LOSS_WRITE_OFF` movement.
- Creates `SausageLossDto`.
- Decreases selected stock location.

## Endpoint Contract

### Dashboard

```text
GET /api/sausage-production/dashboard
```

Returns:

```ts
interface SausageDashboardDto {
  metrics: Array<{
    id: string;
    label: string;
    value: string;
    unit?: string;
    delta?: string;
    tone: 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  }>;
  activeOrders: SausageProductionOrderDto[];
  criticalRawStock: SausageRawMaterialDto[];
  hourlyOutput: Array<{ hour: string; valueQty: number }>;
  recentEvents: Array<{
    id: string;
    text: string;
    meta: string;
    tone: 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  }>;
  finishedProducts: SausageFinishedProductDto[];
  losses: SausageLossDto[];
}
```

### Raw Materials

```text
GET  /api/sausage-production/raw-materials
POST /api/sausage-production/raw-materials
POST /api/sausage-production/raw-materials/:id/receipt
POST /api/sausage-production/raw-materials/:id/transfer-to-workshop
```

### Finished Products

```text
GET  /api/sausage-production/finished-products
POST /api/sausage-production/finished-products
```

### Recipes

```text
GET  /api/sausage-production/recipes
POST /api/sausage-production/recipes
PUT  /api/sausage-production/recipes/:id
```

### Clients

```text
GET  /api/sausage-production/clients
POST /api/sausage-production/clients
```

### Production Orders

```text
GET  /api/sausage-production/orders
POST /api/sausage-production/orders
POST /api/sausage-production/orders/:id/start
POST /api/sausage-production/orders/:id/cancel
POST /api/sausage-production/orders/:id/ship
```

### Production Batches

```text
GET  /api/sausage-production/batches
POST /api/sausage-production/batches/release
```

### Stock Movements

```text
GET  /api/sausage-production/stock-movements
POST /api/sausage-production/stock/write-off
POST /api/sausage-production/stock/adjustment
```

### Losses

```text
GET /api/sausage-production/losses
```

### Analytics

```text
GET /api/sausage-production/analytics/summary
```

Returns aggregated production, stock, loss, and yield metrics for selected
period.

## Query Parameters

List endpoints should support a minimal shared query contract:

```text
?from=2026-06-01
&to=2026-06-24
&status=IN_PROGRESS
&search=doctor
&limit=50
&offset=0
```

Rules:

- `limit` default: `50`.
- `limit` max: `200`.
- date filters use ISO date or ISO datetime.
- backend always scopes data by authenticated company/tenant.

## Error Contract

All errors should use the same response shape:

```ts
interface SausageApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
```

Required error codes:

```text
SAUSAGE_VALIDATION_ERROR
SAUSAGE_NOT_FOUND
SAUSAGE_FORBIDDEN_TRANSITION
SAUSAGE_INSUFFICIENT_STOCK
SAUSAGE_NEGATIVE_STOCK_FORBIDDEN
SAUSAGE_RELEASE_QTY_INVALID
SAUSAGE_NAMESPACE_VIOLATION
```

HTTP mapping:

```text
400 validation/domain rule error
401 unauthenticated
403 unauthorized
404 not found
409 stock conflict or forbidden status transition
500 unexpected server error
```

## Stock Rules

### Source Of Truth

Stock balances are derived from `SausageStockMovement`.

Materialized stock rows are allowed for performance, but movement journal is the
audit source of truth.

### Separate Balances

These balances must be stored and reported separately:

- raw material in `RAW_WAREHOUSE`;
- raw material in `WORKSHOP`;
- finished product in `FINISHED_WAREHOUSE`;
- losses/write-offs.

Frontend labels:

```text
Сырье на складе
Сырье в цехе
Готовая продукция
Потери
```

### Negative Stock

Negative stock is forbidden.

Every command that decreases stock must validate available balance before
creating movements.

### Reservation

At MVP level reservation can be read-only/calculated.

Future reservation entity:

```text
SausageReservation
```

Reservation must not decrease stock physically. It only reduces available
quantity.

## Production Rules

### Order To Batch Flow

Required flow:

```text
SausageProductionOrder
  -> SausageProductionBatch
  -> SausageStockMovement
  -> SausageLoss optional
```

### Recipe Consumption

When releasing a batch, backend should calculate raw material consumption from
recipe ratio:

```text
requiredRawQty = recipeItem.quantityQty * producedQty / recipe.outputQty
```

MVP can allow manual correction later, but default consumption must come from
recipe.

### Yield

```text
yieldPercent = acceptedQty / consumedRawQty * 100
```

If consumed raw quantity is zero, yield is `0` and backend should log a domain
warning.

### Losses

Losses must be explicit.

Thermal loss, trimming, defect, expiry and calibration must be distinguishable.
Losses should connect to order/batch when known.

## Integration Ports

Backend domain may depend on these ports only as interfaces:

```ts
interface SausageAuthPort
interface SausageAuditPort
interface SausageClientPort
interface SausageDocumentPort
interface SausageNotificationPort
interface SausageWarehousePort
```

Forbidden direct imports:

```text
Siyoma sales module
Siyoma delivery module
Siyoma inventory module
Siyoma route planning module
Siyoma mobile agent modules
```

Adapters may live in hosted/integration layer, not inside domain service.

## Security And Permissions

MVP roles:

```text
SAUSAGE_ADMIN
SAUSAGE_MANAGER
SAUSAGE_WORKSHOP_MASTER
SAUSAGE_VIEWER
```

Minimum permissions:

- viewer can read dashboard, lists and analytics;
- workshop master can create transfers, releases and losses;
- manager can create orders, products, recipes and clients;
- admin can manage all actions.

Every command endpoint must use authenticated company context. Client-supplied
`companyId` must not override authenticated tenant.

## Audit Requirements

Every state-changing command must create audit data:

- actor user;
- company;
- command name;
- before/after status when status changes;
- affected entity ID;
- movement doc number when stock changes.

Audit can be implemented through host platform adapter, but domain service must
emit explicit audit events.

## Testing Requirements

ТЗ-004 backend implementation must include tests for:

- API namespace starts with `/api/sausage-production`;
- no backend route starts with `/api/production`;
- no direct import from forbidden Siyoma modules;
- negative stock is rejected;
- transfer decreases `RAW_WAREHOUSE` and increases `WORKSHOP`;
- release consumes `WORKSHOP` raw materials;
- release increases `FINISHED_WAREHOUSE`;
- `acceptedQty + rejectedQty > producedQty` is rejected;
- order status transitions follow allowed transition table;
- loss write-off creates both movement and loss record;
- tenant isolation: company A cannot read/write company B records.

## Acceptance Criteria

- ТЗ-003 exists at:

```text
docs/tz/TZ_003_SAUSAGE_PRODUCTION_API_CONTRACT.md
```

- API namespace is fixed as `/api/sausage-production/*`.
- DTOs for all MVP entities are defined.
- Command DTOs for key operations are defined.
- Stock locations and movement types are defined.
- Production order statuses and allowed transitions are defined.
- Stock rules explicitly separate warehouse, workshop and finished goods.
- Negative stock is forbidden.
- Release rules cover accepted, rejected, consumed and loss quantities.
- Ports/adapters boundary with Siyoma is documented.
- Backend test requirements are listed.

## Next TZ

Recommended next document:

```text
TZ_004_SAUSAGE_PRODUCTION_BACKEND_IMPLEMENTATION.md
```

Scope of TZ-004:

- backend package/module structure;
- persistence schema;
- repository/service/controller layers;
- route registration;
- tests;
- local run instructions;
- first integration point for `apps/workshop-dashboard`.

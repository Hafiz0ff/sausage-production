# TZ-006: Orders, Reservations, Clients

## Objective

Добавить в `sausage-production` слой клиентских заказов, резервирования готовой
продукции и расчета производственной потребности.

После TZ-005 данные уже могут храниться в PostgreSQL через Prisma. TZ-006 должен
связать клиентскую потребность с готовой продукцией и производственными заказами
без прямой зависимости от Siyoma sales/client/order modules.

## Scope

Нужно добавить:

- клиентские заказы;
- позиции клиентских заказов;
- резервы готовой продукции;
- расчет дефицита готовой продукции;
- создание production order из дефицита;
- frontend screens для заказов клиентов и потребности производства.

## Non-Goals

- Не делать delivery/shipping module.
- Не делать invoices/payments.
- Не делать реальную интеграцию с Siyoma CRM.
- Не добавлять отдельный auth layer.
- Не менять существующий namespace `/api/sausage-production/*`.
- Не удалять memory storage mode.

## Architecture Rules

Все новые backend endpoints должны быть только под:

```text
/api/sausage-production/*
```

Запрещено:

```text
/api/production/*
/api/sales/*
/api/clients/*
```

Все новые Prisma models должны иметь prefix `Sausage`.
Все новые SQL tables должны иметь prefix `sausage_`.

Service layer должен работать через repository contract. Прямой импорт Prisma в
service layer запрещен.

Tenant scope должен приходить из `SausageAuthPort`, а не из произвольных request
headers.

## Domain Entities

### SausageSalesOrder

Клиентский заказ или внутренняя потребность.

Minimum fields:

- `id`
- `companyId`
- `number`
- `clientId`
- `clientName`
- `externalOrderId`
- `status`
- `requestedDate`
- `dueDate`
- `note`
- `createdAt`
- `updatedAt`

Statuses:

- `DRAFT`
- `CONFIRMED`
- `PARTIALLY_RESERVED`
- `RESERVED`
- `IN_PRODUCTION`
- `READY`
- `COMPLETED`
- `CANCELLED`

### SausageSalesOrderItem

Minimum fields:

- `id`
- `companyId`
- `salesOrderId`
- `finishedProductId`
- `finishedProductName`
- `quantityQty`
- `reservedQty`
- `producedQty`
- `shippedQty`
- `shortageQty`
- `createdAt`
- `updatedAt`

### SausageFinishedGoodsReservation

Minimum fields:

- `id`
- `companyId`
- `salesOrderId`
- `salesOrderItemId`
- `finishedProductId`
- `finishedProductName`
- `quantityQty`
- `status`
- `createdByUserId`
- `createdByName`
- `createdAt`
- `releasedAt`
- `completedAt`
- `reason`

Statuses:

- `ACTIVE`
- `RELEASED`
- `COMPLETED`
- `CANCELLED`

## API Endpoints

Client orders:

```text
GET  /api/sausage-production/sales-orders
GET  /api/sausage-production/sales-orders/:id
POST /api/sausage-production/sales-orders
POST /api/sausage-production/sales-orders/:id/confirm
POST /api/sausage-production/sales-orders/:id/cancel
```

Reservations:

```text
GET  /api/sausage-production/reservations
POST /api/sausage-production/sales-orders/:id/reserve
POST /api/sausage-production/reservations/:id/release
POST /api/sausage-production/reservations/:id/complete
```

Production demand:

```text
GET  /api/sausage-production/production-demand
POST /api/sausage-production/production-demand/create-production-order
```

## Reservation Rules

Available finished stock:

```text
availableQty = finishedProduct.stockQty - finishedProduct.reservedQty
```

Reserve:

- quantity must be greater than zero;
- cannot reserve more than available stock unless partial reservation is allowed;
- increases `finishedProduct.reservedQty`;
- increases `salesOrderItem.reservedQty`;
- decreases `salesOrderItem.shortageQty`;
- creates `SausageFinishedGoodsReservation` with `ACTIVE` status;
- updates order status to `PARTIALLY_RESERVED` or `RESERVED`;
- runs in one transaction.

Release:

- only `ACTIVE` reservations can be released;
- decreases `finishedProduct.reservedQty`;
- decreases `salesOrderItem.reservedQty`;
- increases `salesOrderItem.shortageQty`;
- marks reservation as `RELEASED`;
- must never hide negative balances with `Math.max`;
- runs in one transaction.

Complete:

- only `ACTIVE` reservations can be completed;
- decreases `finishedProduct.stockQty`;
- decreases `finishedProduct.reservedQty`;
- decreases `salesOrderItem.reservedQty`;
- increases `salesOrderItem.shippedQty`;
- marks reservation as `COMPLETED`;
- updates order to `COMPLETED` when every item is shipped;
- runs in one transaction.

## Production Demand Rules

`GET /production-demand` must return one row per finished product:

- required quantity from active confirmed/reserved/in-production sales orders;
- available finished stock;
- reserved quantity;
- shortage quantity;
- suggested production quantity;
- linked production orders when available.

Creating a production order from demand must:

- validate product exists in current tenant;
- validate quantity is greater than zero;
- create a normal `SausageProductionOrder`;
- optionally mark linked sales order as `IN_PRODUCTION`.

## Frontend Scope

Add workshop dashboard screens:

- `SalesOrdersScreen`;
- `ProductionDemandScreen`.

The UI must use `packages/api-client`; screen components must not call `fetch`
directly and must not import mock data directly.

## Tests

Required coverage:

- create sales order;
- confirm sales order;
- tenant isolation for sales order creation;
- reject over-reservation;
- reserve finished goods;
- release reservation restores reserved quantities;
- complete reservation decreases finished stock and reserved quantity;
- production demand shows shortage;
- create production order from demand;
- `/api/production/*` remains unavailable;
- architecture check passes.

## Verification

Required commands:

```text
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

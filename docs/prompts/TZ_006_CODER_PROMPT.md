# Coder Prompt: Execute TZ 006

```text
Работай только в main.

Репозиторий:

/Users/hafizov/sausage-production

Основной документ:

/Users/hafizov/sausage-production/docs/tz/TZ_006_ORDERS_RESERVATIONS_CLIENTS.md

Перед началом прочитай:

1. /Users/hafizov/sausage-production/docs/tz/TZ_006_ORDERS_RESERVATIONS_CLIENTS.md
2. /Users/hafizov/sausage-production/docs/tz/TZ_005_SAUSAGE_PRODUCTION_PERSISTENCE.md
3. /Users/hafizov/sausage-production/docs/rules/BOUNDARIES.md
4. /Users/hafizov/sausage-production/docs/rules/DEVELOPMENT_RULES.md
5. /Users/hafizov/sausage-production/docs/architecture/ARCHITECTURE.md
6. /Users/hafizov/sausage-production/docs/plans/ROADMAP.md

Контекст:

- Backend persistence уже реализован через repository contract и Prisma.
- Frontend живет отдельно в `apps/workshop-dashboard`.
- Единственный API namespace: `/api/sausage-production/*`.
- Прямые импорты из Siyoma business modules запрещены.
- Интеграция с внешними клиентами/заказами допускается только через nullable external references или future ports.

Задача:

Реализовать слой клиентских заказов, резервов готовой продукции и расчета производственной потребности.

Что сделать:

1. Добавить shared DTO/enums/input types:
   - `SausageSalesOrderDto`;
   - `SausageSalesOrderItemDto`;
   - `SausageFinishedGoodsReservationDto`;
   - `SausageProductionDemandDto`;
   - create/confirm/cancel/reserve/release/complete/create-production-order inputs.
2. Добавить Prisma models/tables:
   - `SausageSalesOrder` -> `sausage_sales_orders`;
   - `SausageSalesOrderItem` -> `sausage_sales_order_items`;
   - `SausageFinishedGoodsReservation` -> `sausage_finished_goods_reservations`.
3. Расширить repository contract, InMemory repository и Prisma repository.
4. Добавить backend service для sales orders/reservations/demand.
5. Добавить endpoints только под `/api/sausage-production/*`:
   - `GET /sales-orders`;
   - `GET /sales-orders/:id`;
   - `POST /sales-orders`;
   - `POST /sales-orders/:id/confirm`;
   - `POST /sales-orders/:id/cancel`;
   - `POST /sales-orders/:id/reserve`;
   - `GET /reservations`;
   - `POST /reservations/:id/release`;
   - `POST /reservations/:id/complete`;
   - `GET /production-demand`;
   - `POST /production-demand/create-production-order`.
6. Обновить `packages/api-client`.
7. Добавить frontend screens:
   - sales orders;
   - production demand.
8. Интегрировать экраны в навигацию workshop dashboard.

Обязательные business rules:

- Заказ создается в `DRAFT`.
- Подтвердить можно только `DRAFT`.
- Резервировать можно только confirmed/active order states.
- Нельзя зарезервировать больше, чем `finishedProduct.stockQty - finishedProduct.reservedQty`, если partial reserve не разрешен.
- Partial reserve должен резервировать только доступное количество.
- При резерве:
  - `finishedProduct.reservedQty` увеличивается;
  - `salesOrderItem.reservedQty` увеличивается;
  - `salesOrderItem.shortageQty` уменьшается;
  - создается active reservation;
  - order status становится `PARTIALLY_RESERVED` или `RESERVED`.
- При release:
  - reservation становится `RELEASED`;
  - `finishedProduct.reservedQty` уменьшается;
  - `salesOrderItem.reservedQty` уменьшается;
  - `salesOrderItem.shortageQty` увеличивается;
  - отрицательные остатки запрещены.
- При complete:
  - reservation становится `COMPLETED`;
  - `finishedProduct.stockQty` и `reservedQty` уменьшаются;
  - `salesOrderItem.shippedQty` увеличивается;
  - order становится `COMPLETED`, когда все позиции отгружены.
- Все reserve/release/complete/create-production-order операции должны быть transactional.

Запреты:

- Не использовать `/api/production/*`.
- Не импортировать Siyoma sales/client/order modules напрямую.
- Не менять существующие API пути из TZ-003/TZ-004/TZ-005.
- Не удалять memory mode.
- Не делать delivery, invoice, payment или auth module.
- Не создавать новую ветку.

Обязательные проверки:

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

- commit и push только в `main`;
- не создавать feature branch.
```

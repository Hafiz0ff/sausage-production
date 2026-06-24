# Siyoma Integration

## Goal

На стартовом этапе `sausage-production` может использовать Siyoma как host
platform, но должен быть готов к отделению.

Интеграция строится через ports/adapters.

## Integration Modes

### Mode 1: Hosted In Siyoma

Используется на раннем этапе:

- Siyoma запускает backend;
- `sausage-production` routes подключены в host API;
- таблицы могут находиться в общей PostgreSQL БД;
- auth/company/users берутся из Siyoma;
- frontend `sausage-workshop` ходит в Siyoma-hosted API.

### Mode 2: Sidecar Service

Промежуточный вариант:

- отдельный backend process;
- своя API namespace;
- общая auth через token validation;
- отдельные migrations;
- может использовать ту же БД или отдельную schema.

### Mode 3: Standalone Product

Целевое отделение:

- отдельный backend;
- отдельная БД;
- собственная auth или внешний identity provider;
- интеграция с Siyoma только через public API/webhooks/import-export.

## Ports

### AuthPort

Нужен для проверки пользователя и роли.

Методы:

```text
getCurrentUser()
requireRole(role)
getCompanyScope()
```

### ClientPort

Нужен для связи производственного заказа с клиентом.

Методы:

```text
findClientById(clientId)
listClients(query)
```

В standalone mode клиент может храниться внутри `sausage-production`.

### FinishedGoodsReservationPort

Нужен для резерва готовой продукции под клиента или заказ.

Методы:

```text
reserveFinishedGoods(input)
releaseReservation(reservationId)
listReservations(filters)
```

### DocumentPort

Нужен для актов производства, внутренней накладной, перемещения сырья,
партии выпуска.

Методы:

```text
generateProductionDocument(input)
generateStockMovementDocument(input)
```

### AuditPort

Нужен для журналирования критичных действий:

- приемка сырья;
- передача сырья в цех;
- списание;
- выпуск партии;
- корректировка остатков;
- отмена производственного заказа.

Методы:

```text
recordAuditEvent(event)
```

## Adapter Rule

Adapter может знать о Siyoma.

Domain service не может знать о Siyoma.

Правильно:

```text
SausageProductionOrderService -> ClientPort -> SiyomaClientAdapter
```

Неправильно:

```text
SausageProductionOrderService -> SiyomaClientRepository
```

## External References

Если `sausage-production` ссылается на объект Siyoma, хранить ссылку как
external reference.

Примеры:

```text
externalClientId
externalSalesOrderId
hostCompanyId
hostUserId
```

Это позволит перенести данные в отдельный продукт без жестких foreign keys.


# Domain Boundaries

## Главное правило

`sausage-production` не является частью beverage/water-домена Siyoma.

Этот домен описывает производство колбасных изделий и должен развиваться как
отдельный продукт.

## Naming Rules

Разрешенные имена:

- `sausage-production`
- `sausage-workshop`
- `SausageProduction`
- `SausageRawMaterial`
- `SausageProductionOrder`
- `sausage_raw_materials`
- `/api/sausage-production`

Запрещенные имена для нового кода:

- `production` без `sausage`;
- `workshop` без доменного контекста;
- `Product` для готовой продукции цеха, если это путается с товарным каталогом
  Siyoma;
- `Inventory` без адаптера, если речь идет о production stock.

## Allowed Shared Platform Dependencies

Можно использовать платформенный слой host-системы:

- authentication;
- authorization;
- company/user identity;
- audit log;
- configuration;
- database client;
- queue abstraction;
- metrics/logging;
- document generation через adapter;
- notifications через adapter.

## Forbidden Direct Domain Dependencies

Запрещено напрямую импортировать или расширять:

- sales lifecycle;
- delivery lifecycle;
- route planning;
- reps/field activity;
- mobile agent sync;
- mobile expeditor sync;
- beverage/water inventory rules.

Если нужна связь с клиентом, заказом, складом или документом, она должна идти
через отдельный port/interface.

## Data Boundaries

Все таблицы, DTO, types и API должны явно показывать, что они относятся к
колбасному производству.

Таблицы:

- `Sausage*` в Prisma model naming;
- `sausage_*` в SQL naming, если выбран snake_case.

API:

- только `/api/sausage-production/*`.

Frontend:

- отдельное приложение `sausage-workshop`;
- свои routes и layout;
- не вкладка внутри основного Siyoma dashboard.

## Integration Boundary

Любая интеграция с Siyoma должна иметь два слоя:

1. Port в домене `sausage-production`.
2. Adapter в host/integration layer.

Пример:

```text
SausageProductionOrderService
  -> ClientPort
  -> SiyomaClientAdapter
  -> Siyoma clients API/repository
```

Доменный service не должен знать, где физически хранится клиент.


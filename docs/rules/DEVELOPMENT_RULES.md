# Development Rules

## Purpose

Эти правила нужны, чтобы `sausage-production` не слился с Siyoma и остался
готовым к отделению в самостоятельный продукт.

## Rule 1: Domain First

Любая новая сущность должна отвечать на вопрос:

> Это правило колбасного производства или платформенная инфраструктура?

Если это правило колбасного производства, оно живет в `sausage-production`.
Если это инфраструктура, она должна быть использована через port/adapter.

## Rule 2: No Direct Siyoma Business Imports

Запрещено напрямую импортировать бизнес-модули Siyoma.

Нельзя:

```text
import { SalesService } from "src/modules/sales/service"
import { DeliveryService } from "src/modules/delivery/service"
import { InventoryService } from "src/modules/inventory/service"
```

Нужно:

```text
interface SalesDemandPort
interface FinishedGoodsReservationPort
interface DocumentPort
```

## Rule 3: API Namespace Is Fixed

Все backend routes:

```text
/api/sausage-production/*
```

Новые endpoints под `/api/production/*` запрещены.

## Rule 4: Data Must Be Exportable

Каждая core-сущность должна быть переносимой в отдельную БД:

- имеет собственный ID;
- имеет `companyId` или equivalent tenant boundary;
- не зависит от Siyoma foreign keys напрямую, если связь может быть adapter
  reference;
- хранит external references явно: `externalClientId`, `externalOrderId`,
  `hostCompanyId`.

## Rule 5: Tests Must Protect Separation

Тесты должны проверять не только бизнес-логику, но и архитектурные границы:

- нет imports из запрещенных Siyoma modules;
- API namespace начинается с `/api/sausage-production`;
- таблицы/типы имеют `Sausage` или `sausage_` prefix;
- service layer использует ports.

## Rule 6: Documentation Changes Come With Architecture Changes

Если меняется граница домена, добавляется зависимость от Siyoma или появляется
новая интеграция, нужно обновить:

- `docs/architecture/ARCHITECTURE.md`;
- `docs/architecture/SIYOMA_INTEGRATION.md`;
- `docs/rules/BOUNDARIES.md`.

## Rule 7: Keep UI Separate

UI колбасного цеха должен жить в `apps/workshop-dashboard` или
`sausage-workshop`.

Запрещено начинать с вкладки в Siyoma dashboard как основной реализации.

Временные ссылки из Siyoma dashboard допустимы только как launcher/deeplink.


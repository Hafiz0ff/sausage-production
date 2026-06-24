# Terminology

## Product Name

Рабочее название продукта:

```text
Sausage Production
```

Рабочее название frontend-приложения:

```text
Sausage Workshop
```

Русское название:

```text
Колбасный цех
```

## Core Terms

| Term | RU | Meaning |
| --- | --- | --- |
| Raw material | Сырье | Мясо, специи, оболочка, упаковка и другие входные материалы |
| Finished product | Готовая продукция | Колбаса, сосиски, сардельки, полуфабрикаты |
| Recipe | Рецептура | Норма сырья и ожидаемый выход готовой продукции |
| Production order | Производственный заказ | Плановое задание на выпуск продукции |
| Production batch | Партия выпуска | Фактический результат производства по заказу |
| Workshop stock | Остаток в цехе | Сырье, переданное из склада в производство |
| Finished stock | Склад ГП | Остаток готовой продукции |
| Loss | Потеря | Технологическая потеря, брак, списание |
| Yield | Выход | Соотношение фактического выпуска к плановой норме |
| Reservation | Резерв | Часть готовой продукции, закрепленная под клиента/заказ |

## Naming Conventions

Backend domain:

```text
SausageRawMaterial
SausageFinishedProduct
SausageRecipe
SausageProductionOrder
SausageProductionBatch
SausageStockMovement
```

API:

```text
/api/sausage-production
```

Frontend:

```text
sausage-workshop
```

Avoid:

```text
Production
Product
Inventory
Order
```

without a sausage-specific namespace.


# Sausage Production

Отдельный продуктовый домен для управления колбасным производством.

Этот репозиторий создается отдельно от Siyoma, чтобы с первого дня не смешивать
производство колбасных изделий с производством/дистрибуцией воды и напитков.
На стартовом этапе домен может использовать платформенные возможности Siyoma
через интеграционные адаптеры, но должен оставаться готовым к выделению в
самостоятельный backend, frontend и базу данных.

## Цель

Построить операционную систему для колбасного цеха:

- учет сырья на основном складе и в цехе;
- рецептуры;
- производственные заказы;
- передача сырья в производство;
- выпуск партий готовой продукции;
- учет потерь, брака и выхода;
- склад готовой продукции;
- резервы под клиентов;
- аналитика производства.

## Архитектурный принцип

`sausage-production` является отдельным bounded context.

Он может временно использовать Siyoma как host platform, но не должен напрямую
зависеть от доменов Siyoma:

- beverage/water production;
- sales;
- delivery;
- routes;
- reps;
- mobile agent;
- mobile expeditor.

Разрешенные зависимости только через adapters/ports описаны в
[Siyoma Integration](./docs/architecture/SIYOMA_INTEGRATION.md).

## Документация

- [Architecture](./docs/architecture/ARCHITECTURE.md)
- [Boundaries](./docs/rules/BOUNDARIES.md)
- [Development Rules](./docs/rules/DEVELOPMENT_RULES.md)
- [Terminology](./docs/rules/TERMINOLOGY.md)
- [Siyoma Integration](./docs/architecture/SIYOMA_INTEGRATION.md)
- [Roadmap](./docs/plans/ROADMAP.md)

## Local Development

Install dependencies:

```bash
npm install
```

Run the backend API dev server:

```bash
npm run dev:api
```

It serves:

```text
http://127.0.0.1:4014/api/sausage-production/*
```

Run the workshop frontend:

```bash
npm run dev:ui
```

The frontend Vite server proxies `/api/sausage-production/*` to the backend dev
server.

For mock mode, use:

```text
VITE_SAUSAGE_API_MODE=mock
```

For real API mode, use:

```text
VITE_SAUSAGE_API_MODE=real
VITE_SAUSAGE_API_BASE_URL=/api/sausage-production
```

Verify:

```bash
npm test
npm run build
npm run check:architecture
```

## Название домена

Использовать только явное имя:

- `sausage-production`
- `sausage-workshop`
- `SausageProduction`
- `/api/sausage-production`

Не использовать нейтральное `production` без префикса, чтобы не смешивать
домен колбасного цеха с другими производственными доменами.

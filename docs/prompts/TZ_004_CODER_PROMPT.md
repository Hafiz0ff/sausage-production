# Coder Prompt: Execute TZ 004

```text
Работай в репозитории:

/Users/hafizov/sausage-production

Основной документ для выполнения:

/Users/hafizov/sausage-production/docs/tz/TZ_004_SAUSAGE_WORKSHOP_REAL_API_INTEGRATION.md

Перед началом прочитай:

1. /Users/hafizov/sausage-production/docs/tz/TZ_004_SAUSAGE_WORKSHOP_REAL_API_INTEGRATION.md
2. /Users/hafizov/sausage-production/docs/tz/TZ_003_SAUSAGE_PRODUCTION_API_CONTRACT.md
3. /Users/hafizov/sausage-production/docs/tz/TZ_002_SAUSAGE_WORKSHOP_UI.md
4. /Users/hafizov/sausage-production/docs/rules/BOUNDARIES.md
5. /Users/hafizov/sausage-production/docs/rules/DEVELOPMENT_RULES.md
6. /Users/hafizov/sausage-production/docs/architecture/ARCHITECTURE.md
7. /Users/hafizov/sausage-production/docs/architecture/SIYOMA_INTEGRATION.md

Контекст:

- Это отдельный продукт `sausage-production`.
- Его frontend называется `sausage-workshop` и живет в `apps/workshop-dashboard`.
- Backend/domain packages живут в `packages/shared-types`, `packages/api-client`,
  `packages/backend-domain`.
- Siyoma может быть host platform позже, но прямые imports из Siyoma business
  modules запрещены.
- Единственный runtime API namespace: `/api/sausage-production/*`.
- `/api/production/*` запрещен.

Важная проверка перед кодом:

- Убедись, что в рабочей ветке есть и frontend из ТЗ-002, и packages из ТЗ-003.
- Если чего-то нет, не переписывай это заново. Сначала подтяни/смёрджи нужную
  ветку или явно опиши blocker.

Задача:

Подключить `apps/workshop-dashboard` к real API через `packages/api-client`,
сохранив mock mode для локальной разработки.

Что нужно сделать:

1. Добавить локальный backend dev server для `packages/backend-domain`.
2. Добавить demo seed data в backend-domain:
   - сырье;
   - готовая продукция;
   - рецептуры;
   - клиенты;
   - заказы;
   - партии;
   - перемещения;
   - потери;
   - dashboard summary.
3. Сделать read endpoints, которые возвращают real in-memory data:
   - GET `/api/sausage-production/dashboard`
   - GET `/api/sausage-production/raw-materials`
   - GET `/api/sausage-production/finished-products`
   - GET `/api/sausage-production/recipes`
   - GET `/api/sausage-production/clients`
   - GET `/api/sausage-production/orders`
   - GET `/api/sausage-production/batches`
   - GET `/api/sausage-production/stock-movements`
   - GET `/api/sausage-production/losses`
   - GET `/api/sausage-production/analytics/summary`
4. Убедиться, что command endpoints используют service layer:
   - receipt сырья;
   - transfer сырья в цех;
   - создание заказа;
   - start order;
   - release batch;
   - write-off stock.
5. В `apps/workshop-dashboard` заменить прямое использование mock data на adapter:
   - `VITE_SAUSAGE_API_MODE=mock` использует mock adapter;
   - `VITE_SAUSAGE_API_MODE=real` использует `SausageApiClient`.
6. Добавить loading/error/retry states во frontend.
7. Настроить Vite proxy:
   - `/api/sausage-production/*` -> backend dev server.
8. Обновить README с командами запуска:
   - mock mode;
   - real API mode;
   - backend dev server.
9. Добавить tests:
   - backend endpoint tests;
   - api-client tests;
   - frontend adapter/loading/error tests;
   - architecture boundary tests.

Запреты:

- Не использовать `/api/production/*` в runtime коде.
- Не импортировать Siyoma sales/delivery/inventory/routes/reps modules.
- Не импортировать mock data напрямую из screen components.
- Не удалять mock mode.
- Не создавать Prisma/PostgreSQL persistence в этом ТЗ.
- Не встраивать workshop dashboard как вкладку Siyoma.

Обязательные проверки перед завершением:

1. Удали `dist` директории и проверь clean build:

   rm -rf packages/*/dist apps/workshop-dashboard/dist
   npm test
   npm run build

2. Запусти backend dev server.
3. Запусти frontend в real API mode.
4. Проверь в браузере:
   - dashboard загружается из backend;
   - sidebar работает;
   - release modal validation работает;
   - при выключенном backend показывается error state с retry;
   - нет визуального наложения на desktop и 768px.

В конце дай отчет:

- какие файлы изменены;
- какие endpoints подключены;
- как запустить mock mode;
- как запустить real API mode;
- какие проверки прошли;
- какие ограничения остались.
```

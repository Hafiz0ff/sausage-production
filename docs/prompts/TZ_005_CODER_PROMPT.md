# Coder Prompt: Execute TZ 005

```text
Работай только в main.

Репозиторий:

/Users/hafizov/sausage-production

Основной документ:

/Users/hafizov/sausage-production/docs/tz/TZ_005_SAUSAGE_PRODUCTION_PERSISTENCE.md

Перед началом прочитай:

1. /Users/hafizov/sausage-production/docs/tz/TZ_005_SAUSAGE_PRODUCTION_PERSISTENCE.md
2. /Users/hafizov/sausage-production/docs/tz/TZ_004_SAUSAGE_WORKSHOP_REAL_API_INTEGRATION.md
3. /Users/hafizov/sausage-production/docs/tz/TZ_003_SAUSAGE_PRODUCTION_API_CONTRACT.md
4. /Users/hafizov/sausage-production/docs/rules/BOUNDARIES.md
5. /Users/hafizov/sausage-production/docs/rules/DEVELOPMENT_RULES.md
6. /Users/hafizov/sausage-production/docs/architecture/ARCHITECTURE.md

Контекст:

- `sausage-production` уже имеет frontend, typed API client и backend-domain.
- Backend сейчас работает через `InMemoryRepositories`.
- Нужно добавить persistence слой, не ломая API и frontend.
- Единственный API namespace: `/api/sausage-production/*`.
- `/api/production/*` запрещен.
- Прямые imports из Siyoma business modules запрещены.

Задача:

Реализовать persistence для backend-domain, предпочтительно PostgreSQL + Prisma,
через repository interfaces.

Что сделать:

1. Ввести repository contract:
   - raw materials;
   - finished products;
   - recipes;
   - clients;
   - production orders;
   - batches;
   - stock movements;
   - losses.
2. Адаптировать `InMemoryRepositories`, чтобы он реализовывал тот же contract.
3. Добавить persistent implementation:
   - `PrismaSausageRepositories` или эквивалент;
   - migrations;
   - seed command;
   - `.env.example`.
4. Перевести service layer на repository interfaces:
   - services не должны обращаться к массивам напрямую;
   - services не должны импортировать Prisma client напрямую.
5. Добавить storage mode:
   - `SAUSAGE_STORAGE_MODE=memory`;
   - `SAUSAGE_STORAGE_MODE=postgres`;
   - default может быть `memory`.
6. Сохранить текущие API endpoints без изменения путей.
7. Сохранить frontend real API mode без изменения API paths.
8. Сделать stock-changing операции transactional в persistent mode:
   - receipt;
   - transfer to workshop;
   - release batch;
   - write-off.
9. Расширить `scripts/check-architecture.sh`:
   - no `/api/production` runtime usage;
   - no direct Siyoma business imports;
   - no Prisma model names без `Sausage`;
   - no SQL table names без `sausage_`.
10. Обновить README/backend docs:
   - memory mode;
   - postgres mode;
   - migrate;
   - seed;
   - dev server.

Запреты:

- Не создавать таблицы без `sausage_` prefix.
- Не создавать Prisma models без `Sausage` prefix.
- Не импортировать Siyoma sales/delivery/inventory/routes/reps modules.
- Не использовать `/api/production/*`.
- Не ломать `npm run dev:api`.
- Не удалять in-memory режим.
- Не менять frontend UX в этом ТЗ.

Обязательные тесты:

- current service tests still pass;
- repository contract tests for memory mode;
- persistence tests for postgres mode, если `DATABASE_URL` доступен;
- endpoint tests still pass;
- tenant isolation;
- raw receipt persists;
- raw transfer persists;
- release batch persists batch/movements/finished stock;
- write-off persists movement/loss;
- negative stock rejected;
- movement journal records stock-changing operations.

Обязательные проверки перед завершением:

rm -rf packages/*/dist apps/workshop-dashboard/dist
npm test
npm run build
npm run check:architecture

Если PostgreSQL доступен:

npm run prisma:generate -w sausage-backend-domain
npm run db:migrate -w sausage-backend-domain
npm run db:seed -w sausage-backend-domain
SAUSAGE_STORAGE_MODE=postgres npm run dev:api

Если PostgreSQL недоступен, явно напиши это в отчете и покажи, что memory mode
полностью проверен.

В конце дай отчет:

- какие repository interfaces созданы;
- какая persistence реализация добавлена;
- какие migrations/seed добавлены;
- какие команды запуска;
- какие проверки прошли;
- что не было проверено из-за внешней среды.

Важно:

Коммить и пушь только в `main`. Не создавай новые ветки.
```

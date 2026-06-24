# TZ 001: Documentation And Boundaries

## Objective

Создать базовую документацию для `sausage-production`, чтобы до разработки
зафиксировать отдельность домена колбасного цеха от Siyoma.

## Scope

- README репозитория.
- Архитектурный документ.
- Правила доменных границ.
- Правила разработки.
- Терминология.
- Интеграция с Siyoma через ports/adapters.
- Roadmap по этапам.

## Non-Goals

- Не создавать приложение.
- Не писать backend.
- Не переносить код из Siyoma.
- Не копировать Prisma schema из Siyoma.
- Не создавать production tables.

## Key Decisions

- Домен называется `sausage-production`.
- Frontend называется `sausage-workshop`.
- API namespace: `/api/sausage-production`.
- Таблицы и модели должны иметь `Sausage` или `sausage_` prefix.
- Связь с Siyoma только через adapters/ports.
- Домен должен быть готов к standalone extraction.

## Acceptance Criteria

- В документации явно запрещено смешивать sausage domain с Siyoma beverage/water
  domain.
- Есть правила naming и API namespace.
- Есть staged roadmap.
- Есть описание hosted/sidecar/standalone режимов.
- Есть список разрешенных и запрещенных зависимостей.


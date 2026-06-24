# Sausage Workshop

Standalone frontend workspace for the `sausage-production` domain.

This app is intentionally separate from the Siyoma dashboard. It uses the future API namespace:

```text
/api/sausage-production/*
```

Do not integrate this UI as a Siyoma dashboard tab and do not use `/api/production/*`.

## Run

```bash
npm install
npm run dev -- --port 5174
```

## Verify

```bash
npm test -- --run
npm run typecheck
npm run build
```

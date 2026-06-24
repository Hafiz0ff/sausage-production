# Sausage Workshop

Standalone frontend workspace for the `sausage-production` domain.

This app is intentionally separate from the Siyoma dashboard. It uses the future API namespace:

```text
/api/sausage-production/*
```

Do not integrate this UI as a Siyoma dashboard tab and do not use `/api/production/*`.

## Run

Mock mode:

```bash
npm install
npm run dev:ui
```

Real API mode:

```bash
npm install
npm run dev:api
VITE_SAUSAGE_API_MODE=real VITE_SAUSAGE_API_BASE_URL=/api/sausage-production npm run dev:ui
```

Backend dev server:

```text
http://127.0.0.1:4014/api/sausage-production/*
```

Vite proxies `/api/sausage-production/*` to the backend dev server.

## Verify

```bash
npm test
npm run build
npm run check:architecture
```

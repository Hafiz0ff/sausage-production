# Sausage Workshop UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the standalone `sausage-workshop` frontend from TZ-002 as a desktop-first operational dashboard backed by mock data and a typed API abstraction.

**Architecture:** Create a separate Vite + React + TypeScript app under `apps/workshop-dashboard`. Keep UI components, typed DTOs, mock data, and API abstraction inside the app so it can later switch from mock API to `/api/sausage-production/*` without rewriting screens. Do not import Siyoma frontend/backend code and do not call `/api/production/*`.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Testing Library, jsdom, lucide-react, CSS modules or plain CSS with CSS variables.

---

## File Structure

Create:

```text
apps/workshop-dashboard/
  README.md
  index.html
  package.json
  tsconfig.json
  vite.config.ts
  src/
    App.tsx
    App.test.tsx
    main.tsx
    styles.css
    api/
      sausageProductionApi.ts
      sausageProductionApi.test.ts
    components/
      AppShell.tsx
      DataTable.tsx
      MetricCard.tsx
      Modal.tsx
      ProgressBar.tsx
      StatusTag.tsx
    data/
      mockSausageProductionData.ts
    domain/
      types.ts
    screens/
      AnalyticsScreen.tsx
      BatchesScreen.tsx
      ClientsScreen.tsx
      DashboardScreen.tsx
      FinishedProductsScreen.tsx
      LossesScreen.tsx
      OrdersScreen.tsx
      RawMaterialsScreen.tsx
      RecipesScreen.tsx
      TransfersScreen.tsx
    state/
      navigation.ts
    test/
      setup.ts
```

Responsibilities:

- `domain/types.ts`: DTOs, role names, status unions, navigation keys.
- `data/mockSausageProductionData.ts`: all seed/mock records; no mock data inside screens.
- `api/sausageProductionApi.ts`: client abstraction used by all screens.
- `components/*`: reusable operational UI primitives.
- `screens/*`: one screen per sidebar section.
- `AppShell.tsx`: sidebar, topbar, content frame.
- `App.tsx`: app state and screen routing.
- `styles.css`: visual system from the HTML reference.

## Visual Thesis

Dense dark control-room UI for a working sausage factory: tables, compact KPIs, sharp borders, mono numbers, restrained red-orange action accent, and fast operational scanning.

## Content Plan

First viewport starts with the dashboard: production KPIs, quick actions, active orders, critical stock, hourly output, event feed, losses, and finished goods snapshot. Other screens are table-first workspaces for orders, batches, transfers, raw materials, finished products, recipes, clients, losses, and analytics.

## Interaction Thesis

Use restrained motion: sidebar active-state transitions, table row hover affordance, modal enter/exit, and progress bar fill transitions. Avoid decorative animation that competes with operations.

---

### Task 1: Scaffold The Standalone Vite App

**Files:**
- Create: `apps/workshop-dashboard/package.json`
- Create: `apps/workshop-dashboard/index.html`
- Create: `apps/workshop-dashboard/tsconfig.json`
- Create: `apps/workshop-dashboard/vite.config.ts`
- Create: `apps/workshop-dashboard/src/test/setup.ts`
- Create: `apps/workshop-dashboard/src/main.tsx`
- Create: `apps/workshop-dashboard/src/App.tsx`
- Create: `apps/workshop-dashboard/src/App.test.tsx`
- Create: `apps/workshop-dashboard/src/styles.css`
- Create: `apps/workshop-dashboard/README.md`

- [ ] **Step 1: Create the failing smoke test**

Create `apps/workshop-dashboard/src/App.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('Sausage Workshop app shell', () => {
  it('renders the sausage workshop product name', () => {
    render(<App />);

    expect(screen.getByText('Колбасный цех')).toBeInTheDocument();
    expect(screen.getByText('Sausage Workshop')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```bash
cd apps/workshop-dashboard
npm test -- --run src/App.test.tsx
```

Expected: FAIL because package/app files do not exist yet or `App` does not render the expected product name.

- [ ] **Step 3: Create package and Vite config**

Create `apps/workshop-dashboard/package.json`:

```json
{
  "name": "sausage-workshop",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc && vite build",
    "preview": "vite preview --host 127.0.0.1",
    "test": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^5.0.0",
    "vite": "^7.0.0",
    "typescript": "^6.0.0",
    "react": "19.1.4",
    "react-dom": "19.1.4",
    "lucide-react": "^0.468.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "jsdom": "^26.0.0",
    "vitest": "^2.1.8"
  }
}
```

Create `apps/workshop-dashboard/vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
  },
});
```

Create `apps/workshop-dashboard/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "references": []
}
```

Create `apps/workshop-dashboard/src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4: Create the minimal React app**

Create `apps/workshop-dashboard/index.html`:

```html
<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sausage Workshop</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `apps/workshop-dashboard/src/main.tsx`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

Create `apps/workshop-dashboard/src/App.tsx`:

```tsx
export default function App() {
  return (
    <main className="app-shell">
      <h1>Колбасный цех</h1>
      <p>Sausage Workshop</p>
    </main>
  );
}
```

Create `apps/workshop-dashboard/src/styles.css`:

```css
:root {
  color-scheme: dark;
  --bg-primary: #0a0a0b;
  --bg-secondary: #111113;
  --bg-panel: #161618;
  --border: #2a2a2e;
  --text-primary: #f0f0f5;
  --text-secondary: #8a8a95;
  --accent: #e85d3e;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.app-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
}
```

Create `apps/workshop-dashboard/README.md`:

```md
# Sausage Workshop

Standalone frontend for the `sausage-production` domain.

## Commands

```bash
npm install
npm run dev
npm test -- --run
npm run typecheck
npm run build
```

The app must only use the `/api/sausage-production/*` namespace when real API integration is added.
```

- [ ] **Step 5: Install dependencies and verify green**

Run:

```bash
cd apps/workshop-dashboard
npm install
npm test -- --run src/App.test.tsx
npm run typecheck
npm run build
```

Expected: all commands pass.

- [ ] **Step 6: Commit**

```bash
git add apps/workshop-dashboard
git commit -m "feat: scaffold sausage workshop frontend"
```

---

### Task 2: Add Domain Types And Mock API Contract

**Files:**
- Create: `apps/workshop-dashboard/src/domain/types.ts`
- Create: `apps/workshop-dashboard/src/data/mockSausageProductionData.ts`
- Create: `apps/workshop-dashboard/src/api/sausageProductionApi.ts`
- Create: `apps/workshop-dashboard/src/api/sausageProductionApi.test.ts`

- [ ] **Step 1: Write the failing API contract test**

Create `apps/workshop-dashboard/src/api/sausageProductionApi.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { sausageProductionApi } from './sausageProductionApi';

describe('sausageProductionApi', () => {
  it('returns dashboard data through the sausage namespace abstraction', async () => {
    const summary = await sausageProductionApi.getDashboardSummary();

    expect(summary.metrics.rawWarehouseKg).toBeGreaterThan(0);
    expect(summary.activeOrders.length).toBeGreaterThan(0);
    expect(summary.criticalRawStock[0]).toHaveProperty('warehouseQuantity');
    expect(sausageProductionApi.basePath).toBe('/api/sausage-production');
  });

  it('does not expose the generic production namespace', () => {
    expect(sausageProductionApi.basePath).not.toBe('/api/production');
  });
});
```

- [ ] **Step 2: Run test to verify red**

Run:

```bash
cd apps/workshop-dashboard
npm test -- --run src/api/sausageProductionApi.test.ts
```

Expected: FAIL because `sausageProductionApi` does not exist.

- [ ] **Step 3: Define the core domain types**

Create `apps/workshop-dashboard/src/domain/types.ts`:

```ts
export type ScreenKey =
  | 'dashboard'
  | 'orders'
  | 'batches'
  | 'transfers'
  | 'rawMaterials'
  | 'finishedProducts'
  | 'recipes'
  | 'clients'
  | 'stock'
  | 'losses'
  | 'analytics';

export type SausageOrderStatus =
  | 'planned'
  | 'waiting_raw'
  | 'in_progress'
  | 'released'
  | 'accepted'
  | 'shipped'
  | 'cancelled';

export type SausageBatchStatus =
  | 'draft'
  | 'released'
  | 'quality_check'
  | 'accepted'
  | 'rejected'
  | 'adjusted';

export type StockStatus = 'ok' | 'low' | 'critical' | 'order';

export interface MetricSummary {
  rawWarehouseKg: number;
  rawWorkshopKg: number;
  finishedGoodsKg: number;
  lossPercentToday: number;
  producedTodayKg: number;
  activeOrdersCount: number;
}

export interface ProductionOrder {
  id: string;
  number: string;
  date: string;
  clientName: string;
  productName: string;
  quantity: number;
  unit: string;
  status: SausageOrderStatus;
  progressPercent: number;
  plannedDate: string;
  responsibleName: string;
}

export interface RawStockItem {
  id: string;
  name: string;
  group: string;
  warehouseQuantity: number;
  workshopQuantity: number;
  reservedQuantity: number;
  minimumQuantity: number;
  unit: string;
  status: StockStatus;
}

export interface FinishedProductStockItem {
  id: string;
  name: string;
  sku: string;
  batchNumber: string;
  quantity: number;
  reservedQuantity: number;
  freeQuantity: number;
  expirationDate: string;
  status: 'available' | 'reserved' | 'expiring' | 'blocked' | 'written_off' | 'quality_check';
}

export interface ProductionBatch {
  id: string;
  number: string;
  producedAt: string;
  orderNumber: string;
  productName: string;
  plannedQuantity: number;
  actualQuantity: number;
  acceptedQuantity: number;
  defectQuantity: number;
  lossQuantity: number;
  yieldPercent: number;
  masterName: string;
  status: SausageBatchStatus;
}

export interface StockMovement {
  id: string;
  documentNumber: string;
  time: string;
  type: 'receipt' | 'warehouse_to_workshop' | 'workshop_to_warehouse' | 'write_off' | 'adjustment' | 'return';
  from: string;
  to: string;
  orderNumber?: string;
  materialName: string;
  quantity: number;
  unit: string;
  keeperName: string;
  status: 'posted' | 'draft' | 'cancelled';
}

export interface Recipe {
  id: string;
  productName: string;
  sku: string;
  status: 'active' | 'inactive';
  baseOutputQuantity: number;
  unit: string;
  expectedYieldPercent: number;
  items: Array<{
    materialName: string;
    quantity: number;
    unit: string;
    group: string;
  }>;
}

export interface ClientDemand {
  id: string;
  clientName: string;
  activeOrdersCount: number;
  reservedFinishedKg: number;
  expectedDate: string;
  status: 'planned' | 'reserved' | 'ready' | 'late';
}

export interface LossRecord {
  id: string;
  period: string;
  batchNumber: string;
  orderNumber: string;
  stage: string;
  quantity: number;
  unit: string;
  reason: string;
  masterName: string;
  recordedAt: string;
}

export interface HourlyOutput {
  hour: string;
  quantity: number;
}

export interface EventItem {
  id: string;
  type: 'success' | 'accent' | 'warning' | 'danger' | 'info';
  text: string;
  meta: string;
}

export interface DashboardSummary {
  metrics: MetricSummary;
  activeOrders: ProductionOrder[];
  criticalRawStock: RawStockItem[];
  hourlyOutput: HourlyOutput[];
  recentEvents: EventItem[];
  todayLosses: LossRecord[];
  finishedGoods: FinishedProductStockItem[];
}
```

- [ ] **Step 4: Add mock data and API abstraction**

Create `apps/workshop-dashboard/src/data/mockSausageProductionData.ts` with representative records for every type. Include at least:

```ts
import type {
  ClientDemand,
  DashboardSummary,
  FinishedProductStockItem,
  LossRecord,
  ProductionBatch,
  ProductionOrder,
  RawStockItem,
  Recipe,
  StockMovement,
} from '../domain/types';

export const rawStockItems: RawStockItem[] = [
  { id: 'raw-1', name: 'Свинина (охл.)', group: 'Мясо', warehouseQuantity: 420, workshopQuantity: 85, reservedQuantity: 150, minimumQuantity: 300, unit: 'кг', status: 'ok' },
  { id: 'raw-2', name: 'Говядина (охл.)', group: 'Мясо', warehouseQuantity: 180, workshopQuantity: 45, reservedQuantity: 200, minimumQuantity: 200, unit: 'кг', status: 'low' },
  { id: 'raw-3', name: 'Специи (смесь)', group: 'Специи', warehouseQuantity: 12, workshopQuantity: 3, reservedQuantity: 10, minimumQuantity: 15, unit: 'кг', status: 'critical' },
];

export const productionOrders: ProductionOrder[] = [
  { id: 'order-142', number: 'ПЗ-2026-0142', date: '2026-06-24', clientName: 'Внутренний', productName: 'Колбаса "Докторская"', quantity: 150, unit: 'кг', status: 'in_progress', progressPercent: 65, plannedDate: '2026-06-24', responsibleName: 'Иванов С.П.' },
  { id: 'order-141', number: 'ПЗ-2026-0141', date: '2026-06-23', clientName: 'ООО "Гастроном"', productName: 'Сосиски "Молочные"', quantity: 80, unit: 'кг', status: 'released', progressPercent: 100, plannedDate: '2026-06-23', responsibleName: 'Сидоров А.Н.' },
  { id: 'order-140', number: 'ПЗ-2026-0140', date: '2026-06-24', clientName: 'Сеть "Мясной двор"', productName: 'Колбаса "Любительская"', quantity: 200, unit: 'кг', status: 'waiting_raw', progressPercent: 15, plannedDate: '2026-06-25', responsibleName: 'Петров К.М.' },
];

export const finishedProducts: FinishedProductStockItem[] = [
  { id: 'fg-1', name: 'Колбаса "Докторская" ГОСТ', sku: 'КБ-001', batchNumber: 'БВ-2026-0087', quantity: 320, reservedQuantity: 45, freeQuantity: 275, expirationDate: '2026-06-30', status: 'available' },
  { id: 'fg-2', name: 'Сосиски "Молочные"', sku: 'СС-001', batchNumber: 'БВ-2026-0088', quantity: 95, reservedQuantity: 15, freeQuantity: 80, expirationDate: '2026-06-25', status: 'expiring' },
];

export const productionBatches: ProductionBatch[] = [
  { id: 'batch-87', number: 'БВ-2026-0087', producedAt: '2026-06-24 14:32', orderNumber: 'ПЗ-2026-0141', productName: 'Сосиски "Молочные"', plannedQuantity: 80, actualQuantity: 80, acceptedQuantity: 80, defectQuantity: 0, lossQuantity: 0, yieldPercent: 100, masterName: 'Иванов С.П.', status: 'accepted' },
  { id: 'batch-86', number: 'БВ-2026-0086', producedAt: '2026-06-24 11:15', orderNumber: 'ПЗ-2026-0139', productName: 'Котлеты "Домашние"', plannedQuantity: 120, actualQuantity: 118.2, acceptedQuantity: 118.2, defectQuantity: 0, lossQuantity: 1.8, yieldPercent: 98.5, masterName: 'Петров К.М.', status: 'accepted' },
];

export const stockMovements: StockMovement[] = [
  { id: 'move-312', documentNumber: 'ПМ-2026-0312', time: '13:15', type: 'warehouse_to_workshop', from: 'Основной', to: 'Цех №1', orderNumber: 'ПЗ-0142', materialName: 'Свинина (охл.)', quantity: 65, unit: 'кг', keeperName: 'Козлов В.Н.', status: 'posted' },
  { id: 'move-309', documentNumber: 'ПМ-2026-0309', time: '09:30', type: 'receipt', from: 'Поставщик', to: 'Основной', materialName: 'Говядина (охл.)', quantity: 500, unit: 'кг', keeperName: 'Козлов В.Н.', status: 'posted' },
];

export const recipes: Recipe[] = [
  {
    id: 'recipe-1',
    productName: 'Колбаса "Докторская" ГОСТ',
    sku: 'КБ-001',
    status: 'active',
    baseOutputQuantity: 100,
    unit: 'кг',
    expectedYieldPercent: 96.5,
    items: [
      { materialName: 'Свинина (охл.)', quantity: 65, unit: 'кг', group: 'Мясо' },
      { materialName: 'Говядина (охл.)', quantity: 35, unit: 'кг', group: 'Мясо' },
      { materialName: 'Специи (смесь)', quantity: 2.5, unit: 'кг', group: 'Специи' },
    ],
  },
];

export const clientDemands: ClientDemand[] = [
  { id: 'client-1', clientName: 'ООО "Гастроном"', activeOrdersCount: 2, reservedFinishedKg: 45, expectedDate: '2026-06-25', status: 'reserved' },
  { id: 'client-2', clientName: 'Сеть "Мясной двор"', activeOrdersCount: 1, reservedFinishedKg: 0, expectedDate: '2026-06-26', status: 'planned' },
];

export const losses: LossRecord[] = [
  { id: 'loss-1', period: '2026-06-24', batchNumber: 'БВ-2026-0086', orderNumber: 'ПЗ-0140', stage: 'Обвалка', quantity: 8.5, unit: 'кг', reason: 'Стандартные отходы', masterName: 'Иванов С.П.', recordedAt: '2026-06-24 09:20' },
  { id: 'loss-2', period: '2026-06-24', batchNumber: 'БВ-2026-0087', orderNumber: 'ПЗ-0142', stage: 'Фарш', quantity: 2.1, unit: 'кг', reason: 'Прилипание к оборудованию', masterName: 'Петров К.М.', recordedAt: '2026-06-24 12:10' },
];

export const dashboardSummary: DashboardSummary = {
  metrics: {
    rawWarehouseKg: 1247,
    rawWorkshopKg: 384,
    finishedGoodsKg: 892,
    lossPercentToday: 3.2,
    producedTodayKg: 156,
    activeOrdersCount: 3,
  },
  activeOrders: productionOrders,
  criticalRawStock: rawStockItems,
  hourlyOutput: [
    { hour: '06:00', quantity: 12 },
    { hour: '07:00', quantity: 28 },
    { hour: '08:00', quantity: 52 },
    { hour: '09:00', quantity: 68 },
    { hour: '10:00', quantity: 92 },
    { hour: '11:00', quantity: 120 },
  ],
  recentEvents: [
    { id: 'event-1', type: 'success', text: 'Выпущена партия ПЗ-2026-0141 — Сосиски "Молочные" 80 кг', meta: '14:32 — Оператор: Сидоров А.' },
    { id: 'event-2', type: 'accent', text: 'Передано в цех: 120 кг свинины (ПЗ-2026-0142)', meta: '13:15 — Кладовщик: Козлов В.' },
    { id: 'event-3', type: 'warning', text: 'Критический остаток: Специи (смесь) — 12 кг на складе', meta: '12:08 — Система' },
  ],
  todayLosses: losses,
  finishedGoods: finishedProducts,
};
```

Create `apps/workshop-dashboard/src/api/sausageProductionApi.ts`:

```ts
import {
  clientDemands,
  dashboardSummary,
  finishedProducts,
  losses,
  productionBatches,
  productionOrders,
  rawStockItems,
  recipes,
  stockMovements,
} from '../data/mockSausageProductionData';

export const sausageProductionApi = {
  basePath: '/api/sausage-production',
  async getDashboardSummary() {
    return dashboardSummary;
  },
  async listOrders() {
    return productionOrders;
  },
  async listBatches() {
    return productionBatches;
  },
  async listTransfers() {
    return stockMovements;
  },
  async listRawMaterials() {
    return rawStockItems;
  },
  async listFinishedProducts() {
    return finishedProducts;
  },
  async listRecipes() {
    return recipes;
  },
  async listClients() {
    return clientDemands;
  },
  async listLosses() {
    return losses;
  },
};
```

- [ ] **Step 5: Run tests**

Run:

```bash
cd apps/workshop-dashboard
npm test -- --run src/api/sausageProductionApi.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/workshop-dashboard/src/domain apps/workshop-dashboard/src/data apps/workshop-dashboard/src/api
git commit -m "feat: add sausage production mock api"
```

---

### Task 3: Build App Shell, Sidebar, Topbar, And Navigation

**Files:**
- Create: `apps/workshop-dashboard/src/state/navigation.ts`
- Create: `apps/workshop-dashboard/src/components/AppShell.tsx`
- Modify: `apps/workshop-dashboard/src/App.tsx`
- Modify: `apps/workshop-dashboard/src/App.test.tsx`
- Modify: `apps/workshop-dashboard/src/styles.css`

- [ ] **Step 1: Write the failing navigation test**

Update `apps/workshop-dashboard/src/App.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('Sausage Workshop app shell', () => {
  it('renders sidebar navigation and changes the current section', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText('Колбасный цех')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Дашборд/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Заказы на производство/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Партии выпуска/i }));

    expect(screen.getByText('// Партии выпуска')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify red**

Run:

```bash
cd apps/workshop-dashboard
npm test -- --run src/App.test.tsx
```

Expected: FAIL because navigation shell does not exist.

- [ ] **Step 3: Add navigation config**

Create `apps/workshop-dashboard/src/state/navigation.ts`:

```ts
import type { ScreenKey } from '../domain/types';

export interface NavigationItem {
  key: ScreenKey;
  label: string;
  section: 'Основное' | 'Справочники' | 'Отчеты';
  badge?: string;
}

export const navigationItems: NavigationItem[] = [
  { key: 'dashboard', label: 'Дашборд', section: 'Основное' },
  { key: 'orders', label: 'Заказы на производство', section: 'Основное', badge: '3' },
  { key: 'batches', label: 'Партии выпуска', section: 'Основное' },
  { key: 'transfers', label: 'Перемещения', section: 'Основное' },
  { key: 'rawMaterials', label: 'Сырье', section: 'Справочники' },
  { key: 'finishedProducts', label: 'Готовая продукция', section: 'Справочники' },
  { key: 'recipes', label: 'Рецептуры', section: 'Справочники' },
  { key: 'clients', label: 'Клиенты', section: 'Справочники' },
  { key: 'stock', label: 'Остатки', section: 'Отчеты' },
  { key: 'losses', label: 'Потери', section: 'Отчеты' },
  { key: 'analytics', label: 'Аналитика', section: 'Отчеты' },
];

export const screenTitles: Record<ScreenKey, string> = {
  dashboard: 'Дашборд производства',
  orders: 'Заказы на производство',
  batches: 'Партии выпуска',
  transfers: 'Перемещения',
  rawMaterials: 'Сырье на складе',
  finishedProducts: 'Готовая продукция',
  recipes: 'Справочник рецептур',
  clients: 'Клиенты',
  stock: 'Остатки на складах',
  losses: 'Отчет по потерям',
  analytics: 'Аналитика',
};
```

- [ ] **Step 4: Add AppShell component**

Create `apps/workshop-dashboard/src/components/AppShell.tsx`:

```tsx
import type { ReactNode } from 'react';
import type { ScreenKey } from '../domain/types';
import { navigationItems, screenTitles } from '../state/navigation';

interface AppShellProps {
  activeScreen: ScreenKey;
  onNavigate: (screen: ScreenKey) => void;
  children: ReactNode;
}

export function AppShell({ activeScreen, onNavigate, children }: AppShellProps) {
  const sections = ['Основное', 'Справочники', 'Отчеты'] as const;

  return (
    <div className="workshop-app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-mark">К</div>
          <div>
            <div className="logo-title">Колбасный цех</div>
            <div className="logo-subtitle">Sausage Workshop</div>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Sausage workshop navigation">
          {sections.map((section) => (
            <div className="nav-group" key={section}>
              <div className="nav-group-label">{section}</div>
              {navigationItems
                .filter((item) => item.section === section)
                .map((item) => (
                  <button
                    type="button"
                    key={item.key}
                    className={`nav-item ${activeScreen === item.key ? 'active' : ''}`}
                    onClick={() => onNavigate(item.key)}
                  >
                    <span>{item.label}</span>
                    {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
                  </button>
                ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-avatar">ИП</div>
          <div>
            <div className="user-name">Иван Петров</div>
            <div className="user-role">Менеджер цеха</div>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="page-title">// {screenTitles[activeScreen]}</div>
          <div className="topbar-actions">
            <span className="topbar-date">24.06.2026</span>
            <button type="button" className="btn secondary">Уведомления</button>
            <button type="button" className="btn primary">Новый заказ</button>
          </div>
        </header>
        <div className="content">{children}</div>
      </main>
    </div>
  );
}
```

- [ ] **Step 5: Wire App state and shell**

Update `apps/workshop-dashboard/src/App.tsx`:

```tsx
import { useState } from 'react';
import { AppShell } from './components/AppShell';
import type { ScreenKey } from './domain/types';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenKey>('dashboard');

  return (
    <AppShell activeScreen={activeScreen} onNavigate={setActiveScreen}>
      <section className="screen-placeholder">
        <h1>{activeScreen}</h1>
      </section>
    </AppShell>
  );
}
```

Update `apps/workshop-dashboard/src/styles.css` with the shell visual system:

```css
.workshop-app {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-primary);
}

.sidebar {
  width: 240px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header,
.sidebar-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  border-bottom: 1px solid var(--border);
}

.sidebar-footer {
  border-top: 1px solid var(--border);
  border-bottom: 0;
}

.logo-mark,
.user-avatar {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  background: var(--accent);
  color: white;
  font-weight: 800;
}

.logo-title,
.user-name {
  font-size: 14px;
  font-weight: 700;
}

.logo-subtitle,
.user-role,
.topbar-date {
  font-size: 11px;
  color: var(--text-secondary);
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 16px 8px;
}

.nav-group {
  margin-bottom: 18px;
}

.nav-group-label {
  padding: 0 12px 8px;
  font-size: 10px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.nav-item {
  width: 100%;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-secondary);
  padding: 10px 12px;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
  text-align: left;
}

.nav-item:hover,
.nav-item.active {
  color: var(--text-primary);
  background: var(--bg-panel);
  border-color: var(--border);
}

.nav-item.active {
  color: var(--accent);
  border-left: 2px solid var(--accent);
}

.nav-badge {
  background: var(--accent);
  color: #fff;
  padding: 2px 6px;
  font-size: 10px;
}

.main {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.topbar {
  height: 56px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;
}

.page-title {
  font-size: 16px;
  font-weight: 800;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn {
  border: 1px solid var(--border);
  background: var(--bg-panel);
  color: var(--text-primary);
  padding: 8px 14px;
  cursor: pointer;
}

.btn.primary {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.screen-placeholder {
  border: 1px solid var(--border);
  padding: 24px;
  background: var(--bg-panel);
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
}
```

- [ ] **Step 6: Run tests**

Run:

```bash
cd apps/workshop-dashboard
npm test -- --run src/App.test.tsx
npm run typecheck
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/workshop-dashboard/src
git commit -m "feat: add sausage workshop shell"
```

---

### Task 4: Build Reusable Operational UI Components

**Files:**
- Create: `apps/workshop-dashboard/src/components/MetricCard.tsx`
- Create: `apps/workshop-dashboard/src/components/DataTable.tsx`
- Create: `apps/workshop-dashboard/src/components/ProgressBar.tsx`
- Create: `apps/workshop-dashboard/src/components/StatusTag.tsx`
- Modify: `apps/workshop-dashboard/src/styles.css`

- [ ] **Step 1: Write a failing component test**

Create `apps/workshop-dashboard/src/components/MetricCard.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MetricCard } from './MetricCard';

describe('MetricCard', () => {
  it('renders a metric label, value, unit, and trend', () => {
    render(<MetricCard label="Сырье на складе" value="1,247" unit="кг" trend="+86 кг сегодня" tone="accent" />);

    expect(screen.getByText('Сырье на складе')).toBeInTheDocument();
    expect(screen.getByText('1,247')).toBeInTheDocument();
    expect(screen.getByText('кг')).toBeInTheDocument();
    expect(screen.getByText('+86 кг сегодня')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify red**

Run:

```bash
cd apps/workshop-dashboard
npm test -- --run src/components/MetricCard.test.tsx
```

Expected: FAIL because `MetricCard` does not exist.

- [ ] **Step 3: Implement components**

Create `MetricCard`, `ProgressBar`, `StatusTag`, and `DataTable` with typed props. Keep them presentation-only.

Minimum `MetricCard`:

```tsx
interface MetricCardProps {
  label: string;
  value: string;
  unit?: string;
  trend?: string;
  tone?: 'accent' | 'success' | 'warning' | 'danger' | 'info';
}

export function MetricCard({ label, value, unit, trend, tone = 'accent' }: MetricCardProps) {
  return (
    <article className={`metric-card tone-${tone}`}>
      <div className="metric-label">{label}</div>
      <div className="metric-value">
        {value}
        {unit ? <span>{unit}</span> : null}
      </div>
      {trend ? <div className="metric-trend">{trend}</div> : null}
    </article>
  );
}
```

Minimum `ProgressBar`:

```tsx
interface ProgressBarProps {
  value: number;
  tone?: 'accent' | 'success' | 'warning' | 'danger';
}

export function ProgressBar({ value, tone = 'accent' }: ProgressBarProps) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className="progress-bar" aria-label={`Прогресс ${safeValue}%`}>
      <div className={`progress-bar-fill tone-${tone}`} style={{ width: `${safeValue}%` }} />
    </div>
  );
}
```

- [ ] **Step 4: Add component CSS**

Append compact styles for `.metric-card`, `.data-table`, `.status-tag`, `.progress-bar`.

- [ ] **Step 5: Run tests**

Run:

```bash
cd apps/workshop-dashboard
npm test -- --run src/components/MetricCard.test.tsx
npm run typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/workshop-dashboard/src/components apps/workshop-dashboard/src/styles.css
git commit -m "feat: add workshop UI primitives"
```

---

### Task 5: Build Dashboard Screen

**Files:**
- Create: `apps/workshop-dashboard/src/screens/DashboardScreen.tsx`
- Create: `apps/workshop-dashboard/src/screens/DashboardScreen.test.tsx`
- Modify: `apps/workshop-dashboard/src/App.tsx`
- Modify: `apps/workshop-dashboard/src/styles.css`

- [ ] **Step 1: Write the failing dashboard test**

Create `DashboardScreen.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { dashboardSummary } from '../data/mockSausageProductionData';
import { DashboardScreen } from './DashboardScreen';

describe('DashboardScreen', () => {
  it('renders operational dashboard sections from mock API data', () => {
    render(<DashboardScreen summary={dashboardSummary} />);

    expect(screen.getByText('Сырье на складе')).toBeInTheDocument();
    expect(screen.getByText('Передача в цех')).toBeInTheDocument();
    expect(screen.getByText('Активные производственные заказы')).toBeInTheDocument();
    expect(screen.getByText('Остатки сырья (критические)')).toBeInTheDocument();
    expect(screen.getByText('Последние события')).toBeInTheDocument();
    expect(screen.getByText('Склад готовой продукции')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run red**

Run:

```bash
cd apps/workshop-dashboard
npm test -- --run src/screens/DashboardScreen.test.tsx
```

Expected: FAIL because screen does not exist.

- [ ] **Step 3: Implement DashboardScreen**

Build sections required by TZ-002:

- KPI grid;
- quick actions;
- active orders table;
- critical raw stock table;
- hourly output bars;
- recent events list;
- today losses table;
- finished goods snapshot table.

Use `MetricCard`, `DataTable`, `ProgressBar`, and `StatusTag`. Pass all data through props; do not import mock data inside the screen.

- [ ] **Step 4: Wire dashboard into App**

In `App.tsx`, load `dashboardSummary` through `sausageProductionApi.getDashboardSummary()` with `useEffect`, store it in state, and render `DashboardScreen` when `activeScreen === 'dashboard'`.

- [ ] **Step 5: Run tests and typecheck**

Run:

```bash
cd apps/workshop-dashboard
npm test -- --run src/screens/DashboardScreen.test.tsx src/App.test.tsx
npm run typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/workshop-dashboard/src
git commit -m "feat: add sausage workshop dashboard"
```

---

### Task 6: Build Table Screens For Orders, Batches, Transfers, Raw Materials, Finished Products, Clients, Losses, And Analytics

**Files:**
- Create: `apps/workshop-dashboard/src/screens/OrdersScreen.tsx`
- Create: `apps/workshop-dashboard/src/screens/BatchesScreen.tsx`
- Create: `apps/workshop-dashboard/src/screens/TransfersScreen.tsx`
- Create: `apps/workshop-dashboard/src/screens/RawMaterialsScreen.tsx`
- Create: `apps/workshop-dashboard/src/screens/FinishedProductsScreen.tsx`
- Create: `apps/workshop-dashboard/src/screens/ClientsScreen.tsx`
- Create: `apps/workshop-dashboard/src/screens/LossesScreen.tsx`
- Create: `apps/workshop-dashboard/src/screens/AnalyticsScreen.tsx`
- Create: `apps/workshop-dashboard/src/screens/Screens.test.tsx`
- Modify: `apps/workshop-dashboard/src/App.tsx`

- [ ] **Step 1: Write a failing multi-screen test**

Create `Screens.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  clientDemands,
  finishedProducts,
  losses,
  productionBatches,
  productionOrders,
  rawStockItems,
  stockMovements,
} from '../data/mockSausageProductionData';
import { OrdersScreen } from './OrdersScreen';
import { BatchesScreen } from './BatchesScreen';
import { TransfersScreen } from './TransfersScreen';
import { RawMaterialsScreen } from './RawMaterialsScreen';
import { FinishedProductsScreen } from './FinishedProductsScreen';
import { ClientsScreen } from './ClientsScreen';
import { LossesScreen } from './LossesScreen';
import { AnalyticsScreen } from './AnalyticsScreen';

describe('Sausage Workshop table screens', () => {
  it('renders all required workspace screens', () => {
    render(
      <>
        <OrdersScreen orders={productionOrders} />
        <BatchesScreen batches={productionBatches} />
        <TransfersScreen movements={stockMovements} />
        <RawMaterialsScreen items={rawStockItems} />
        <FinishedProductsScreen products={finishedProducts} />
        <ClientsScreen clients={clientDemands} />
        <LossesScreen losses={losses} />
        <AnalyticsScreen />
      </>,
    );

    expect(screen.getByText('Управление заказами')).toBeInTheDocument();
    expect(screen.getByText('Журнал партий выпуска')).toBeInTheDocument();
    expect(screen.getByText('Журнал перемещений')).toBeInTheDocument();
    expect(screen.getByText('Справочник сырья и остатки')).toBeInTheDocument();
    expect(screen.getByText('Склад готовой продукции')).toBeInTheDocument();
    expect(screen.getByText('Клиентская потребность')).toBeInTheDocument();
    expect(screen.getByText('Отчет по потерям')).toBeInTheDocument();
    expect(screen.getByText('Аналитика производства')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run red**

Run:

```bash
cd apps/workshop-dashboard
npm test -- --run src/screens/Screens.test.tsx
```

Expected: FAIL because screens do not exist.

- [ ] **Step 3: Implement each screen with typed props**

Each screen must:

- accept data via props;
- render a section title;
- use tables for operational data;
- use `MetricCard` for local KPI summaries when specified by TZ-002;
- not import mock data directly.

- [ ] **Step 4: Wire screens into App routing**

`App.tsx` should call the relevant `sausageProductionApi` methods and render the matching screen for each `ScreenKey`.

For `stock`, render a stock-focused view using the raw and finished stock screens or a compact combined screen.

- [ ] **Step 5: Run verification**

Run:

```bash
cd apps/workshop-dashboard
npm test -- --run src/screens/Screens.test.tsx src/App.test.tsx
npm run typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/workshop-dashboard/src
git commit -m "feat: add sausage workshop workspace screens"
```

---

### Task 7: Add Modal Flows And Validation

**Files:**
- Create: `apps/workshop-dashboard/src/components/Modal.tsx`
- Create: `apps/workshop-dashboard/src/components/Modal.test.tsx`
- Create: `apps/workshop-dashboard/src/screens/modals.tsx`
- Modify: `apps/workshop-dashboard/src/App.tsx`
- Modify: `apps/workshop-dashboard/src/styles.css`

- [ ] **Step 1: Write failing modal validation test**

Create `Modal.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ReleaseBatchModal } from '../screens/modals';

describe('ReleaseBatchModal', () => {
  it('prevents accepted quantity from exceeding produced quantity', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ReleaseBatchModal onClose={onClose} />);

    await user.clear(screen.getByLabelText('Фактически выпущено'));
    await user.type(screen.getByLabelText('Фактически выпущено'), '100');
    await user.clear(screen.getByLabelText('Принято на склад'));
    await user.type(screen.getByLabelText('Принято на склад'), '101');

    expect(screen.getByText('Нельзя принять больше, чем выпущено')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Подтвердить выпуск' })).toBeDisabled();
  });
});
```

- [ ] **Step 2: Run red**

Run:

```bash
cd apps/workshop-dashboard
npm test -- --run src/components/Modal.test.tsx
```

Expected: FAIL because modal components do not exist.

- [ ] **Step 3: Implement Modal primitive**

`Modal.tsx` must render:

- dialog role;
- title;
- close button;
- body;
- footer.

Use button elements for actions and visible focus states.

- [ ] **Step 4: Implement modal flows**

Create `screens/modals.tsx` with:

- `NewProductionOrderModal`;
- `RawReceiptModal`;
- `TransferToWorkshopModal`;
- `ReleaseBatchModal`;
- `WriteOffLossModal`.

Each modal must use controlled local state and client-side validation matching TZ-002.

- [ ] **Step 5: Wire quick actions**

Update `App.tsx` and `DashboardScreen.tsx` so quick actions open the correct modal.

- [ ] **Step 6: Run verification**

Run:

```bash
cd apps/workshop-dashboard
npm test -- --run src/components/Modal.test.tsx src/screens/DashboardScreen.test.tsx
npm run typecheck
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/workshop-dashboard/src
git commit -m "feat: add sausage workshop modal flows"
```

---

### Task 8: Polish Responsive Layout, Accessibility, And Namespace Guards

**Files:**
- Create: `apps/workshop-dashboard/src/api/namespace.test.ts`
- Modify: `apps/workshop-dashboard/src/styles.css`
- Modify: `apps/workshop-dashboard/README.md`

- [ ] **Step 1: Write namespace guard test**

Create `apps/workshop-dashboard/src/api/namespace.test.ts`:

```ts
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function readSourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) return readSourceFiles(path);
    if (path.endsWith('.ts') || path.endsWith('.tsx')) return [readFileSync(path, 'utf8')];
    return [];
  });
}

describe('sausage namespace guard', () => {
  it('does not call the generic production API namespace', () => {
    const sources = readSourceFiles(join(process.cwd(), 'src'));

    expect(sources.join('\n')).not.toContain('/api/production');
    expect(sources.join('\n')).toContain('/api/sausage-production');
  });
});
```

- [ ] **Step 2: Run red or green intentionally**

Run:

```bash
cd apps/workshop-dashboard
npm test -- --run src/api/namespace.test.ts
```

Expected: PASS if no generic namespace exists. If it fails, remove `/api/production` usage.

- [ ] **Step 3: Add responsive and accessibility polish**

Update CSS:

- sidebar hidden under 768px;
- tables keep horizontal scroll under 1200px;
- focus-visible outline for buttons and inputs;
- status tags include text labels, not color-only state;
- modals have max-height and scroll.

- [ ] **Step 4: Update README**

Document:

- how to run;
- visual reference;
- mock API mode;
- namespace rule;
- no Siyoma dashboard integration.

- [ ] **Step 5: Run full frontend verification**

Run:

```bash
cd apps/workshop-dashboard
npm test -- --run
npm run typecheck
npm run build
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add apps/workshop-dashboard
git commit -m "chore: verify sausage workshop frontend boundaries"
```

---

### Task 9: Run Browser Verification

**Files:**
- No code changes expected unless screenshots reveal layout defects.

- [ ] **Step 1: Start dev server**

Run:

```bash
cd apps/workshop-dashboard
npm run dev -- --port 5174
```

Expected: Vite serves `http://127.0.0.1:5174/`.

- [ ] **Step 2: Browser smoke check**

Open `http://127.0.0.1:5174/`.

Verify:

- first screen is dashboard, not a landing page;
- sidebar has all TZ-002 sections;
- topbar shows current section;
- KPI values fit their containers;
- tables do not overlap;
- quick actions open modals;
- release modal blocks accepted quantity greater than produced quantity;
- 1440px viewport is dense and readable;
- 768px viewport hides sidebar and keeps content readable.

- [ ] **Step 3: Fix visual defects if found**

If text overlaps or tables break, patch CSS and rerun:

```bash
cd apps/workshop-dashboard
npm test -- --run
npm run typecheck
npm run build
```

- [ ] **Step 4: Commit visual fixes**

```bash
git add apps/workshop-dashboard
git commit -m "fix: polish sausage workshop responsive layout"
```

Skip this commit if no visual fixes are needed.

---

## Self-Review Checklist

Spec coverage:

- Separate frontend app: Task 1.
- Sidebar/topbar: Task 3.
- Dashboard screen: Task 5.
- Orders, batches, transfers, raw materials, finished products, recipes, clients, losses, analytics: Task 6.
- Modals: Task 7.
- Mock API/client abstraction: Task 2.
- Namespace rule `/api/sausage-production`: Tasks 2 and 8.
- No `/api/production`: Task 8.
- Desktop-first responsive layout: Tasks 8 and 9.
- Accessibility basics: Tasks 7 and 8.
- No Siyoma dashboard integration: file structure and README in Tasks 1 and 8.

Known non-goals preserved:

- No backend implementation.
- No Prisma schema.
- No copied Siyoma code.
- No mobile app.

Execution order:

1. Scaffold.
2. Domain types/mock API.
3. Shell/navigation.
4. UI primitives.
5. Dashboard.
6. Remaining screens.
7. Modals.
8. Boundary verification.
9. Browser verification.


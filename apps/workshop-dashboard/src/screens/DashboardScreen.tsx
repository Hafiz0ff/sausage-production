import { Factory, PackageCheck, PackageMinus, Plus, Truck } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { MetricCard } from '../components/MetricCard';
import { ProgressBar } from '../components/ProgressBar';
import { StatusTag, getStockStatusLabel } from '../components/StatusTag';
import type { DashboardSnapshot, ModalKind, ProductionOrder, RawMaterial } from '../domain/types';

interface DashboardScreenProps {
  dashboard: DashboardSnapshot;
  onOpenModal: (kind: ModalKind) => void;
}

const quickActionIcons: Record<ModalKind, typeof Truck> = {
  transfer: Truck,
  release: PackageCheck,
  writeOff: PackageMinus,
  order: Plus,
  receipt: Plus,
  rawMaterial: Plus,
  finishedProduct: Plus,
  recipe: Plus,
  client: Plus,
  salesOrder: Plus,
  createDemandOrder: Plus,
  qualityCheck: PackageCheck,
  approveLoss: PackageCheck,
};

export function DashboardScreen({ dashboard, onOpenModal }: DashboardScreenProps) {
  return (
    <div className="screen-stack">
      <section className="kpi-grid" aria-label="Ключевые показатели">
        {dashboard.metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </section>

      <section className="quick-actions" aria-label="Быстрые действия">
        {dashboard.quickActions.map((action) => {
          const Icon = quickActionIcons[action.id];
          return (
            <button key={action.id} type="button" className="quick-action" onClick={() => onOpenModal(action.id)}>
              <span className="quick-action-icon">
                <Icon size={18} />
              </span>
              <span className="quick-action-label">{action.label}</span>
              <span className="quick-action-desc">{action.description}</span>
            </button>
          );
        })}
      </section>

      <section className="dashboard-grid">
        <article className="panel panel-wide">
          <header className="panel-header">
            <h2>Активные заказы</h2>
            <span className="panel-counter">{dashboard.activeOrders.length}</span>
          </header>
          <DataTable<ProductionOrder>
            rows={dashboard.activeOrders}
            getRowKey={(row) => row.id}
            columns={[
              { key: 'number', header: 'Заказ', render: (row) => <span className="mono">{row.number}</span> },
              { key: 'product', header: 'Продукт', render: (row) => row.productName },
              { key: 'quantity', header: 'Кол-во', align: 'right', render: (row) => <span className="mono">{row.quantityKg} кг</span> },
              { key: 'client', header: 'Клиент', render: (row) => row.clientName },
              { key: 'status', header: 'Статус', render: (row) => <StatusTag orderStatus={row.status} /> },
              { key: 'progress', header: 'Прогресс', render: (row) => <ProgressBar value={row.progress} /> },
            ]}
          />
        </article>

        <article className="panel">
          <header className="panel-header">
            <h2>Критические остатки</h2>
            <Factory size={16} />
          </header>
          <DataTable<RawMaterial>
            rows={dashboard.criticalRawStock}
            getRowKey={(row) => row.id}
            columns={[
              { key: 'name', header: 'Сырье', render: (row) => row.name },
              { key: 'warehouse', header: 'Склад', align: 'right', render: (row) => <span className="mono">{row.warehouseKg}</span> },
              { key: 'workshop', header: 'Цех', align: 'right', render: (row) => <span className="mono">{row.workshopKg}</span> },
              { key: 'status', header: 'Статус', render: (row) => <StatusTag stockStatus={row.status} label={getStockStatusLabel(row.status)} /> },
            ]}
          />
        </article>

        <article className="panel">
          <header className="panel-header">
            <h2>Выпуск по часам</h2>
            <span className="text-muted">кг</span>
          </header>
          <div className="chart-container">
            {dashboard.hourlyOutput.map((item) => (
              <div key={item.hour} className="chart-column">
                <span className="chart-value">{item.valueKg}</span>
                <span className="chart-bar" style={{ height: `${Math.max(18, item.valueKg / 4)}px` }} />
                <span className="chart-label">{item.hour}:00</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <header className="panel-header">
            <h2>Последние события</h2>
          </header>
          <div className="activity-list">
            {dashboard.events.map((event) => (
              <div className="activity-item" key={event.id}>
                <span className={`activity-dot dot-${event.tone}`} />
                <span className="activity-content">
                  <span className="activity-text">{event.text}</span>
                  <span className="activity-meta">{event.meta}</span>
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

import type { WorkshopDataset } from '../domain/types';

interface AnalyticsScreenProps {
  dataset: WorkshopDataset;
}

export function AnalyticsScreen({ dataset }: AnalyticsScreenProps) {
  const totalProduced = dataset.batches.reduce((sum, batch) => sum + batch.producedKg, 0);
  const totalAccepted = dataset.batches.reduce((sum, batch) => sum + batch.acceptedKg, 0);
  const totalLosses = dataset.losses.reduce((sum, loss) => sum + loss.quantityKg, 0);
  const avgYield = dataset.batches.length
    ? dataset.batches.reduce((sum, batch) => sum + batch.yieldPercent, 0) / dataset.batches.length
    : 0;

  return (
    <div className="analytics-grid">
      <article className="panel">
        <header className="panel-header">
          <h2>Итоги выпуска</h2>
        </header>
        <div className="summary-list">
          <div>
            <span>Произведено</span>
            <strong className="mono">{totalProduced} кг</strong>
          </div>
          <div>
            <span>Принято на склад</span>
            <strong className="mono text-success">{totalAccepted} кг</strong>
          </div>
          <div>
            <span>Потери</span>
            <strong className="mono text-danger">{totalLosses} кг</strong>
          </div>
          <div>
            <span>Средний выход</span>
            <strong className="mono">{avgYield.toFixed(1)}%</strong>
          </div>
        </div>
      </article>
      <article className="panel panel-wide">
        <header className="panel-header">
          <h2>Нагрузка по заказам</h2>
        </header>
        <div className="horizontal-bars">
          {dataset.orders.map((order) => (
            <div className="horizontal-bar-row" key={order.id}>
              <span>{order.productName}</span>
              <div className="horizontal-bar-track">
                <span style={{ width: `${Math.min(order.progress, 100)}%` }} />
              </div>
              <strong className="mono">{order.progress}%</strong>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

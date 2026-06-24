import type { KpiMetric } from '../domain/types';

interface MetricCardProps {
  metric: KpiMetric;
}

export function MetricCard({ metric }: MetricCardProps) {
  const deltaClass = metric.delta.startsWith('-') ? 'negative' : 'positive';

  return (
    <article className={`kpi-card kpi-${metric.tone}`}>
      <div className="kpi-header">
        <span className="kpi-label">{metric.label}</span>
        <span className={`kpi-marker marker-${metric.tone}`} />
      </div>
      <div className="kpi-value">
        {metric.value}
        {metric.unit ? <span className="unit">{metric.unit}</span> : null}
      </div>
      <div className={`kpi-delta ${deltaClass}`}>{metric.delta}</div>
    </article>
  );
}

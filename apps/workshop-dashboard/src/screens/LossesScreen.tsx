import { DataTable } from '../components/DataTable';
import { StatusTag } from '../components/StatusTag';
import type { LossReason, LossRecord, StatusTone } from '../domain/types';

interface LossesScreenProps {
  losses: LossRecord[];
}

const reasonLabels: Record<LossReason, string> = {
  trimming: 'Обрезь',
  thermal_loss: 'Термоусушка',
  defect: 'Брак',
  expiry: 'Просрочка',
  calibration: 'Калибровка',
};

const reasonTones: Record<LossReason, StatusTone> = {
  trimming: 'warning',
  thermal_loss: 'accent',
  defect: 'danger',
  expiry: 'danger',
  calibration: 'info',
};

export function LossesScreen({ losses }: LossesScreenProps) {
  return (
    <article className="panel">
      <header className="panel-header">
        <h2>Потери и списания</h2>
        <span className="panel-counter">{losses.length}</span>
      </header>
      <DataTable<LossRecord>
        rows={losses}
        getRowKey={(row) => row.id}
        columns={[
          { key: 'doc', header: 'Документ', render: (row) => <span className="mono">{row.docNo}</span> },
          { key: 'item', header: 'Номенклатура', render: (row) => row.itemName },
          { key: 'reason', header: 'Причина', render: (row) => <StatusTag label={reasonLabels[row.reason]} tone={reasonTones[row.reason]} /> },
          { key: 'qty', header: 'Кол-во', align: 'right', render: (row) => <span className="mono text-danger">{row.quantityKg} кг</span> },
          { key: 'cost', header: 'Сумма', align: 'right', render: (row) => <span className="mono">{row.cost}</span> },
          { key: 'operator', header: 'Опер.', render: (row) => <span className="mono">{row.operator}</span> },
          { key: 'time', header: 'Время', render: (row) => <span className="mono">{row.createdAt}</span> },
        ]}
      />
    </article>
  );
}

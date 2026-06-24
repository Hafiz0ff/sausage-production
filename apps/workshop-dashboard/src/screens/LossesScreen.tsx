import { DataTable } from '../components/DataTable';
import { StatusTag } from '../components/StatusTag';
import type { LossReason, LossRecord, StatusTone } from '../domain/types';

interface LossesScreenProps {
  losses: LossRecord[];
}

const reasonLabels: Record<LossReason, string> = {
  TRIMMING: 'Обрезь',
  THERMAL_LOSS: 'Термоусушка',
  DEFECT: 'Брак',
  EXPIRY: 'Просрочка',
  CALIBRATION: 'Калибровка',
  PACKAGING_DAMAGE: 'Упаковка',
  QUALITY_REJECT: 'Контроль качества',
  WEIGHT_VARIANCE: 'Отклонение веса',
  OTHER: 'Другое',
};

const reasonTones: Record<LossReason, StatusTone> = {
  TRIMMING: 'warning',
  THERMAL_LOSS: 'accent',
  DEFECT: 'danger',
  EXPIRY: 'danger',
  CALIBRATION: 'info',
  PACKAGING_DAMAGE: 'warning',
  QUALITY_REJECT: 'danger',
  WEIGHT_VARIANCE: 'warning',
  OTHER: 'neutral',
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
          { key: 'category', header: 'Категория', render: (row) => row.category || '-' },
          { key: 'stage', header: 'Этап', render: (row) => row.stage || '-' },
          { key: 'qty', header: 'Кол-во', align: 'right', render: (row) => <span className="mono text-danger">{row.quantityKg} кг</span> },
          { key: 'cost', header: 'Сумма', align: 'right', render: (row) => <span className="mono">{row.cost}</span> },
          { key: 'operator', header: 'Опер.', render: (row) => <span className="mono">{row.operator}</span> },
          { key: 'approved', header: 'Согласовано', render: (row) => row.approvedByUserId ? <StatusTag label="Да" tone="success" /> : <StatusTag label="Нет" tone="warning" /> },
          { key: 'time', header: 'Время', render: (row) => <span className="mono">{row.createdAt}</span> },
        ]}
      />
    </article>
  );
}

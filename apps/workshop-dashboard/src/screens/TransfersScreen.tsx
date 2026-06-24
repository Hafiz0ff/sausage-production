import { DataTable } from '../components/DataTable';
import { StatusTag } from '../components/StatusTag';
import type { MovementType, StockMovement, StatusTone } from '../domain/types';

interface TransfersScreenProps {
  movements: StockMovement[];
}

const movementLabels: Record<MovementType, string> = {
  receipt: 'Приемка',
  transfer_to_workshop: 'В цех',
  consume: 'Расход',
  release: 'Выпуск',
  write_off: 'Списание',
  adjustment: 'Коррекция',
};

const movementTones: Record<MovementType, StatusTone> = {
  receipt: 'success',
  transfer_to_workshop: 'accent',
  consume: 'warning',
  release: 'info',
  write_off: 'danger',
  adjustment: 'neutral',
};

export function TransfersScreen({ movements }: TransfersScreenProps) {
  return (
    <article className="panel">
      <header className="panel-header">
        <h2>Перемещения</h2>
        <span className="panel-counter">{movements.length}</span>
      </header>
      <DataTable<StockMovement>
        rows={movements}
        getRowKey={(row) => row.id}
        columns={[
          { key: 'doc', header: 'Документ', render: (row) => <span className="mono">{row.docNo}</span> },
          { key: 'type', header: 'Тип', render: (row) => <StatusTag label={movementLabels[row.type]} tone={movementTones[row.type]} /> },
          { key: 'item', header: 'Номенклатура', render: (row) => row.itemName },
          { key: 'qty', header: 'Кол-во', align: 'right', render: (row) => <span className="mono">{row.quantityKg} кг</span> },
          { key: 'from', header: 'Откуда', render: (row) => row.from },
          { key: 'to', header: 'Куда', render: (row) => row.to },
          { key: 'operator', header: 'Опер.', render: (row) => <span className="mono">{row.operator}</span> },
          { key: 'time', header: 'Время', render: (row) => <span className="mono">{row.createdAt}</span> },
        ]}
      />
    </article>
  );
}

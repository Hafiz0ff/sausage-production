import { DataTable } from '../components/DataTable';
import type { ProductionBatch } from '../domain/types';

interface BatchesScreenProps {
  batches: ProductionBatch[];
}

export function BatchesScreen({ batches }: BatchesScreenProps) {
  return (
    <article className="panel">
      <header className="panel-header">
        <h2>Партии выпуска</h2>
        <span className="panel-counter">{batches.length}</span>
      </header>
      <DataTable<ProductionBatch>
        rows={batches}
        getRowKey={(row) => row.id}
        columns={[
          { key: 'batch', header: 'Партия', render: (row) => <span className="mono">{row.batchNo}</span> },
          { key: 'order', header: 'Заказ', render: (row) => <span className="mono">{row.orderNo}</span> },
          { key: 'product', header: 'Продукт', render: (row) => row.productName },
          { key: 'produced', header: 'Произв.', align: 'right', render: (row) => <span className="mono">{row.producedKg} кг</span> },
          { key: 'accepted', header: 'Принято', align: 'right', render: (row) => <span className="mono text-success">{row.acceptedKg} кг</span> },
          { key: 'rejected', header: 'Брак', align: 'right', render: (row) => <span className="mono text-danger">{row.rejectedKg} кг</span> },
          { key: 'yield', header: 'Выход', align: 'right', render: (row) => <span className="mono">{row.yieldPercent}%</span> },
          { key: 'time', header: 'Время', render: (row) => <span className="mono">{row.releasedAt}</span> },
        ]}
      />
    </article>
  );
}

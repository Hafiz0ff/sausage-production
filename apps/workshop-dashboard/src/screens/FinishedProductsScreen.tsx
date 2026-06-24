import { DataTable } from '../components/DataTable';
import { StatusTag } from '../components/StatusTag';
import type { FinishedProduct } from '../domain/types';

interface FinishedProductsScreenProps {
  finishedProducts: FinishedProduct[];
}

export function FinishedProductsScreen({ finishedProducts }: FinishedProductsScreenProps) {
  return (
    <article className="panel">
      <header className="panel-header">
        <h2>Готовая продукция</h2>
        <span className="panel-counter">{finishedProducts.length}</span>
      </header>
      <DataTable<FinishedProduct>
        rows={finishedProducts}
        getRowKey={(row) => row.id}
        columns={[
          { key: 'sku', header: 'SKU', render: (row) => <span className="mono">{row.sku}</span> },
          { key: 'name', header: 'Продукт', render: (row) => row.name },
          { key: 'stockKg', header: 'Склад кг', align: 'right', render: (row) => <span className="mono">{row.stockKg}</span> },
          { key: 'stockPcs', header: 'Шт.', align: 'right', render: (row) => <span className="mono">{row.stockPcs}</span> },
          { key: 'reserved', header: 'Резерв', align: 'right', render: (row) => <span className="mono">{row.reservedKg} кг</span> },
          { key: 'shelf', header: 'Срок', align: 'right', render: (row) => <span className="mono">{row.shelfLifeDays} дн.</span> },
          { key: 'status', header: 'Статус', render: (row) => <StatusTag stockStatus={row.status} /> },
        ]}
      />
    </article>
  );
}

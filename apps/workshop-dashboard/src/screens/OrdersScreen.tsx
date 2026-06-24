import { DataTable } from '../components/DataTable';
import { ProgressBar } from '../components/ProgressBar';
import { StatusTag } from '../components/StatusTag';
import type { ProductionOrder } from '../domain/types';

interface OrdersScreenProps {
  orders: ProductionOrder[];
}

export function OrdersScreen({ orders }: OrdersScreenProps) {
  return (
    <article className="panel">
      <header className="panel-header">
        <h2>Заказы на производство</h2>
        <span className="panel-counter">{orders.length}</span>
      </header>
      <DataTable<ProductionOrder>
        rows={orders}
        getRowKey={(row) => row.id}
        columns={[
          { key: 'number', header: 'Номер', render: (row) => <span className="mono">{row.number}</span> },
          { key: 'product', header: 'Продукция', render: (row) => row.productName },
          { key: 'quantity', header: 'Кол-во', align: 'right', render: (row) => <span className="mono">{row.quantityKg} кг</span> },
          { key: 'client', header: 'Клиент', render: (row) => row.clientName },
          { key: 'status', header: 'Статус', render: (row) => <StatusTag orderStatus={row.status} /> },
          { key: 'progress', header: 'Прогресс', render: (row) => <ProgressBar value={row.progress} /> },
          { key: 'due', header: 'Срок', render: (row) => <span className="mono">{row.dueAt}</span> },
          { key: 'shift', header: 'Смена', render: (row) => row.shift },
        ]}
      />
    </article>
  );
}

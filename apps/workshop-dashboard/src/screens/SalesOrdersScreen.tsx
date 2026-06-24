import { DataTable } from '../components/DataTable';
import type { SalesOrder } from '../domain/types';

interface SalesOrdersScreenProps {
  salesOrders: SalesOrder[];
  onReserve: (orderId: string, itemId: string, quantityQty: number) => void;
  onRelease: (reservationId: string) => void;
  onComplete: (reservationId: string) => void;
}

export function SalesOrdersScreen({ salesOrders, onReserve, onRelease, onComplete }: SalesOrdersScreenProps) {
  return (
    <article className="panel">
      <header className="panel-header">
        <h2>Заказы клиентов</h2>
        <span className="panel-counter">{salesOrders.length}</span>
      </header>
      <DataTable<SalesOrder>
        rows={salesOrders}
        getRowKey={(row) => row.id}
        columns={[
          { key: 'number', header: 'Номер', render: (row) => <span className="mono">{row.number}</span> },
          { key: 'client', header: 'Клиент', render: (row) => row.clientName },
          { key: 'status', header: 'Статус', render: (row) => row.status },
          { key: 'createdAt', header: 'Дата', render: (row) => <span className="mono">{new Date(row.createdAt).toLocaleDateString()}</span> },
          {
            key: 'items',
            header: 'Позиции',
            render: (row) => {
              const item = row.items[0];
              if (!item) return '0';
              return (
                <span>
                  {item.finishedProductName}: <span className="mono">{item.reservedQty}/{item.quantityQty} кг</span>
                </span>
              );
            },
          },
          {
            key: 'actions',
            header: 'Действие',
            align: 'right',
            render: (row) => {
              const item = row.items[0];
              if (!item) return null;

              if (item.activeReservationId) {
                return (
                  <div className="table-actions">
                    <button className="btn btn-small" type="button" onClick={() => onRelease(item.activeReservationId!)}>
                      Снять
                    </button>
                    <button className="btn btn-small btn-primary" type="button" onClick={() => onComplete(item.activeReservationId!)}>
                      Закрыть
                    </button>
                  </div>
                );
              }

              return (
                <button
                  className="btn btn-small btn-primary"
                  type="button"
                  disabled={item.shortageQty <= 0}
                  onClick={() => onReserve(row.id, item.id, item.shortageQty)}
                >
                  Резерв
                </button>
              );
            },
          },
        ]}
      />
    </article>
  );
}

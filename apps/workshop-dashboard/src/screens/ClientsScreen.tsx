import { DataTable } from '../components/DataTable';
import type { Client } from '../domain/types';

interface ClientsScreenProps {
  clients: Client[];
}

export function ClientsScreen({ clients }: ClientsScreenProps) {
  return (
    <article className="panel">
      <header className="panel-header">
        <h2>Клиентская база</h2>
        <span className="panel-counter">{clients.length}</span>
      </header>
      <DataTable<Client>
        rows={clients}
        getRowKey={(row) => row.id}
        columns={[
          { key: 'name', header: 'Клиент', render: (row) => row.name },
          { key: 'segment', header: 'Сегмент', render: (row) => row.segment },
          { key: 'phone', header: 'Телефон', render: (row) => <span className="mono">{row.phone}</span> },
          { key: 'balance', header: 'Баланс', align: 'right', render: (row) => <span className="mono">{row.balance}</span> },
          { key: 'lastOrder', header: 'Последний заказ', render: (row) => <span className="mono">{row.lastOrder}</span> },
        ]}
      />
    </article>
  );
}

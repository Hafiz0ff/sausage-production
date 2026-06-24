import { DataTable } from '../components/DataTable';
import { StatusTag } from '../components/StatusTag';
import type { RawMaterial } from '../domain/types';

interface RawMaterialsScreenProps {
  rawMaterials: RawMaterial[];
}

export function RawMaterialsScreen({ rawMaterials }: RawMaterialsScreenProps) {
  return (
    <article className="panel">
      <header className="panel-header">
        <h2>Сырье</h2>
        <span className="panel-counter">{rawMaterials.length}</span>
      </header>
      <DataTable<RawMaterial>
        rows={rawMaterials}
        getRowKey={(row) => row.id}
        columns={[
          { key: 'name', header: 'Сырье', render: (row) => row.name },
          { key: 'group', header: 'Группа', render: (row) => row.group },
          { key: 'warehouse', header: 'Склад', align: 'right', render: (row) => <span className="mono">{row.warehouseKg} кг</span> },
          { key: 'workshop', header: 'Цех', align: 'right', render: (row) => <span className="mono">{row.workshopKg} кг</span> },
          { key: 'reserved', header: 'Резерв', align: 'right', render: (row) => <span className="mono">{row.reservedKg} кг</span> },
          { key: 'min', header: 'Мин.', align: 'right', render: (row) => <span className="mono">{row.minKg} кг</span> },
          { key: 'supplier', header: 'Поставщик', render: (row) => row.supplier },
          { key: 'status', header: 'Статус', render: (row) => <StatusTag stockStatus={row.status} /> },
        ]}
      />
    </article>
  );
}

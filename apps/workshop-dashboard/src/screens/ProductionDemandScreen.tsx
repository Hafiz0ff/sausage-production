import { DataTable } from '../components/DataTable';
import type { ProductionDemand } from '../domain/types';

interface ProductionDemandScreenProps {
  productionDemand: ProductionDemand[];
  onCreateProductionOrder: (finishedProductId: string, quantityQty: number) => void;
}

export function ProductionDemandScreen({ productionDemand, onCreateProductionOrder }: ProductionDemandScreenProps) {
  return (
    <article className="panel">
      <header className="panel-header">
        <h2>Потребность производства</h2>
        <span className="panel-counter">{productionDemand.length}</span>
      </header>
      <DataTable<ProductionDemand>
        rows={productionDemand}
        getRowKey={(row) => row.finishedProductId}
        columns={[
          { key: 'product', header: 'Продукция', render: (row) => row.finishedProductName },
          { key: 'requiredQty', header: 'Требуется', align: 'right', render: (row) => <span className="mono">{row.requiredQty} кг</span> },
          { key: 'availableQty', header: 'Доступно (свободно)', align: 'right', render: (row) => <span className="mono">{row.availableQty} кг</span> },
          { key: 'reservedQty', header: 'Резерв', align: 'right', render: (row) => <span className="mono">{row.reservedQty} кг</span> },
          { key: 'shortageQty', header: 'Дефицит', align: 'right', render: (row) => <span className="mono" style={{ color: row.shortageQty > 0 ? 'var(--color-danger)' : 'inherit' }}>{row.shortageQty} кг</span> },
          { key: 'suggestedQty', header: 'К производству', align: 'right', render: (row) => <span className="mono">{row.suggestedProductionQty} кг</span> },
          {
            key: 'action',
            header: 'Действие',
            align: 'right',
            render: (row) => (
              <button
                className="btn btn-small btn-primary"
                type="button"
                disabled={row.suggestedProductionQty <= 0}
                onClick={() => onCreateProductionOrder(row.finishedProductId, row.suggestedProductionQty)}
              >
                Создать ПЗ
              </button>
            )
          },
        ]}
      />
    </article>
  );
}

import { FinishedProductsScreen } from './FinishedProductsScreen';
import { RawMaterialsScreen } from './RawMaterialsScreen';
import type { FinishedProduct, RawMaterial } from '../domain/types';

interface BalancesScreenProps {
  rawMaterials: RawMaterial[];
  finishedProducts: FinishedProduct[];
}

export function BalancesScreen({ rawMaterials, finishedProducts }: BalancesScreenProps) {
  return (
    <div className="screen-stack">
      <RawMaterialsScreen rawMaterials={rawMaterials} />
      <FinishedProductsScreen finishedProducts={finishedProducts} />
    </div>
  );
}

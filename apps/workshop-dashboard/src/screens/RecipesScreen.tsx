import type { Recipe } from '../domain/types';

interface RecipesScreenProps {
  recipes: Recipe[];
}

export function RecipesScreen({ recipes }: RecipesScreenProps) {
  return (
    <div className="recipe-grid">
      {recipes.map((recipe) => (
        <article className="panel recipe-panel" key={recipe.id}>
          <header className="panel-header">
            <div>
              <h2>{recipe.productName}</h2>
              <p className="panel-subtitle">Выход {recipe.outputKg} кг / норматив {recipe.expectedYieldPercent}%</p>
            </div>
            <span className="panel-counter">{recipe.items.length}</span>
          </header>
          <div className="recipe-list">
            {recipe.items.map((item) => (
              <div className="recipe-row" key={`${recipe.id}-${item.materialId}`}>
                <span>{item.materialName}</span>
                <span className="mono">{item.quantityKg} кг</span>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

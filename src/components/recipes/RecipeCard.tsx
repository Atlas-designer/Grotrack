import { useState } from 'react';
import { Clock, Users, ShoppingCart, Check } from 'lucide-react';
import { RecipeMatch } from '../../types';
import { useShoppingList } from '../../hooks/useShoppingList';

interface RecipeCardProps {
  match: RecipeMatch;
  onClick: () => void;
}

export function RecipeCard({ match, onClick }: RecipeCardProps) {
  const { recipe, matchPercentage, missingIngredients, allAvailable } = match;
  const { addItem: addToShoppingList } = useShoppingList();
  const [addedToList, setAddedToList] = useState(false);
  const totalTime = recipe.prepTime + recipe.cookTime;

  const getBadgeClass = () => {
    if (allAvailable) return 'bg-emerald-400/15 text-emerald-400';
    if (matchPercentage >= 70) return 'bg-amber-400/15 text-amber-400';
    return 'bg-red-400/15 text-red-400';
  };

  const handleAddMissing = async (e: React.MouseEvent) => {
    e.stopPropagation();
    for (const missing of missingIngredients) {
      await addToShoppingList(missing.name, missing.quantity, missing.unit);
    }
    setAddedToList(true);
  };

  return (
    <div
      onClick={onClick}
      className="bg-navy-800 rounded-xl border border-white/5 p-3 cursor-pointer active:scale-[0.98] transition-transform"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-navy-700 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">{recipe.emoji}</span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white text-sm truncate">{recipe.name}</h3>
          <p className="text-xs text-gray-500 truncate">{recipe.description}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[11px] text-gray-500 flex items-center gap-1">
              <Clock size={11} /> {totalTime}m
            </span>
            <span className="text-[11px] text-gray-500 flex items-center gap-1">
              <Users size={11} /> {recipe.servings}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getBadgeClass()}`}>
            {matchPercentage}%
          </span>
          {missingIngredients.length > 0 && (
            <button
              onClick={handleAddMissing}
              disabled={addedToList}
              className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full transition-colors ${
                addedToList
                  ? 'text-emerald-400 bg-emerald-400/10'
                  : 'text-red-400 hover:bg-red-400/10'
              }`}
            >
              {addedToList ? <Check size={10} /> : <ShoppingCart size={10} />}
              {addedToList ? 'Added' : `${missingIngredients.length} missing`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { ArrowLeft, Clock, Users, ShoppingCart, Trash2, ChefHat, Pencil, AlertTriangle, Share2, Check } from 'lucide-react';
import { RecipeMatch, UnitType } from '../../types';
import { useInventory } from '../../hooks/useInventory';
import { useShoppingList } from '../../hooks/useShoppingList';
import { useRecipes } from '../../hooks/useRecipes';
import { calculateSubtractions } from '../../utils/ingredientMatcher';
import { shareRecipe } from '../../utils/recipeShare';

interface RecipeDetailViewProps {
  match: RecipeMatch;
  onBack: () => void;
  onEdit?: () => void;
}

export function RecipeDetailView({ match, onBack, onEdit }: RecipeDetailViewProps) {
  const { recipe, matchedIngredients, missingIngredients } = match;
  const { items: inventory, updateItem, removeItem: removeInventoryItem } = useInventory();
  const { addItem: addToShoppingList } = useShoppingList();
  const { deleteRecipe, hideBuiltInRecipe } = useRecipes();
  const [subtracted, setSubtracted] = useState(false);
  const [subtracting, setSubtracting] = useState(false);
  const [showSubtractConfirm, setShowSubtractConfirm] = useState(false);
  const [addedToList, setAddedToList] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [shared, setShared] = useState(false);

  const isCustom = recipe.source === 'custom';

  const handleShare = async () => {
    const result = await shareRecipe(recipe);
    if (result === 'copied' || result === 'shared') {
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const handleSubtractIngredients = async () => {
    setSubtracting(true);
    try {
      const subtractions = calculateSubtractions(recipe, inventory);
      for (const sub of subtractions) {
        if (sub.newQuantity <= 0) {
          await removeInventoryItem(sub.itemId);
        } else {
          await updateItem(sub.itemId, { quantity: sub.newQuantity });
        }
      }
      setSubtracted(true);
      setShowSubtractConfirm(false);
    } finally {
      setSubtracting(false);
    }
  };

  const handleAddMissingToList = async () => {
    for (const missing of missingIngredients) {
      await addToShoppingList(missing.name, missing.quantity, missing.unit);
    }
    setAddedToList(true);
  };

  const handleDelete = async () => {
    if (isCustom) {
      await deleteRecipe(recipe.id);
    } else {
      await hideBuiltInRecipe(recipe.id);
    }
    onBack();
  };

  const getIngredientStatus = (name: string) => {
    const matched = matchedIngredients.find(
      (m) => m.recipeIngredient.name === name
    );
    if (!matched) return 'missing';
    return matched.sufficient ? 'available' : 'insufficient';
  };

  const formatUnit = (qty: number, unit: UnitType) => {
    if (unit === 'pieces') return qty === 1 ? '' : `× ${qty}`;
    return `${qty}${unit}`;
  };

  return (
    <div className="min-h-screen bg-navy-950">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-navy-900/80 backdrop-blur-lg border-b border-white/5">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-400" />
          </button>
          <span className="text-2xl">{recipe.emoji}</span>
          <h1 className="text-lg font-bold text-white truncate flex-1">{recipe.name}</h1>
          <button
            onClick={handleShare}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
          >
            {shared ? <Check size={20} className="text-emerald-400" /> : <Share2 size={20} className="text-gray-400" />}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-5 pb-24">
        {/* Meta row */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400 flex items-center gap-1.5">
            <Clock size={14} /> {recipe.prepTime + recipe.cookTime}m
          </span>
          <span className="text-sm text-gray-400 flex items-center gap-1.5">
            <Users size={14} /> {recipe.servings} servings
          </span>
          {isCustom && (
            <span className="text-xs text-accent-400 bg-accent-400/10 px-2 py-0.5 rounded-full">
              Custom
            </span>
          )}
        </div>

        <p className="text-sm text-gray-400">{recipe.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {recipe.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-[11px] bg-navy-800 text-gray-400 rounded-full border border-white/5"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Ingredients */}
        <div>
          <h2 className="text-sm font-semibold text-white mb-3">Ingredients</h2>
          <div className="space-y-2">
            {recipe.ingredients.map((ing, idx) => {
              const status = getIngredientStatus(ing.name);
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2.5 bg-navy-800 rounded-xl border border-white/5"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm">
                    {status === 'available' && (
                      <span className="text-emerald-400">✓</span>
                    )}
                    {status === 'insufficient' && (
                      <AlertTriangle size={14} className="text-amber-400" />
                    )}
                    {status === 'missing' && (
                      <span className="text-red-400">✗</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span
                      className={`text-sm ${
                        status === 'missing'
                          ? 'text-red-400'
                          : status === 'insufficient'
                          ? 'text-amber-400'
                          : 'text-white'
                      }`}
                    >
                      {ing.name}
                    </span>
                    {ing.optional && (
                      <span className="text-[10px] text-gray-600 ml-1.5">(optional)</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {formatUnit(ing.quantity, ing.unit)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Instructions */}
        <div>
          <h2 className="text-sm font-semibold text-white mb-3">Instructions</h2>
          <div className="space-y-3">
            {recipe.instructions.map((step, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="w-6 h-6 bg-accent-400/15 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-accent-400">{idx + 1}</span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {recipe.notes && (
          <div>
            <h2 className="text-sm font-semibold text-white mb-2">Notes</h2>
            <p className="text-sm text-gray-400">{recipe.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2 pt-2">
          {!subtracted ? (
            !showSubtractConfirm ? (
              <button
                onClick={() => setShowSubtractConfirm(true)}
                className="w-full py-3 bg-accent-400 text-navy-950 font-semibold rounded-xl hover:bg-accent-300 transition-colors flex items-center justify-center gap-2"
              >
                <ChefHat size={18} />
                Remove Used Ingredients
              </button>
            ) : (
              <div className="bg-navy-800 border border-white/10 rounded-xl p-4 space-y-3">
                <p className="text-sm text-white font-medium">Subtract these from inventory?</p>
                <div className="space-y-1">
                  {recipe.ingredients.filter((i) => getIngredientStatus(i.name) !== 'missing').map((ing, idx) => (
                    <p key={idx} className="text-xs text-gray-400">
                      - {ing.quantity}{ing.unit !== 'pieces' ? ing.unit : ''} {ing.name}
                    </p>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSubtractConfirm(false)}
                    className="flex-1 py-2.5 bg-navy-700 text-white text-sm font-medium rounded-xl hover:bg-navy-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubtractIngredients}
                    disabled={subtracting}
                    className="flex-1 py-2.5 bg-accent-400 text-navy-950 text-sm font-semibold rounded-xl hover:bg-accent-300 transition-colors disabled:opacity-50"
                  >
                    {subtracting ? 'Updating...' : 'Confirm'}
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="w-full py-3 bg-emerald-400/10 text-emerald-400 font-medium rounded-xl text-center text-sm">
              Ingredients removed from inventory
            </div>
          )}

          {missingIngredients.length > 0 && (
            <button
              onClick={handleAddMissingToList}
              disabled={addedToList}
              className={`w-full py-3 text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-colors ${
                addedToList
                  ? 'bg-emerald-400/10 text-emerald-400'
                  : 'bg-navy-800 border border-white/10 text-white hover:bg-navy-700'
              }`}
            >
              <ShoppingCart size={16} />
              {addedToList
                ? `Added ${missingIngredients.length} items to shopping list`
                : `Add ${missingIngredients.length} Missing to Shopping List`}
            </button>
          )}

          <div className="flex gap-2 pt-1">
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex-1 py-2.5 bg-navy-800 border border-white/10 text-white text-sm font-medium rounded-xl hover:bg-navy-700 transition-colors flex items-center justify-center gap-2"
              >
                <Pencil size={14} />
                Edit
              </button>
            )}
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex-1 py-2.5 bg-navy-800 border border-red-400/20 text-red-400 text-sm font-medium rounded-xl hover:bg-red-400/10 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={14} />
                {isCustom ? 'Delete' : 'Hide'}
              </button>
            ) : (
              <div className="flex-1 flex gap-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 py-2.5 bg-navy-800 border border-white/10 text-white text-sm rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-xl"
                >
                  Confirm
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

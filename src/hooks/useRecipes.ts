import { useMemo } from 'react';
import { useRecipeStore } from '../store/recipeStore';
import { useHouse } from '../contexts/HouseContext';
import { useInventory } from './useInventory';
import { BUILT_IN_RECIPES } from '../data/builtInRecipes';
import { matchRecipeToInventory, sortRecipeMatches } from '../utils/ingredientMatcher';
import { Recipe, RecipeTag } from '../types';

export function useRecipes() {
  const store = useRecipeStore();
  const { activeHouseId } = useHouse();
  const { items: inventoryItems } = useInventory();

  const allRecipes = useMemo(() => {
    // Filter out hidden built-ins
    const visibleBuiltIns = BUILT_IN_RECIPES.filter(
      (r) => !store.hiddenBuiltInIds.includes(r.id)
    );
    return [...visibleBuiltIns, ...store.customRecipes];
  }, [store.customRecipes, store.hiddenBuiltInIds]);

  const allMatches = useMemo(
    () => sortRecipeMatches(allRecipes.map((r) => matchRecipeToInventory(r, inventoryItems))),
    [allRecipes, inventoryItems]
  );

  const filterByTag = (tag: RecipeTag | null) => {
    if (!tag) return allMatches;
    return allMatches.filter((m) => m.recipe.tags.includes(tag));
  };

  return {
    allMatches,
    readyToMake: allMatches.filter((m) => m.allAvailable),
    almostReady: allMatches.filter((m) => !m.allAvailable && m.matchPercentage >= 50),
    customRecipes: store.customRecipes,
    loading: store.loading,
    filterByTag,

    addRecipe: (recipe: Omit<Recipe, 'id' | 'source' | 'createdBy' | 'createdAt'>) =>
      activeHouseId ? store.addRecipe(activeHouseId, recipe) : Promise.resolve(),

    updateRecipe: (recipeId: string, updates: Partial<Recipe>) =>
      activeHouseId ? store.updateRecipe(activeHouseId, recipeId, updates) : Promise.resolve(),

    deleteRecipe: (recipeId: string) =>
      activeHouseId ? store.deleteRecipe(activeHouseId, recipeId) : Promise.resolve(),

    hideBuiltInRecipe: (builtInId: string) =>
      activeHouseId ? store.hideBuiltInRecipe(activeHouseId, builtInId) : Promise.resolve(),

    saveBuiltInAsCustom: (recipe: Recipe, updates: Partial<Recipe>) =>
      activeHouseId ? store.saveBuiltInAsCustom(activeHouseId, recipe, updates) : Promise.resolve(),
  };
}

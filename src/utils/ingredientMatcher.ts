import { Recipe, RecipeMatch, MatchedIngredient, RecipeIngredient, InventoryItem, UnitType } from '../types';

type BaseUnit = 'g' | 'ml' | 'pieces' | 'pack';

function toBase(quantity: number, unit: UnitType): { quantity: number; base: BaseUnit } {
  switch (unit) {
    case 'kg': return { quantity: quantity * 1000, base: 'g' };
    case 'g': return { quantity, base: 'g' };
    case 'L': return { quantity: quantity * 1000, base: 'ml' };
    case 'ml': return { quantity, base: 'ml' };
    case 'pieces': return { quantity, base: 'pieces' };
    case 'pack': return { quantity, base: 'pack' };
  }
}

function fromBase(quantity: number, originalUnit: UnitType): number {
  switch (originalUnit) {
    case 'kg': return quantity / 1000;
    case 'L': return quantity / 1000;
    default: return quantity;
  }
}

function depluralize(word: string): string {
  if (word.endsWith('ies') && word.length > 4) return word.slice(0, -3) + 'y';
  if (word.endsWith('oes')) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss') && word.length > 2) return word.slice(0, -1);
  return word;
}

function normalize(name: string): string {
  return name.toLowerCase().trim();
}

function matchesIngredient(inventoryName: string, recipeName: string): boolean {
  const inv = normalize(inventoryName);
  const rec = normalize(recipeName);

  if (inv === rec) return true;

  const invDep = inv.split(/\s+/).map(depluralize).join(' ');
  const recDep = rec.split(/\s+/).map(depluralize).join(' ');
  if (invDep === recDep) return true;

  if (inv.includes(rec) || rec.includes(inv)) return true;
  if (invDep.includes(recDep) || recDep.includes(invDep)) return true;

  // Token overlap: all tokens of recipe ingredient found in inventory name
  const invTokens = inv.split(/\s+/).map(depluralize);
  const recTokens = rec.split(/\s+/).map(depluralize);
  const allRecInInv = recTokens.every((t) => invTokens.some((it) => it.includes(t) || t.includes(it)));
  const allInvInRec = invTokens.every((t) => recTokens.some((rt) => rt.includes(t) || t.includes(rt)));

  return allRecInInv || allInvInRec;
}

export function matchRecipeToInventory(recipe: Recipe, inventory: InventoryItem[]): RecipeMatch {
  const matched: MatchedIngredient[] = [];
  const missing: RecipeIngredient[] = [];

  for (const ingredient of recipe.ingredients) {
    const invMatch = inventory.find((item) => matchesIngredient(item.name, ingredient.name));

    if (invMatch) {
      const recBase = toBase(ingredient.quantity, ingredient.unit);
      const invBase = toBase(invMatch.quantity, invMatch.unit);
      const sufficient = recBase.base === invBase.base
        ? invBase.quantity >= recBase.quantity
        : true;

      matched.push({ recipeIngredient: ingredient, inventoryItem: invMatch, sufficient });
    } else if (!ingredient.optional) {
      missing.push(ingredient);
    }
  }

  const requiredCount = recipe.ingredients.filter((i) => !i.optional).length;
  const matchedRequired = requiredCount - missing.length;
  const matchPercentage = requiredCount > 0 ? Math.round((matchedRequired / requiredCount) * 100) : 100;

  return {
    recipe,
    matchedIngredients: matched,
    missingIngredients: missing,
    matchPercentage,
    allAvailable: missing.length === 0,
  };
}

export function sortRecipeMatches(matches: RecipeMatch[]): RecipeMatch[] {
  return [...matches].sort((a, b) => {
    if (a.allAvailable && !b.allAvailable) return -1;
    if (!a.allAvailable && b.allAvailable) return 1;
    if (b.matchPercentage !== a.matchPercentage) return b.matchPercentage - a.matchPercentage;
    return a.missingIngredients.length - b.missingIngredients.length;
  });
}

/** Calculate subtraction for "Remove Used Ingredients" */
export function calculateSubtractions(
  recipe: Recipe,
  inventory: InventoryItem[]
): { itemId: string; newQuantity: number; originalUnit: UnitType }[] {
  const results: { itemId: string; newQuantity: number; originalUnit: UnitType }[] = [];

  for (const ingredient of recipe.ingredients) {
    const invMatch = inventory.find((item) => matchesIngredient(item.name, ingredient.name));
    if (!invMatch) continue;

    const recBase = toBase(ingredient.quantity, ingredient.unit);
    const invBase = toBase(invMatch.quantity, invMatch.unit);

    if (recBase.base !== invBase.base) continue; // Skip incompatible units

    const remaining = invBase.quantity - recBase.quantity;
    results.push({
      itemId: invMatch.id,
      newQuantity: fromBase(Math.max(0, remaining), invMatch.unit),
      originalUnit: invMatch.unit,
    });
  }

  return results;
}

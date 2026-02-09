import { Recipe } from '../types';

const SHARE_PREFIX = 'GRORECIPE:';

interface ShareableRecipe {
  n: string;       // name
  e: string;       // emoji
  d: string;       // description
  s: number;       // servings
  pt: number;      // prepTime
  ct: number;      // cookTime
  i: { n: string; q: number; u: string; o?: boolean }[]; // ingredients
  st: string[];    // steps
  t: string[];     // tags
  no?: string;     // notes
}

export function exportRecipe(recipe: Recipe): string {
  const compact: ShareableRecipe = {
    n: recipe.name,
    e: recipe.emoji,
    d: recipe.description,
    s: recipe.servings,
    pt: recipe.prepTime,
    ct: recipe.cookTime,
    i: recipe.ingredients.map((ing) => ({
      n: ing.name,
      q: ing.quantity,
      u: ing.unit,
      ...(ing.optional ? { o: true } : {}),
    })),
    st: recipe.instructions,
    t: recipe.tags,
    ...(recipe.notes ? { no: recipe.notes } : {}),
  };
  const json = JSON.stringify(compact);
  return SHARE_PREFIX + btoa(unescape(encodeURIComponent(json)));
}

export function importRecipe(code: string): Omit<Recipe, 'id' | 'source' | 'createdBy' | 'createdAt'> | null {
  try {
    const trimmed = code.trim();
    if (!trimmed.startsWith(SHARE_PREFIX)) return null;
    const base64 = trimmed.slice(SHARE_PREFIX.length);
    const json = decodeURIComponent(escape(atob(base64)));
    const data: ShareableRecipe = JSON.parse(json);

    if (!data.n || !data.i || !data.st || !Array.isArray(data.i) || !Array.isArray(data.st)) {
      return null;
    }

    return {
      name: data.n,
      emoji: data.e || '🍳',
      description: data.d || '',
      servings: data.s || 2,
      prepTime: data.pt || 0,
      cookTime: data.ct || 0,
      ingredients: data.i.map((ing) => ({
        name: ing.n,
        quantity: ing.q,
        unit: ing.u as Recipe['ingredients'][0]['unit'],
        ...(ing.o ? { optional: true } : {}),
      })),
      instructions: data.st,
      tags: (data.t || []) as Recipe['tags'],
      ...(data.no ? { notes: data.no } : {}),
    };
  } catch {
    return null;
  }
}

export async function shareRecipe(recipe: Recipe): Promise<'shared' | 'copied'> {
  const code = exportRecipe(recipe);

  if (navigator.share) {
    try {
      await navigator.share({
        title: `${recipe.emoji} ${recipe.name}`,
        text: `Check out this recipe for ${recipe.name}!\n\n${code}`,
      });
      return 'shared';
    } catch {
      // User cancelled or share failed — fall through to clipboard
    }
  }

  await navigator.clipboard.writeText(code);
  return 'copied';
}

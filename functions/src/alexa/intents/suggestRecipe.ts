import * as admin from 'firebase-admin';
import { speak, AlexaResponse } from '../../utils/response';

interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
  optional?: boolean;
}

interface RecipeScore {
  name: string;
  matchPercent: number;
  missingCount: number;
}

export async function handleSuggestRecipe(houseId: string): Promise<AlexaResponse> {
  // Get all recipes
  const recipesSnap = await admin.firestore()
    .collection(`houses/${houseId}/recipes`)
    .get();

  if (recipesSnap.empty) {
    return speak("You don't have any recipes saved yet.");
  }

  // Get all inventory items
  const inventorySnap = await admin.firestore()
    .collection(`houses/${houseId}/inventory`)
    .get();

  const inventoryNames = inventorySnap.docs.map(
    (doc) => doc.data().name.toLowerCase()
  );

  // Score each recipe by how many required ingredients are available
  const scores: RecipeScore[] = [];

  for (const doc of recipesSnap.docs) {
    const recipe = doc.data();
    const ingredients: RecipeIngredient[] = recipe.ingredients || [];
    const required = ingredients.filter((i) => !i.optional);

    if (required.length === 0) continue;

    let matched = 0;
    let missingCount = 0;

    for (const ing of required) {
      const ingName = ing.name.toLowerCase().trim();
      const found = inventoryNames.some(
        (inv) => inv === ingName || inv.includes(ingName) || ingName.includes(inv)
      );
      if (found) {
        matched++;
      } else {
        missingCount++;
      }
    }

    scores.push({
      name: recipe.name,
      matchPercent: (matched / required.length) * 100,
      missingCount,
    });
  }

  // Sort by best match (highest percentage, then fewest missing)
  scores.sort((a, b) => b.matchPercent - a.matchPercent || a.missingCount - b.missingCount);

  // Get top 3 that have at least some ingredients
  const suggestions = scores.filter((s) => s.matchPercent > 0).slice(0, 3);

  if (suggestions.length === 0) {
    return speak("I couldn't find any recipes matching what you have in stock.");
  }

  const lines = suggestions.map((s) => {
    if (s.missingCount === 0) {
      return `${s.name}, all ingredients ready`;
    }
    return `${s.name}, missing ${s.missingCount} item${s.missingCount !== 1 ? 's' : ''}`;
  });

  return speak(`Based on what you have, you could make: ${lines.join('. ')}.`);
}

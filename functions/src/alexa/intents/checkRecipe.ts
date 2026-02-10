import * as admin from 'firebase-admin';
import { speak, AlexaResponse } from '../../utils/response';

interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
  optional?: boolean;
}

export async function handleCheckRecipe(request: any, houseId: string, uid: string): Promise<AlexaResponse> {
  const recipeName = request.intent?.slots?.recipe?.value;

  if (!recipeName) {
    return speak('Which recipe would you like to check?');
  }

  const searchName = recipeName.toLowerCase().trim();

  // Find the recipe
  const recipesSnap = await admin.firestore()
    .collection(`houses/${houseId}/recipes`)
    .get();

  const recipeDoc = recipesSnap.docs.find(
    (doc) => doc.data().name.toLowerCase() === searchName
  ) || recipesSnap.docs.find(
    (doc) => doc.data().name.toLowerCase().includes(searchName) || searchName.includes(doc.data().name.toLowerCase())
  );

  if (!recipeDoc) {
    return speak(`I couldn't find a recipe called ${recipeName}.`);
  }

  const recipe = recipeDoc.data();
  const ingredients: RecipeIngredient[] = recipe.ingredients || [];

  // Get all inventory items
  const inventorySnap = await admin.firestore()
    .collection(`houses/${houseId}/inventory`)
    .get();

  const inventoryItems = inventorySnap.docs.map((doc) => doc.data());

  const missing: RecipeIngredient[] = [];

  for (const ing of ingredients) {
    if (ing.optional) continue;

    const ingName = ing.name.toLowerCase().trim();

    const match = inventoryItems.find(
      (item: any) => item.name.toLowerCase() === ingName
    ) || inventoryItems.find(
      (item: any) => item.name.toLowerCase().includes(ingName) || ingName.includes(item.name.toLowerCase())
    );

    if (!match || (match as any).quantity < ing.quantity) {
      missing.push(ing);
    }
  }

  if (missing.length === 0) {
    return speak(`All ingredients ready for ${recipe.name}!`);
  }

  const missingNames = missing.map((m) => m.name);
  const listText = missingNames.length <= 3
    ? missingNames.join(', ')
    : `${missingNames.slice(0, 3).join(', ')}, and ${missingNames.length - 3} more`;

  // Ask if they want to add missing items to shopping list
  // For now, auto-add to shopping list
  const shoppingRef = admin.firestore().collection(`houses/${houseId}/shoppingList`);

  for (const item of missing) {
    await shoppingRef.add({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      checked: false,
      addedBy: uid,
      addedAt: new Date().toISOString(),
    });
  }

  return speak(`Missing ${listText} for ${recipe.name}. I've added them to your shopping list.`);
}

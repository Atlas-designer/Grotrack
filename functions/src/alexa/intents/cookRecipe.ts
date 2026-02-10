import * as admin from 'firebase-admin';
import { speak, AlexaResponse } from '../../utils/response';

interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
  optional?: boolean;
}

export async function handleCookRecipe(request: any, houseId: string): Promise<AlexaResponse> {
  const recipeName = request.intent?.slots?.recipe?.value;

  if (!recipeName) {
    return speak('Which recipe are you making?');
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

  const inventoryItems = inventorySnap.docs.map((doc) => ({
    ref: doc.ref,
    ...doc.data(),
  }));

  const deducted: string[] = [];
  const notFound: string[] = [];

  for (const ing of ingredients) {
    if (ing.optional) continue;

    const ingName = ing.name.toLowerCase().trim();

    // Find matching inventory item
    const match = inventoryItems.find(
      (item: any) => item.name.toLowerCase() === ingName
    ) || inventoryItems.find(
      (item: any) => item.name.toLowerCase().includes(ingName) || ingName.includes(item.name.toLowerCase())
    );

    if (match) {
      const currentQty = (match as any).quantity || 1;
      const newQty = currentQty - ing.quantity;

      if (newQty <= 0) {
        await (match as any).ref.delete();
      } else {
        await (match as any).ref.update({ quantity: newQty });
      }
      deducted.push(ing.name);
    } else {
      notFound.push(ing.name);
    }
  }

  let response = `Removing ingredients for ${recipe.name}.`;
  if (deducted.length > 0) {
    response += ` Deducted ${deducted.length} item${deducted.length !== 1 ? 's' : ''}.`;
  }
  if (notFound.length > 0) {
    response += ` Couldn't find ${notFound.join(', ')} in your inventory.`;
  }

  return speak(response);
}

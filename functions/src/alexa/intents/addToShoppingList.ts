import * as admin from 'firebase-admin';
import { speak, AlexaResponse } from '../../utils/response';

export async function handleAddToShoppingList(request: any, houseId: string, uid: string): Promise<AlexaResponse> {
  const itemName = request.intent?.slots?.item?.value;
  if (!itemName) {
    return speak('What would you like to add to your shopping list?', false);
  }

  const name = itemName.charAt(0).toUpperCase() + itemName.slice(1).toLowerCase();

  await admin.firestore().collection(`houses/${houseId}/shoppingList`).add({
    name,
    checked: false,
    addedBy: uid,
    addedAt: new Date().toISOString(),
  });

  return speak(`Added ${name} to your shopping list.`);
}

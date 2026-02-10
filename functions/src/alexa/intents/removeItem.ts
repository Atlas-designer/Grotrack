import * as admin from 'firebase-admin';
import { speak, AlexaResponse } from '../../utils/response';
import { resolveCompartment } from '../../utils/compartments';
import { getSlotValue } from '../../utils/slots';

export async function handleRemoveItem(request: any, houseId: string): Promise<AlexaResponse> {
  const slots = request.intent?.slots || {};
  const itemName = slots.item?.value;
  const quantity = parseInt(slots.quantity?.value, 10) || 0;
  const compartmentSlot = getSlotValue(slots.compartment);

  if (!itemName) {
    return speak('What item would you like to remove?', false);
  }

  const searchName = itemName.toLowerCase().trim();
  const inventoryRef = admin.firestore().collection(`houses/${houseId}/inventory`);

  // If compartment specified, narrow search
  let query: admin.firestore.Query = inventoryRef;
  let displayCompartment = '';

  if (compartmentSlot) {
    const { id: compartmentId, name } = await resolveCompartment(houseId, compartmentSlot);
    query = query.where('compartment', '==', compartmentId);
    displayCompartment = ` from ${name}`;
  }

  const snapshot = await query.get();

  // Find matching item (case-insensitive)
  const match = snapshot.docs.find(
    (doc) => doc.data().name.toLowerCase() === searchName
  );

  if (!match) {
    return speak(`I couldn't find ${itemName}${displayCompartment}.`);
  }

  const matchData = match.data();
  const matchName = matchData.name;
  const currentQty = matchData.quantity || 1;

  // How much to remove: use spoken quantity, or default to all
  const removeQty = quantity > 0 ? quantity : currentQty;
  const remaining = currentQty - removeQty;

  if (remaining <= 0) {
    // Remove entirely
    await match.ref.delete();
    return speak(`Removed all ${matchName}${displayCompartment}.`);
  } else {
    // Decrement
    await match.ref.update({ quantity: remaining });
    return speak(`Removed ${removeQty} ${matchName}. You have ${remaining} left.`);
  }
}

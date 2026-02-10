import * as admin from 'firebase-admin';
import { speak, AlexaResponse } from '../../utils/response';
import { guessUnit } from '../../utils/guessUnit';
import { resolveCompartment } from '../../utils/compartments';
import { getSlotValue } from '../../utils/slots';

const EXPIRATION_DEFAULTS: Record<string, number> = {
  dairy: 10, meat: 4, produce: 7, frozen: 90, canned: 365,
  'dry-goods': 180, snacks: 60, beverages: 30, condiments: 60, other: 30,
};

function getExpiryDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export async function handleAddItem(request: any, houseId: string, uid: string): Promise<AlexaResponse> {
  const slots = request.intent?.slots || {};
  const itemName = slots.item?.value;
  const quantity = parseInt(slots.quantity?.value, 10) || 1;
  const compartmentSlot = getSlotValue(slots.compartment);

  console.log('AddItem slots:', JSON.stringify(slots));
  console.log('Resolved compartment slot:', compartmentSlot);

  if (!itemName) {
    return speak('What item would you like to add?', false);
  }

  const { id: compartmentId, name: displayName } = await resolveCompartment(houseId, compartmentSlot);
  const unit = guessUnit(itemName);
  const name = itemName.charAt(0).toUpperCase() + itemName.slice(1).toLowerCase();

  await admin.firestore().collection(`houses/${houseId}/inventory`).add({
    name,
    quantity,
    unit,
    compartment: compartmentId,
    category: 'other',
    purchaseDate: new Date().toISOString().split('T')[0],
    expirationDate: getExpiryDate(EXPIRATION_DEFAULTS.other),
    addedBy: uid,
  });

  const qtyText = quantity > 1 ? `${quantity} ${name}` : name;
  return speak(`Added ${qtyText} to ${displayName}.`);
}

import * as admin from 'firebase-admin';
import { speak, AlexaResponse } from '../../utils/response';

export async function handleCheckItem(request: any, houseId: string): Promise<AlexaResponse> {
  const itemName = request.intent?.slots?.item?.value;
  if (!itemName) {
    return speak('What item are you looking for?', false);
  }

  const normalised = itemName.toLowerCase().trim();

  // Fetch inventory
  const snapshot = await admin.firestore()
    .collection(`houses/${houseId}/inventory`)
    .get();

  if (snapshot.empty) {
    return speak('Your inventory is empty.');
  }

  // Exact match first
  let match = snapshot.docs.find((doc) => {
    const name = (doc.data().name || '').toLowerCase().trim();
    return name === normalised;
  });

  // Fuzzy fallback: contains or partial match (limit to first 100 docs)
  if (!match) {
    const docs = snapshot.docs.slice(0, 100);
    match = docs.find((doc) => {
      const name = (doc.data().name || '').toLowerCase().trim();
      return name.includes(normalised) || normalised.includes(name);
    });
  }

  if (!match) {
    return speak(`I couldn't find ${itemName} in your inventory.`);
  }

  const data = match.data();
  const qty = data.quantity || 1;
  const unit = data.unit || 'pieces';
  const compartment = (data.compartment || 'fridge').replace('-', ' ');

  // Format nicely
  const unitText = unit === 'pieces'
    ? (qty === 1 ? '' : ` ${qty}`)
    : ` ${qty} ${unit === 'g' ? 'grams' : unit === 'ml' ? 'millilitres' : unit === 'kg' ? 'kilograms' : unit === 'L' ? 'litres' : unit}`;

  if (unit === 'pieces') {
    return speak(`You have ${qty} ${data.name} in the ${compartment}.`);
  }
  return speak(`You have${unitText} of ${data.name} in the ${compartment}.`);
}

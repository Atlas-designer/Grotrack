import * as admin from 'firebase-admin';
import { speak, AlexaResponse } from '../../utils/response';

function resolveCompartmentId(slotValue: string | undefined): string {
  if (!slotValue) return 'fridge';
  const v = slotValue.toLowerCase().trim();
  const map: Record<string, string> = {
    fridge: 'fridge', refrigerator: 'fridge', 'the fridge': 'fridge',
    freezer: 'freezer', 'the freezer': 'freezer', 'ice box': 'freezer',
    pantry: 'pantry', cupboard: 'pantry', 'the pantry': 'pantry', 'the cupboard': 'pantry',
    snacks: 'snacks', 'snack drawer': 'snacks', 'snack cupboard': 'snacks',
    'dry ingredients': 'dry-ingredients', 'dry goods': 'dry-ingredients', 'baking cupboard': 'dry-ingredients',
    'wet ingredients': 'wet-ingredients', 'wet goods': 'wet-ingredients', liquids: 'wet-ingredients',
  };
  return map[v] || v;
}

export async function handleListCompartment(request: any, houseId: string): Promise<AlexaResponse> {
  const compartmentSlot = request.intent?.slots?.compartment?.resolutions?.resolutionsPerAuthority?.[0]?.values?.[0]?.value?.id
    || request.intent?.slots?.compartment?.value;

  const compartmentId = resolveCompartmentId(compartmentSlot);
  const displayName = compartmentId.replace('-', ' ');

  const snapshot = await admin.firestore()
    .collection(`houses/${houseId}/inventory`)
    .where('compartment', '==', compartmentId)
    .get();

  if (snapshot.empty) {
    return speak(`Your ${displayName} is empty.`);
  }

  // Get top 5 items
  const items = snapshot.docs.slice(0, 5).map((doc) => doc.data().name);
  const remaining = snapshot.docs.length - items.length;

  let text = `In your ${displayName}: ${items.join(', ')}`;
  if (remaining > 0) {
    text += `, and ${remaining} more item${remaining !== 1 ? 's' : ''}`;
  }
  text += '.';

  return speak(text);
}

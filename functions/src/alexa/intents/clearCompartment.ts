import * as admin from 'firebase-admin';
import { speak, AlexaResponse } from '../../utils/response';
import { resolveCompartment } from '../../utils/compartments';
import { getSlotValue } from '../../utils/slots';

export async function handleClearCompartment(request: any, houseId: string): Promise<AlexaResponse> {
  const compartmentSlot = getSlotValue(request.intent?.slots?.compartment);

  if (!compartmentSlot) {
    return speak('Which compartment would you like to clear?', false);
  }

  const { id: compartmentId, name: displayName } = await resolveCompartment(houseId, compartmentSlot);

  const snapshot = await admin.firestore()
    .collection(`houses/${houseId}/inventory`)
    .where('compartment', '==', compartmentId)
    .get();

  if (snapshot.empty) {
    return speak(`Your ${displayName} is already empty.`);
  }

  const batch = admin.firestore().batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();

  return speak(`Cleared ${snapshot.docs.length} item${snapshot.docs.length !== 1 ? 's' : ''} from your ${displayName}.`);
}

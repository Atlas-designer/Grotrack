import * as admin from 'firebase-admin';
import { speak, AlexaResponse } from '../../utils/response';

export async function handleWhatsExpiring(houseId: string): Promise<AlexaResponse> {
  const snapshot = await admin.firestore()
    .collection(`houses/${houseId}/inventory`)
    .get();

  if (snapshot.empty) {
    return speak('Your inventory is empty.');
  }

  const now = new Date();
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(now.getDate() + 3);

  const expiring = snapshot.docs
    .map((doc) => doc.data())
    .filter((item) => {
      if (!item.expirationDate) return false;
      const expDate = new Date(item.expirationDate);
      return expDate >= now && expDate <= threeDaysFromNow;
    })
    .map((item) => item.name);

  if (expiring.length === 0) {
    return speak('Nothing is expiring in the next 3 days.');
  }

  // Cap to top 5
  const shown = expiring.slice(0, 5);
  const remaining = expiring.length - shown.length;

  let text = `${expiring.length} item${expiring.length !== 1 ? 's' : ''} expiring soon: ${shown.join(', ')}`;
  if (remaining > 0) {
    text += `, and ${remaining} more`;
  }
  text += '.';

  return speak(text);
}

import * as admin from 'firebase-admin';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = 'Mo6KtYsQejwzE2ZtORAXbZqUYr3rG4_qT0tSam9Oy3yxQWSGy0D92V7Gjde5SEdz';

interface TokenPayload {
  sub: string; // Firebase UID
  iss: string;
  aud: string;
  scope: string;
  exp: number;
  iat: number;
}

/**
 * Verify the access token from an Alexa request and resolve the user's active house.
 * Returns { uid, houseId } or throws.
 */
export async function resolveHouse(accessToken: string): Promise<{ uid: string; houseId: string }> {
  // Verify and decode JWT
  const payload = jwt.verify(accessToken, JWT_SECRET) as TokenPayload;
  const uid = payload.sub;
  if (!uid) throw new Error('Invalid token: no sub');

  // Look up user's active house
  const userDoc = await admin.firestore().doc(`users/${uid}`).get();
  if (!userDoc.exists) throw new Error('User not found');

  const data = userDoc.data()!;
  const houseId = data.activeHouseId;
  if (!houseId) throw new Error('No active house selected');

  return { uid, houseId };
}

export function verifyAccessToken(accessToken: string): TokenPayload {
  return jwt.verify(accessToken, JWT_SECRET) as TokenPayload;
}

export function signAccessToken(uid: string, clientId: string): string {
  return jwt.sign(
    {
      sub: uid,
      iss: 'grotrack',
      aud: clientId,
      scope: 'inventory.read inventory.write list.write',
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

export { JWT_SECRET };

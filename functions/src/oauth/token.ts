import { Router } from 'express';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';
import { signAccessToken } from '../utils/resolveHouse';

const router = Router();

function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function base64urlEncode(buffer: Buffer): string {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * POST /token
 * Handles both authorization_code and refresh_token grant types.
 */
router.post('/token', async (req, res): Promise<void> => {
  try {
    const { grant_type, code, code_verifier, refresh_token, client_id, redirect_uri } = req.body;

    if (grant_type === 'authorization_code') {
      await handleAuthCodeGrant(res, code, code_verifier, client_id, redirect_uri);
    } else if (grant_type === 'refresh_token') {
      await handleRefreshGrant(res, refresh_token, client_id);
    } else {
      res.status(400).json({ error: 'unsupported_grant_type' });
    }
  } catch (err: any) {
    console.error('token error:', err);
    res.status(500).json({ error: 'server_error', error_description: err.message });
  }
});

async function handleAuthCodeGrant(
  res: any,
  code: string, codeVerifier: string | undefined,
  clientId: string, redirectUri: string
) {
  if (!code || !clientId) {
    return res.status(400).json({ error: 'invalid_request', error_description: 'Missing code or client_id' });
  }

  // Look up auth code
  const codeRef = admin.firestore().doc(`oauth_codes/${code}`);
  const codeDoc = await codeRef.get();
  if (!codeDoc.exists) {
    return res.status(400).json({ error: 'invalid_grant', error_description: 'Invalid authorization code' });
  }

  const codeData = codeDoc.data()!;

  // Delete code immediately (one-time use)
  await codeRef.delete();

  // Validate expiry
  if (Date.now() > codeData.expiresAt) {
    return res.status(400).json({ error: 'invalid_grant', error_description: 'Authorization code expired' });
  }

  // Validate client_id and redirect_uri match
  if (codeData.clientId !== clientId) {
    return res.status(400).json({ error: 'invalid_grant', error_description: 'client_id mismatch' });
  }
  if (redirectUri && codeData.redirectUri !== redirectUri) {
    return res.status(400).json({ error: 'invalid_grant', error_description: 'redirect_uri mismatch' });
  }

  // PKCE verification (if code_challenge was provided during authorize)
  if (codeData.codeChallenge) {
    if (!codeVerifier) {
      return res.status(400).json({ error: 'invalid_grant', error_description: 'Missing code_verifier' });
    }
    const method = codeData.codeChallengeMethod || 'S256';
    let expectedChallenge: string;
    if (method === 'S256') {
      expectedChallenge = base64urlEncode(crypto.createHash('sha256').update(codeVerifier).digest());
    } else {
      expectedChallenge = codeVerifier; // plain
    }
    if (expectedChallenge !== codeData.codeChallenge) {
      return res.status(400).json({ error: 'invalid_grant', error_description: 'PKCE verification failed' });
    }
  }

  // Mint tokens
  const uid = codeData.uid;
  const accessToken = signAccessToken(uid, clientId);
  const newRefreshToken = crypto.randomBytes(48).toString('hex');
  const refreshTokenHash = sha256(newRefreshToken);

  // Store refresh token hash
  await admin.firestore().doc(`oauth_refresh_tokens/${refreshTokenHash}`).set({
    uid,
    clientId,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  return res.json({
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: newRefreshToken,
  });
}

async function handleRefreshGrant(res: any, refreshToken: string, clientId: string) {
  if (!refreshToken) {
    return res.status(400).json({ error: 'invalid_request', error_description: 'Missing refresh_token' });
  }

  const tokenHash = sha256(refreshToken);
  const tokenRef = admin.firestore().doc(`oauth_refresh_tokens/${tokenHash}`);
  const tokenDoc = await tokenRef.get();

  if (!tokenDoc.exists) {
    return res.status(400).json({ error: 'invalid_grant', error_description: 'Invalid refresh token' });
  }

  const tokenData = tokenDoc.data()!;

  // Delete old refresh token (rotation)
  await tokenRef.delete();

  if (Date.now() > tokenData.expiresAt) {
    return res.status(400).json({ error: 'invalid_grant', error_description: 'Refresh token expired' });
  }

  // Mint new tokens
  const uid = tokenData.uid;
  const effectiveClientId = clientId || tokenData.clientId;
  const accessToken = signAccessToken(uid, effectiveClientId);
  const newRefreshToken = crypto.randomBytes(48).toString('hex');
  const newRefreshHash = sha256(newRefreshToken);

  await admin.firestore().doc(`oauth_refresh_tokens/${newRefreshHash}`).set({
    uid,
    clientId: effectiveClientId,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
  });

  return res.json({
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: newRefreshToken,
  });
}

export default router;

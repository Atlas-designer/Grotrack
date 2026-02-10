import { Router } from 'express';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

const router = Router();

// Strict allowlist: only Amazon's Alexa redirect URIs
const ALLOWED_CLIENTS: Record<string, { redirectUris: string[] }> = {
  'alexa-grotrack': {
    redirectUris: [
      'https://layla.amazon.com/api/skill/link/',
      'https://pitangui.amazon.com/api/skill/link/',
      'https://alexa.amazon.co.jp/api/skill/link/',
    ],
  },
};

function isValidRedirectUri(clientId: string, redirectUri: string): boolean {
  const client = ALLOWED_CLIENTS[clientId];
  if (!client) return false;
  // Amazon appends a unique ID to the redirect URI
  return client.redirectUris.some((allowed) => redirectUri.startsWith(allowed));
}

/**
 * GET /authorize
 * Renders the login page for OAuth2 account linking.
 * Alexa sends: client_id, redirect_uri, state, response_type, code_challenge, code_challenge_method
 */
router.get('/authorize', async (req, res): Promise<void> => {
  const { client_id, redirect_uri, state, response_type, code_challenge, code_challenge_method } = req.query as Record<string, string>;

  if (response_type !== 'code') {
    res.status(400).send('Unsupported response_type. Must be "code".');
    return;
  }
  if (!client_id || !redirect_uri || !state) {
    res.status(400).send('Missing required parameters.');
    return;
  }
  if (!isValidRedirectUri(client_id, redirect_uri)) {
    res.status(400).send('Invalid client_id or redirect_uri.');
    return;
  }

  // Store state in Firestore for CSRF validation (phase 1)
  await admin.firestore().doc(`oauth_states/${state}`).set({
    clientId: client_id,
    redirectUri: redirect_uri,
    codeChallenge: code_challenge || null,
    codeChallengeMethod: code_challenge_method || null,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  });

  // Render login page with Firebase Client SDK
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Link Grotrack to Alexa</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0e1a; color: #fff; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .card { background: #111827; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px; width: 100%; max-width: 380px; margin: 16px; }
    .logo { width: 48px; height: 48px; background: #a3e635; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-weight: bold; font-size: 20px; color: #0a0e1a; }
    h1 { text-align: center; font-size: 20px; margin-bottom: 4px; }
    .sub { text-align: center; color: #9ca3af; font-size: 13px; margin-bottom: 24px; }
    label { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; margin-bottom: 6px; }
    input { width: 100%; padding: 10px 14px; background: #1f2937; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff; font-size: 14px; outline: none; margin-bottom: 16px; }
    input:focus { border-color: rgba(163,230,53,0.5); }
    button { width: 100%; padding: 12px; background: #a3e635; color: #0a0e1a; font-weight: 600; font-size: 14px; border: none; border-radius: 10px; cursor: pointer; }
    button:disabled { opacity: 0.5; cursor: default; }
    .error { background: rgba(239,68,68,0.1); color: #f87171; padding: 8px 12px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; display: none; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">G</div>
    <h1>Link Grotrack</h1>
    <p class="sub">Sign in to connect your Grotrack account to Alexa</p>
    <div class="error" id="error"></div>
    <form id="loginForm">
      <label>Email</label>
      <input type="email" id="email" required autocomplete="email" />
      <label>Password</label>
      <input type="password" id="password" required autocomplete="current-password" />
      <button type="submit" id="btn">Sign In &amp; Link</button>
    </form>
  </div>

  <script type="module">
    import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js';
    import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js';

    const app = initializeApp({
      apiKey: "AIzaSyB8cfa0OiIXb78VwhWFVkNuwoMD-WQfWIg",
      authDomain: "grotrack-a854e.firebaseapp.com",
      projectId: "grotrack-a854e",
    });
    const auth = getAuth(app);

    const form = document.getElementById('loginForm');
    const errEl = document.getElementById('error');
    const btn = document.getElementById('btn');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errEl.style.display = 'none';
      btn.disabled = true;
      btn.textContent = 'Signing in...';

      try {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await cred.user.getIdToken();

        // POST the ID token to our callback endpoint
        const resp = await fetch('/api/authorize/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken, state: '${state}' }),
        });

        if (resp.redirected) {
          window.location.href = resp.url;
        } else {
          const data = await resp.json();
          if (data.redirectUrl) {
            window.location.href = data.redirectUrl;
          } else {
            throw new Error(data.error || 'Authorization failed');
          }
        }
      } catch (err) {
        errEl.textContent = err.code === 'auth/invalid-credential'
          ? 'Incorrect email or password'
          : (err.message || 'Something went wrong');
        errEl.style.display = 'block';
        btn.disabled = false;
        btn.textContent = 'Sign In & Link';
      }
    });
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

/**
 * POST /authorize/callback
 * Receives Firebase ID token + state, validates, issues auth code, returns redirect URL.
 */
router.post('/authorize/callback', async (req, res): Promise<void> => {
  try {
    const { idToken, state } = req.body;
    if (!idToken || !state) {
      res.status(400).json({ error: 'Missing idToken or state' });
      return;
    }

    // Phase 2: validate state (CSRF protection)
    const stateDoc = await admin.firestore().doc(`oauth_states/${state}`).get();
    if (!stateDoc.exists) {
      res.status(400).json({ error: 'Invalid or expired state' });
      return;
    }
    const stateData = stateDoc.data()!;
    if (Date.now() > stateData.expiresAt) {
      await admin.firestore().doc(`oauth_states/${state}`).delete();
      res.status(400).json({ error: 'State expired' });
      return;
    }

    // Delete state immediately (one-time use)
    await admin.firestore().doc(`oauth_states/${state}`).delete();

    // Validate client_id + redirect_uri from stored state
    const { clientId, redirectUri, codeChallenge, codeChallengeMethod } = stateData;
    if (!isValidRedirectUri(clientId, redirectUri)) {
      res.status(400).json({ error: 'Invalid redirect_uri' });
      return;
    }

    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Generate authorization code
    const code = crypto.randomBytes(32).toString('hex');

    // Store auth code in Firestore
    await admin.firestore().doc(`oauth_codes/${code}`).set({
      uid,
      clientId,
      redirectUri,
      codeChallenge: codeChallenge || null,
      codeChallengeMethod: codeChallengeMethod || null,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    // Build redirect URL
    const redirectUrl = `${redirectUri}${redirectUri.includes('?') ? '&' : '?'}code=${code}&state=${state}`;

    res.json({ redirectUrl });
  } catch (err: any) {
    console.error('authorize/callback error:', err);
    res.status(500).json({ error: err.message || 'Internal error' });
  }
});

export default router;

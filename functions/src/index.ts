import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import express from 'express';
import cors from 'cors';
import authorizeRouter from './oauth/authorize';
import tokenRouter from './oauth/token';
import { handleAlexaRequest } from './alexa/handler';

// Initialize Firebase Admin
admin.initializeApp();

const app = express();

// CORS for the authorize page
app.use(cors({ origin: true }));

// Parse JSON, preserving raw body for Alexa signature verification
app.use(express.json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf;
  },
}));

// Parse URL-encoded bodies (for OAuth token endpoint)
app.use(express.urlencoded({ extended: true }));

// OAuth2 routes
app.use('/', authorizeRouter);
app.use('/', tokenRouter);

// Alexa webhook
app.post('/alexa', handleAlexaRequest);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export as a single Cloud Function
export const api = functions.https.onRequest(app);

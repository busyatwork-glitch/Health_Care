import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import { env } from './config/env.js';
import { authRouter } from './routes/auth.js';
import { apiRouter } from './routes/platform.js';
import { errorHandler, notFound } from './middleware/errors.js';
import { database } from './db.js';
import type { NextFunction, Request, Response } from 'express';

export const app = express();
app.disable('x-powered-by');
app.set('trust proxy', env.NODE_ENV === 'production' ? 1 : false);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  }),
);
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '32kb' }));
app.use(cookieParser());
export function originGuard(req: Request, res: Response, next: NextFunction): void {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && req.path.startsWith('/api/')) {
    const origin = req.get('origin');
    const host = req.get('host');
    const isSameOrigin = Boolean(
      origin &&
      host &&
      !host.includes('/') &&
      (origin === `http://${host}` || origin === `https://${host}`),
    );
    if (!origin || (!isSameOrigin && !env.CLIENT_URL.includes(origin))) {
      res.status(403).json({ error: 'Origin is not allowed' });
      return;
    }
  }
  next();
}
app.use(originGuard);
export function healthStatus() {
  const connected = database.connected;
  return {
    statusCode: connected ? 200 : 503,
    body: {
      status: connected ? 'ok' : 'degraded',
      service: 'care-kind-api',
      database: connected ? 'connected' : 'disconnected',
      ai: env.GEMINI_API_KEY ? 'configured' : 'not configured',
      email: env.SMTP_USER && env.SMTP_PASS ? 'configured' : 'not configured',
    },
  };
}
app.get('/api/health', (_req, res) => {
  const health = healthStatus();
  res.status(health.statusCode).json(health.body);
});
app.use(
  '/api/auth',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: env.NODE_ENV === 'production' ? 30 : 100,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  }),
  authRouter,
);
app.use(
  '/api/ai',
  rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: env.NODE_ENV === 'production' ? 20 : 100,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  }),
  apiRouter,
);
app.use('/api', apiRouter);

const clientDist = fileURLToPath(new URL('../../client/dist', import.meta.url));
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { db } from '../db.js';

/* Express extends Request through declaration merging for the authenticated session. */
// eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: 'patient' | 'doctor' | 'hospital' | 'admin' };
    }
  }
}
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = req.cookies?.accessToken as string | undefined;
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as {
      sub: string;
      role: 'patient' | 'doctor' | 'hospital' | 'admin';
    };
    const [user] =
      await db()`select id, role, suspended from public.users where id = ${payload.sub}::uuid limit 1`;
    if (!user || user.suspended) {
      res.status(401).json({ error: 'Session is no longer valid' });
      return;
    }
    req.user = { id: user.id, role: user.role };
    next();
  } catch {
    res.status(401).json({ error: 'Session is invalid or expired' });
  }
}
export const requireRole =
  (...roles: Array<'patient' | 'doctor' | 'hospital' | 'admin'>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'You do not have access to this resource' });
      return;
    }
    next();
  };

import { randomBytes, createHash } from 'node:crypto';

// Shared authentication helpers retained at the former model import path while
// persistence now lives in Supabase Postgres.
export const hashSession = (token: string): string =>
  createHash('sha256').update(token).digest('hex');
export const makeRefreshToken = (): string => randomBytes(48).toString('base64url');

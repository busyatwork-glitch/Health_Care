import { z } from 'zod';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config({ path: fileURLToPath(new URL('../../../.env', import.meta.url)) });

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  CLIENT_URL: z.string().default('http://localhost:5173').transform((value) =>
    value.split(',').map((origin) => {
      let trimmed = origin.trim();
      if (!trimmed) return 'http://localhost:5173';
      if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) trimmed = `https://${trimmed}`;
      return trimmed.replace(/\/+$/, '');
    })
  ),
  SUPABASE_DB_URL: z.preprocess((value) => value === '' ? undefined : value, z.string().url().optional()),
  APP_TIME_ZONE: z.string().default('Asia/Kolkata'),
  JWT_SECRET: z.string().optional(),
  JWT_REFRESH_SECRET: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-flash-latest'),
  GEMINI_TIMEOUT_MS: z.coerce.number().int().min(1000).max(60000).default(60000),
  COOKIE_SECURE: z.string().default('false').transform((v) => v === 'true'),
  SEED_ADMIN_EMAIL: z.string().email().default('admin@example.test'),
  SEED_ADMIN_PASSWORD: z.string().min(12).default('development-only-change-this-password')
});
const configured = schema.parse(process.env);
// Appointment working hours are interpreted in one configured clinic timezone; database dates remain UTC.
process.env.TZ = configured.APP_TIME_ZONE;
const makeSecret = (value: string | undefined, name: string): string => {
  if (value && value.length >= 32 && !value.startsWith('replace-with-')) return value;
  if (configured.NODE_ENV === 'production') {
    console.warn(`[WARN] ${name} is missing or shorter than 32 characters in production. Generating secure ephemeral key. Set ${name} in Render Environment Variables to persist sessions across redeploys.`);
  }
  return randomBytes(48).toString('base64url');
};
export const env = { ...configured, JWT_SECRET: makeSecret(configured.JWT_SECRET, 'JWT_SECRET'), JWT_REFRESH_SECRET: makeSecret(configured.JWT_REFRESH_SECRET, 'JWT_REFRESH_SECRET') };

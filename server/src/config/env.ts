import { z } from 'zod';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config({ path: fileURLToPath(new URL('../../../.env', import.meta.url)) });

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  CLIENT_URL: z
    .string()
    .default('http://localhost:5173')
    .transform((value) =>
      value.split(',').map((origin) => {
        let trimmed = origin.trim();
        if (!trimmed) return 'http://localhost:5173';
        if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://'))
          trimmed = `https://${trimmed}`;
        return trimmed.replace(/\/+$/, '');
      }),
    ),
  SUPABASE_DB_URL: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.string().url().optional(),
  ),
  APP_TIME_ZONE: z.string().default('Asia/Kolkata'),
  JWT_SECRET: z.string().optional(),
  JWT_REFRESH_SECRET: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-flash-latest'),
  GEMINI_TIMEOUT_MS: z.coerce.number().int().min(1000).max(60000).default(60000),
  COOKIE_SECURE: z
    .string()
    .default('false')
    .transform((v) => v === 'true'),
  SEED_ADMIN_EMAIL: z.string().email().default('admin@example.test'),
  SEED_ADMIN_PASSWORD: z.string().min(12).default('development-only-change-this-password'),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(465),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
});
const configured = schema.parse(process.env);
// Appointment working hours are interpreted in one configured clinic timezone; database dates remain UTC.
process.env.TZ = configured.APP_TIME_ZONE;
const makeSecret = (value: string | undefined, name: string): string => {
  if (value && value.length >= 32 && !value.startsWith('replace-with-')) return value;
  if (configured.NODE_ENV === 'production') {
    console.warn(
      `[WARN] ${name} is missing or shorter than 32 characters in production. Generating secure ephemeral key. Set ${name} in Render Environment Variables to persist sessions across redeploys.`,
    );
  }
  return randomBytes(48).toString('base64url');
};
const rawSmtpUser =
  process.env.SMTP_USER ||
  process.env.EMAIL_USER ||
  process.env.GMAIL_USER ||
  process.env.MAIL_USER;
const rawSmtpPass =
  process.env.SMTP_PASS ||
  process.env.SMTP_PASSWORD ||
  process.env.EMAIL_PASS ||
  process.env.EMAIL_PASSWORD ||
  process.env.GMAIL_PASS ||
  process.env.GMAIL_APP_PASSWORD;
const rawSmtpHost =
  process.env.SMTP_HOST ||
  process.env.EMAIL_HOST ||
  process.env.MAIL_HOST;
const rawSmtpPort =
  process.env.SMTP_PORT ||
  process.env.EMAIL_PORT ||
  process.env.MAIL_PORT;
const rawSmtpFrom =
  process.env.SMTP_FROM ||
  process.env.EMAIL_FROM ||
  process.env.MAIL_FROM;

export const env = {
  ...configured,
  JWT_SECRET: makeSecret(configured.JWT_SECRET, 'JWT_SECRET'),
  JWT_REFRESH_SECRET: makeSecret(configured.JWT_REFRESH_SECRET, 'JWT_REFRESH_SECRET'),
  SMTP_USER: configured.SMTP_USER || rawSmtpUser,
  SMTP_PASS: configured.SMTP_PASS || rawSmtpPass,
  SMTP_HOST: configured.SMTP_HOST || rawSmtpHost,
  SMTP_PORT: configured.SMTP_PORT || (rawSmtpPort ? Number(rawSmtpPort) : 465),
  SMTP_FROM: configured.SMTP_FROM || rawSmtpFrom,
};

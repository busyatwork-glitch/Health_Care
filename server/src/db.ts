import postgres, { type Sql } from 'postgres';
import { env } from './config/env.js';

let client: Sql | undefined;
let connected = false;

export const database = {
  get connected(): boolean {
    return connected;
  },
  async connect(): Promise<void> {
    if (!env.SUPABASE_DB_URL) {
      console.warn(
        '[DATABASE] SUPABASE_DB_URL is missing. Please set SUPABASE_DB_URL in the Render dashboard under Environment Variables.',
      );
      connected = false;
      return;
    }
    try {
      client = postgres(env.SUPABASE_DB_URL, {
        ssl: 'require',
        max: 10,
        connect_timeout: 10,
        idle_timeout: 20,
        prepare: false,
        onnotice: () => undefined,
      });
      await client`select 1`;
      connected = true;
      console.log(JSON.stringify({ level: 'info', event: 'database_connected' }));
      await ensureSchema();
    } catch (error) {
      connected = false;
      console.error(
        JSON.stringify({
          level: 'error',
          event: 'database_connection_failed',
          message: error instanceof Error ? error.message : 'Database connection failed',
        }),
      );
    }
  },
  async close(): Promise<void> {
    connected = false;
    if (client) await client.end({ timeout: 5 });
    client = undefined;
  },
};

async function ensureSchema(): Promise<void> {
  if (!client) return;
  try {
    await client.unsafe(`
      do $$
      begin
        alter table public.users drop constraint if exists users_role_check;
        alter table public.users add constraint users_role_check check (role in ('patient','doctor','hospital','admin'));
      exception when others then
        null;
      end $$;
    `);
    await client.unsafe(`
      do $$
      begin
        alter table public.hospitals add column if not exists user_id uuid references public.users(id) on delete cascade;
        alter table public.hospitals add column if not exists verification text not null default 'approved' check (verification in ('pending','approved','rejected','suspended'));
        alter table public.hospitals add column if not exists phone text;
        create unique index if not exists hospitals_user_id_uq on public.hospitals(user_id) where user_id is not null;
      exception when others then
        null;
      end $$;
    `);
    await client.unsafe(`
      create table if not exists public.password_resets (
        id uuid primary key default gen_random_uuid(),
        email text not null,
        otp_hash text not null,
        expires_at timestamptz not null,
        attempts int default 0,
        created_at timestamptz default now()
      );
      create index if not exists idx_password_resets_email on public.password_resets(email);
    `);
  } catch (error) {
    console.warn(
      '[DATABASE] Schema alignment notice:',
      error instanceof Error ? error.message : 'schema check failed',
    );
  }
}

export function db(): Sql {
  if (!client || !connected) throw new Error('Database is not connected.');
  return client;
}

export function toApi<T>(value: T): T {
  if (Array.isArray(value)) return value.map((item) => toApi(item)) as T;
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const record = value as Record<string, unknown>;
    const converted: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(record)) {
      const camel = key.replace(/_([a-z])/g, (_, character: string) => character.toUpperCase());
      converted[camel] = toApi(item);
    }
    if (typeof record.id === 'string' && !('_id' in converted)) converted._id = record.id;
    return converted as T;
  }
  return value;
}

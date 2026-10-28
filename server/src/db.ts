import postgres, { type Sql } from 'postgres';
import { env } from './config/env.js';

let client: Sql | undefined;
let connected = false;

export const database = {
  get connected(): boolean { return connected; },
  async connect(): Promise<void> {
    if (!env.SUPABASE_DB_URL) throw new Error('SUPABASE_DB_URL is missing. Add the Supabase Postgres connection string to the project-root .env file.');
    client = postgres(env.SUPABASE_DB_URL, { ssl: 'require', max: 10, connect_timeout: 10, idle_timeout: 20, prepare: false, onnotice: () => undefined });
    await client`select 1`;
    connected = true;
  },
  async close(): Promise<void> {
    connected = false;
    if (client) await client.end({ timeout: 5 });
    client = undefined;
  },
};

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

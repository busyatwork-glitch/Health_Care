import postgres, { type Sql } from 'postgres';
import { env } from './config/env.js';

let client: Sql | undefined;
let connected = false;

export const database = {
  get connected(): boolean { return connected; },
  async connect(): Promise<void> {
    if (!env.SUPABASE_DB_URL) {
      console.warn('[DATABASE] SUPABASE_DB_URL is missing. Please set SUPABASE_DB_URL in the Render dashboard under Environment Variables.');
      connected = false;
      return;
    }
    try {
      client = postgres(env.SUPABASE_DB_URL, { ssl: 'require', max: 10, connect_timeout: 10, idle_timeout: 20, prepare: false, onnotice: () => undefined });
      await client`select 1`;
      connected = true;
      console.log(JSON.stringify({ level: 'info', event: 'database_connected' }));
    } catch (error) {
      connected = false;
      console.error(JSON.stringify({
        level: 'error',
        event: 'database_connection_failed',
        message: error instanceof Error ? error.message : 'Database connection failed'
      }));
    }
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

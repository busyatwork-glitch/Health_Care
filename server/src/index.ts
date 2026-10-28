import { app } from './app.js';
import { env } from './config/env.js';
import { database } from './db.js';

async function main(): Promise<void> {
  await database.connect();
  const server = app.listen(env.PORT, () => console.log(JSON.stringify({ level: 'info', event: 'server_started', port: env.PORT, environment: env.NODE_ENV })));
  const shutdown = (signal: string) => { console.log(JSON.stringify({ level: 'info', event: 'shutdown', signal })); server.close(() => { void database.close().finally(() => process.exit(0)); }); setTimeout(() => process.exit(1), 10000).unref(); };
  process.once('SIGINT', () => shutdown('SIGINT')); process.once('SIGTERM', () => shutdown('SIGTERM'));
}
main().catch(async (error: unknown) => { console.error(JSON.stringify({ level: 'fatal', message: error instanceof Error ? error.message : 'startup failed' })); await database.close().catch(() => undefined); process.exit(1); });

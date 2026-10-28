import { app } from './app.js';
import { env } from './config/env.js';
import { database } from './db.js';

async function main(): Promise<void> {
  const server = app.listen(env.PORT, '0.0.0.0', () => {
    console.log(
      JSON.stringify({
        level: 'info',
        event: 'server_started',
        port: env.PORT,
        environment: env.NODE_ENV,
      }),
    );
    console.log(
      JSON.stringify({
        level: 'info',
        event: 'email_service_status',
        configured: Boolean(env.SMTP_USER && env.SMTP_PASS),
        smtp_user_present: Boolean(env.SMTP_USER),
        smtp_pass_present: Boolean(env.SMTP_PASS),
        smtp_host: env.SMTP_HOST || 'smtp.gmail.com',
      }),
    );
  });
  const shutdown = (signal: string) => {
    console.log(JSON.stringify({ level: 'info', event: 'shutdown', signal }));
    server.close(() => {
      void database.close().finally(() => process.exit(0));
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
  await database.connect();
}
main().catch(async (error: unknown) => {
  console.error(
    JSON.stringify({
      level: 'fatal',
      message: error instanceof Error ? error.message : 'startup failed',
    }),
  );
  await database.close().catch(() => undefined);
  process.exit(1);
});

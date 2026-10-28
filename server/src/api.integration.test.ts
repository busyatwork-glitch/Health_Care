import { describe, expect, it } from 'vitest';
import supertest from 'supertest';
import { app } from './app.js';

const integration = process.env.RUN_HTTP_INTEGRATION === 'true' ? describe : describe.skip;
integration('Supertest HTTP integration (requires local socket permission)', () => {
  it('serves database-aware readiness', async () => {
    const response = await supertest(app).get('/api/health');
    expect([200, 503]).toContain(response.status);
    expect(response.body.service).toBe('care-kind-api');
  });
  it('rejects untrusted browser origins before authentication', async () => {
    const response = await supertest(app)
      .post('/api/auth/logout')
      .set('Origin', 'https://attacker.example');
    expect(response.status).toBe(403);
  });
});

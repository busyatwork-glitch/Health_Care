import { describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import { healthStatus, originGuard } from './app.js';

function responseMock() {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  return res;
}
describe('HTTP boundary helpers', () => {
  it('reports database state in readiness instead of claiming an offline database is healthy', () => {
    const health = healthStatus();
    expect(health.body.service).toBe('care-kind-api');
    expect(health.body.status).toBe('degraded');
    expect(health.statusCode).toBe(503);
  });
  it('rejects a missing or untrusted origin on cookie-authenticated mutations', () => {
    const req = {
      method: 'POST',
      path: '/api/auth/login',
      get: () => 'https://attacker.example',
    } as unknown as Request;
    const res = responseMock();
    const next = vi.fn();
    originGuard(req, res as unknown as Response, next as unknown as NextFunction);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
  it('allows a configured browser origin and does not gate read-only routes', () => {
    const trusted = {
      method: 'POST',
      path: '/api/auth/login',
      get: () => 'http://localhost:5173',
    } as unknown as Request;
    const next = vi.fn();
    originGuard(trusted, responseMock() as unknown as Response, next as unknown as NextFunction);
    expect(next).toHaveBeenCalledOnce();
    const readOnly = {
      method: 'GET',
      path: '/api/doctors',
      get: () => undefined,
    } as unknown as Request;
    const readNext = vi.fn();
    originGuard(
      readOnly,
      responseMock() as unknown as Response,
      readNext as unknown as NextFunction,
    );
    expect(readNext).toHaveBeenCalledOnce();
  });
});

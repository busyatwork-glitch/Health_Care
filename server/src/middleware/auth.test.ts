import { describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import { requireRole } from './auth.js';

describe('role authorization boundary', () => {
  it('denies a patient access to admin operations', () => {
    const req = { user: { id: 'patient-id', role: 'patient' } } as unknown as Request;
    const res = { status: vi.fn(), json: vi.fn() }; res.status.mockReturnValue(res);
    const next = vi.fn(); requireRole('admin')(req, res as unknown as Response, next as unknown as NextFunction);
    expect(res.status).toHaveBeenCalledWith(403); expect(next).not.toHaveBeenCalled();
  });
  it("continues when the user's role is allowed", () => {
    const req = { user: { id: 'doctor-id', role: 'doctor' } } as unknown as Request;
    const res = { status: vi.fn(), json: vi.fn() }; res.status.mockReturnValue(res);
    const next = vi.fn(); requireRole('doctor')(req, res as unknown as Response, next as unknown as NextFunction);
    expect(next).toHaveBeenCalledOnce(); expect(res.status).not.toHaveBeenCalled();
  });
});

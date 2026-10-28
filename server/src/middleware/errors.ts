import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export const notFound = (_req: Request, res: Response): void => {
  res.status(404).json({ error: 'Route not found' });
};
export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  void _next;
  if (error instanceof ZodError) {
    res.status(400).json({
      error: 'Request validation failed',
      issues: error.issues.map(({ path, message }) => ({ path: path.join('.'), message })),
    });
    return;
  }
  if (error instanceof ApiError) {
    res.status(error.status).json({ error: error.message });
    return;
  }
  if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
    res.status(409).json({ error: 'This item conflicts with an existing record' });
    return;
  }
  console.error(
    JSON.stringify({
      level: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }),
  );
  res.status(500).json({ error: 'An unexpected server error occurred' });
};

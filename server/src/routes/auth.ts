import { Router, type Response } from 'express';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { registerSchema } from '@care-kind/shared';
import { env } from '../config/env.js';
import { db, toApi } from '../db.js';
import { hashSession, makeRefreshToken } from '../models/index.js';
import { ApiError } from '../middleware/errors.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncRoute } from '../utils/async.js';

export const authRouter = Router();
const isSecure = env.COOKIE_SECURE || env.NODE_ENV === 'production';
const accessCookie = {
  httpOnly: true,
  secure: isSecure,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 15 * 60 * 1000,
};
const refreshCookie = { ...accessCookie, path: '/api/auth', maxAge: 7 * 24 * 60 * 60 * 1000 };
type Account = {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'hospital' | 'admin';
  phone?: string | null;
  suspended?: boolean;
  password_hash?: string;
  created_at?: Date;
};
function issueAccess(
  res: Response,
  user: { id: string; role: 'patient' | 'doctor' | 'hospital' | 'admin' },
): void {
  res.cookie(
    'accessToken',
    jwt.sign({ role: user.role }, env.JWT_SECRET, { subject: user.id, expiresIn: '15m' }),
    accessCookie,
  );
}
async function rotateRefresh(res: Response, userId: string): Promise<void> {
  const token = makeRefreshToken();
  await db()`insert into public.refresh_sessions (user_id, token_hash, expires_at) values (${userId}::uuid, ${hashSession(token)}, ${new Date(Date.now() + 7 * 86400000)})`;
  res.cookie('refreshToken', token, refreshCookie);
}

authRouter.post(
  '/register',
  asyncRoute(async (req, res) => {
    const input = registerSchema.parse(req.body);
    if (input.role === 'doctor' && (!input.specialty || !input.registrationNumber))
      throw new ApiError(
        400,
        'Doctor registration requires specialty and professional registration number',
      );
    if (input.role === 'hospital' && !input.name)
      throw new ApiError(400, 'Hospital registration requires hospital name');
    const email = input.email.toLowerCase();
    const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });
    const user = await db().begin(async (transaction) => {
      const [created] =
        await transaction`insert into public.users (name, email, phone, password_hash, role) values (${input.name}, ${email}, ${input.phone ?? null}, ${passwordHash}, ${input.role}) returning id, name, email, role`;
      if (!created) throw new Error('Account creation did not return a user row.');
      if (input.role === 'doctor') {
        await transaction`insert into public.doctor_profiles (user_id, specialty, qualifications, registration_number, years_experience, city, fee, verification) values (${created.id}::uuid, ${input.specialty!}, ${input.qualifications ?? []}, ${input.registrationNumber!}, ${input.yearsExperience ?? 0}, ${input.city ?? 'Demo City'}, ${input.fee ?? 0}, 'pending')`;
      }
      if (input.role === 'hospital') {
        await transaction`insert into public.hospitals (user_id, name, city, specialties, facilities, description, verification, demo, emergency_services_verified, phone) values (${created.id}::uuid, ${input.name}, ${input.city ?? 'Demo City'}, ${input.specialties ?? []}, ${input.facilities ?? []}, ${input.description ?? ''}, 'pending', false, false, ${input.phone ?? null})`;
      }
      return created as Account;
    });
    issueAccess(res, user);
    await rotateRefresh(res, user.id);
    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      verification: input.role === 'doctor' || input.role === 'hospital' ? 'pending' : undefined,
    });
  }),
);

authRouter.post(
  '/login',
  asyncRoute(async (req, res) => {
    const email = String(req.body.email ?? '').toLowerCase();
    const password = String(req.body.password ?? '');
    if (!email || !password) throw new ApiError(400, 'Email and password are required');
    const [found] =
      await db()`select id, name, email, role, password_hash, suspended from public.users where email = ${email} limit 1`;
    const user = found as Account | undefined;
    if (
      !user ||
      !user.password_hash ||
      !(await argon2.verify(user.password_hash, password)) ||
      user.suspended
    )
      throw new ApiError(401, 'Email or password is incorrect');
    issueAccess(res, user);
    await rotateRefresh(res, user.id);
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  }),
);

authRouter.post(
  '/refresh',
  asyncRoute(async (req, res) => {
    const token = req.cookies?.refreshToken as string | undefined;
    if (!token) throw new ApiError(401, 'Refresh session is missing');
    const session = await db().begin(async (transaction) => {
      const [found] =
        await transaction`delete from public.refresh_sessions where token_hash = ${hashSession(token)} and expires_at > now() returning user_id`;
      return found;
    });
    if (!session) throw new ApiError(401, 'Refresh session is invalid or expired');
    const [foundUser] =
      await db()`select id, name, email, role, suspended from public.users where id = ${session.user_id}::uuid limit 1`;
    const user = foundUser as Account | undefined;
    if (!user || user.suspended) throw new ApiError(401, 'Account is unavailable');
    issueAccess(res, user);
    await rotateRefresh(res, user.id);
    res.json({ ok: true });
  }),
);

authRouter.post(
  '/logout',
  asyncRoute(async (req, res) => {
    const token = req.cookies?.refreshToken as string | undefined;
    if (token)
      await db()`delete from public.refresh_sessions where token_hash = ${hashSession(token)}`;
    res.clearCookie('accessToken', { ...accessCookie, maxAge: undefined });
    res.clearCookie('refreshToken', { ...refreshCookie, maxAge: undefined });
    res.json({ ok: true });
  }),
);

authRouter.get(
  '/me',
  requireAuth,
  asyncRoute(async (req, res) => {
    const [user] =
      await db()`select id, name, email, role, phone, created_at from public.users where id = ${req.user!.id}::uuid limit 1`;
    const [doctor] =
      user?.role === 'doctor'
        ? await db()`select verification, specialty from public.doctor_profiles where user_id = ${req.user!.id}::uuid limit 1`
        : [];
    const [hospital] =
      user?.role === 'hospital'
        ? await db()`select id, name, city, specialties, facilities, description, verification, demo, emergency_services_verified, phone from public.hospitals where user_id = ${req.user!.id}::uuid limit 1`
        : [];
    res.json({
      user: toApi(user),
      doctor: toApi(doctor ?? null),
      hospital: toApi(hospital ?? null),
    });
  }),
);

authRouter.patch(
  '/account',
  requireAuth,
  asyncRoute(async (req, res) => {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : undefined;
    const phone =
      typeof req.body.phone === 'string' ? req.body.phone.trim().slice(0, 30) : undefined;
    if (!name && phone === undefined) throw new ApiError(400, 'Provide a name or phone number');
    const [user] =
      await db()`update public.users set name = coalesce(${name ?? null}, name), phone = case when ${phone !== undefined} then ${phone ?? null} else phone end, updated_at = now() where id = ${req.user!.id}::uuid returning id, name, email, role, phone`;
    res.json({ user: toApi(user) });
  }),
);

authRouter.delete(
  '/account',
  requireAuth,
  asyncRoute(async (req, res) => {
    await db().begin(async (transaction) => {
      await transaction`update public.appointments set status='cancelled', cancel_reason='Account deleted', updated_at=now() where patient_id=${req.user!.id}::uuid and status in ('pending','confirmed')`;
      await transaction`delete from public.users where id = ${req.user!.id}::uuid`;
    });
    res.clearCookie('accessToken', accessCookie);
    res.clearCookie('refreshToken', refreshCookie);
    res.json({ ok: true });
  }),
);

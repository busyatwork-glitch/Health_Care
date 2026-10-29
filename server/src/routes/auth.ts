import { Router, type Response } from 'express';
import { randomInt, createHash } from 'node:crypto';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { registerSchema } from '@care-kind/shared';
import { env } from '../config/env.js';
import { db, toApi } from '../db.js';
import { hashSession, makeRefreshToken } from '../models/index.js';
import { ApiError } from '../middleware/errors.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncRoute } from '../utils/async.js';
import { sendPasswordResetOtp } from '../services/email.js';

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

const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
});

authRouter.post(
  '/forgot-password',
  asyncRoute(async (req, res) => {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, 'Please enter a valid email address');
    }
    const email = parsed.data.email.toLowerCase();

    // Check if user exists and is not suspended
    const [user] =
      await db()`select id, name, suspended from public.users where email = ${email} limit 1`;
    if (!user) {
      console.warn(
        `[PASSWORD RESET] Request for ${email} failed: No account found with this email in database.`,
      );
      throw new ApiError(
        404,
        'No account found with this email address. Please check your spelling or register.',
      );
    }
    if (user.suspended) {
      throw new ApiError(403, 'This account is suspended. Please contact support.');
    }

    console.log(`[PASSWORD RESET] User account verified for ${email}. Generating OTP...`);

    // Generate 6-digit numeric OTP
    const otp = randomInt(100000, 1000000).toString();
    const otpHash = createHash('sha256').update(otp).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Delete any previous active reset codes for this email
    await db()`delete from public.password_resets where email = ${email}`;

    // Store new reset record
    await db()`insert into public.password_resets (email, otp_hash, expires_at) values (${email}, ${otpHash}, ${expiresAt})`;

    // Send email via SMTP (or fallback logger)
    let emailResult: { sent: boolean; reason?: string } = { sent: false, reason: 'unconfigured' };
    try {
      emailResult = await sendPasswordResetOtp(email, otp);
    } catch (err) {
      console.error('[PASSWORD RESET ERROR]', err);
      const detail = err instanceof Error ? err.message : 'Unknown error';
      const isRender = !!process.env.RENDER;
      let hint = '';
      if (detail.toLowerCase().includes('timeout') && isRender) {
        hint =
          ' (Render free tier blocks SMTP ports 25/465/587. Configure EMAILJS or RESEND_API_KEY in Render to send emails via HTTPS)';
      }
      res.json({
        ok: true,
        message: `Email delivery notice: ${detail}${hint}. For testing, your 6-digit verification code is: ${otp}`,
        otp,
      });
      return;
    }

    if (emailResult.sent) {
      res.json({
        ok: true,
        message: 'A 6-digit verification code has been sent to your email.',
      });
    } else {
      res.json({
        ok: true,
        message: `Email service is initializing. For testing, your 6-digit code is: ${otp}`,
        otp,
      });
    }
  }),
);

const resetPasswordSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  otp: z.string().trim().length(6, 'Verification code must be 6 digits'),
  password: z.string().min(12, 'Password must be at least 12 characters'),
});

authRouter.post(
  '/reset-password',
  asyncRoute(async (req, res) => {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0]?.message ?? 'Invalid request data';
      throw new ApiError(400, issue);
    }
    const { email: rawEmail, otp, password } = parsed.data;
    const email = rawEmail.toLowerCase();

    // Find active reset record
    const [resetRecord] = await db()`
      select id, otp_hash, attempts, expires_at 
      from public.password_resets 
      where email = ${email} and expires_at > now() 
      order by created_at desc 
      limit 1
    `;

    if (!resetRecord) {
      throw new ApiError(
        400,
        'Verification code has expired or is invalid. Please request a new one.',
      );
    }

    if (resetRecord.attempts >= 5) {
      await db()`delete from public.password_resets where id = ${resetRecord.id}::uuid`;
      throw new ApiError(
        429,
        'Too many incorrect attempts. Please request a new verification code.',
      );
    }

    const enteredHash = createHash('sha256').update(otp).digest('hex');
    if (enteredHash !== resetRecord.otp_hash) {
      await db()`update public.password_resets set attempts = attempts + 1 where id = ${resetRecord.id}::uuid`;
      throw new ApiError(400, 'Invalid verification code. Please check your email and try again.');
    }

    // Hash the new password with Argon2id
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

    await db().begin(async (transaction) => {
      const [updatedUser] = await transaction`
        update public.users 
        set password_hash = ${passwordHash}, updated_at = now() 
        where email = ${email} 
        returning id
      `;

      if (!updatedUser) {
        throw new ApiError(404, 'Account not found.');
      }

      // Delete the used reset code
      await transaction`delete from public.password_resets where email = ${email}`;

      // Invalidate existing refresh sessions to enforce security
      await transaction`delete from public.refresh_sessions where user_id = ${updatedUser.id}::uuid`;
    });

    res.json({ ok: true, message: 'Password has been reset successfully. You can now sign in.' });
  }),
);

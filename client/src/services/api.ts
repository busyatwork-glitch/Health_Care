import type { Assessment } from '@care-kind/shared';
const apiOrigin =
  typeof window !== 'undefined' && import.meta.env.DEV
    ? `${window.location.protocol}//${window.location.hostname}:4000`
    : '';
const base = import.meta.env.VITE_API_URL || `${apiOrigin}/api`;
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${base}${path}`, {
    ...init,
    credentials: 'include',
    headers: { ...(init.body ? { 'Content-Type': 'application/json' } : {}), ...init.headers },
  });
  if (response.status === 401 && !path.startsWith('/auth/')) {
    const refresh = await fetch(`${base}/auth/refresh`, { method: 'POST', credentials: 'include' });
    if (refresh.ok) return request<T>(path, init);
  }
  const data = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok)
    throw new ApiError(data.error ?? 'Something went wrong. Please try again.', response.status);
  return data as T;
}
export type User = {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'hospital' | 'admin';
  phone?: string;
};
export type DoctorCard = {
  _id: string;
  user?: { name: string };
  specialty: string;
  qualifications: string[];
  yearsExperience: number;
  city: string;
  fee: number;
  bio: string;
  demo: boolean;
  verification: string;
  consultationTypes: string[];
  review?: { average: number | null; count: number };
};
export type HospitalCard = {
  _id: string;
  name: string;
  city: string;
  specialties: string[];
  facilities: string[];
  description: string;
  demo: boolean;
  emergencyServicesVerified: boolean;
  verification?: string;
  phone?: string;
  user?: { id: string; name: string; email?: string };
};
export type ChatResult = {
  conversationId: string;
  title: string;
  message: { text: string };
  assessment: Assessment;
  demo: boolean;
  provider: string;
};
export async function me(): Promise<{
  user: User;
  doctor?: { verification: string };
  hospital?: HospitalCard;
}> {
  return request('/auth/me');
}
export async function login(email: string, password: string): Promise<{ user: User }> {
  return request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}
export async function register(input: Record<string, unknown>): Promise<{ user: User }> {
  return request('/auth/register', { method: 'POST', body: JSON.stringify(input) });
}
export async function logout(): Promise<void> {
  await request('/auth/logout', { method: 'POST' });
}
export async function chat(message: string, conversationId?: string): Promise<ChatResult> {
  return request('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message, ...(conversationId ? { conversationId } : {}) }),
  });
}
export async function forgotPassword(
  email: string,
): Promise<{ ok: boolean; message: string; otp?: string }> {
  return request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}
export async function resetPassword(payload: {
  email: string;
  otp: string;
  password: string;
}): Promise<{ ok: boolean; message: string }> {
  return request('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

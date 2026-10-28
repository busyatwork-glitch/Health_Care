-- Run this script in Supabase Dashboard > SQL Editor before starting the API.
-- The API connects with its private Postgres connection string; never put that
-- connection string in client/. RLS is enabled to deny direct anon/authenticated
-- table access. The trusted API connection performs authorization itself.

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null check (role in ('patient','doctor','hospital','admin')),
  phone text,
  suspended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.doctor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  specialty text not null,
  qualifications text[] not null default '{}',
  registration_number text,
  years_experience integer not null default 0,
  city text not null default 'Demo City',
  fee numeric(10,2) not null default 0,
  bio text not null default '',
  languages text[] not null default '{}',
  verification text not null default 'pending' check (verification in ('pending','approved','rejected','suspended')),
  demo boolean not null default false,
  consultation_types text[] not null default array['in-person'],
  working_days integer[] not null default array[1,2,3,4,5],
  start_hour integer not null default 9,
  end_hour integer not null default 17,
  slot_minutes integer not null default 30,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hospitals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.users(id) on delete cascade,
  name text not null,
  city text not null,
  specialties text[] not null default '{}',
  facilities text[] not null default '{}',
  description text not null default '',
  demo boolean not null default true,
  verification text not null default 'approved' check (verification in ('pending','approved','rejected','suspended')),
  phone text,
  emergency_services_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.users(id) on delete set null,
  doctor_id uuid references public.doctor_profiles(id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  consultation_type text not null check (consultation_type in ('in-person','online')),
  reason text not null,
  shared_summary text,
  status text not null default 'pending' check (status in ('pending','confirmed','completed','cancelled','rejected','no-show')),
  fee numeric(10,2) not null,
  reference text not null unique,
  cancel_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.availability (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctor_profiles(id) on delete cascade,
  date timestamptz not null,
  blocked boolean not null default false,
  start_hour integer,
  end_hour integer,
  break_start integer,
  break_end integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (doctor_id, date)
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.users(id) on delete cascade,
  title text not null default 'New health conversation' check (char_length(title) <= 120),
  summary text not null default '',
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  text text not null check (char_length(text) <= 5000),
  assessment jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.health_summaries (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.users(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  content text not null check (char_length(content) <= 3000),
  urgency text,
  specialties text[] not null default '{}',
  shared_appointment uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_items (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.users(id) on delete cascade,
  doctor_id uuid references public.doctor_profiles(id) on delete cascade,
  hospital_id uuid references public.hospitals(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((doctor_id is not null and hospital_id is null) or (doctor_id is null and hospital_id is not null))
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.users(id) on delete cascade,
  doctor_id uuid not null references public.doctor_profiles(id) on delete cascade,
  appointment_id uuid not null unique references public.appointments(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  text text not null default '' check (char_length(text) <= 1500),
  demo boolean not null default false,
  moderated boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.refresh_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor uuid references public.users(id) on delete set null,
  action text not null,
  target_type text,
  target_id text,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists appointments_active_doctor_slot_uq
  on public.appointments (doctor_id, starts_at)
  where status in ('pending','confirmed');
create unique index if not exists hospitals_name_uq on public.hospitals(name);
create unique index if not exists saved_doctor_uq on public.saved_items(patient_id, doctor_id) where doctor_id is not null;
create unique index if not exists saved_hospital_uq on public.saved_items(patient_id, hospital_id) where hospital_id is not null;
create index if not exists doctor_profiles_directory_idx on public.doctor_profiles(verification, specialty, city);
create index if not exists appointments_patient_idx on public.appointments(patient_id, starts_at desc);
create index if not exists appointments_doctor_idx on public.appointments(doctor_id, starts_at desc);
create index if not exists conversations_patient_activity_idx on public.conversations(patient_id, last_activity_at desc);
create index if not exists messages_conversation_created_idx on public.messages(conversation_id, created_at);
create index if not exists reviews_doctor_visible_idx on public.reviews(doctor_id, moderated, created_at desc);
create index if not exists refresh_sessions_expiry_idx on public.refresh_sessions(expires_at);

alter table public.users enable row level security;
alter table public.doctor_profiles enable row level security;
alter table public.hospitals enable row level security;
alter table public.appointments enable row level security;
alter table public.availability enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.health_summaries enable row level security;
alter table public.saved_items enable row level security;
alter table public.reviews enable row level security;
alter table public.refresh_sessions enable row level security;
alter table public.audit_logs enable row level security;

create table if not exists public.password_resets (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  otp_hash text not null,
  expires_at timestamptz not null,
  attempts int default 0,
  created_at timestamptz default now()
);
create index if not exists idx_password_resets_email on public.password_resets(email);
alter table public.password_resets enable row level security;

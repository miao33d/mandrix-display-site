-- ============================================================
-- Mandrix Bookings Table
-- Run this in Supabase → SQL Editor → New Query → Run
-- ============================================================

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz,

  -- Status
  status text not null default 'New',

  -- Student info
  full_name text not null,
  email text not null,
  contact text,
  country text,
  timezone text,
  level text,

  -- Course info
  course text,
  booking_type text,
  date text,
  time text,
  frequency text,
  frequency_label text,
  lesson_count integer,
  lesson_schedule jsonb not null default '[]'::jsonb,

  -- Payment
  payment text,
  amount text,
  paypal_link text,

  -- Goals & notes
  goal text,
  notes text,
  meeting_link text,
  teacher_notes text,
  group_info jsonb
);

-- Indexes for fast filtering
create index if not exists bookings_created_at_idx on bookings (created_at desc);
create index if not exists bookings_status_idx on bookings (status);
create index if not exists bookings_email_idx on bookings (email);
create index if not exists bookings_date_idx on bookings (date);

-- ============================================================
-- Analytics Events Table (also required)
-- ============================================================

create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id text,
  event_type text not null,
  path text,
  page_title text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  language text,
  timezone text,
  device text,
  browser text,
  os text,
  country text,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists analytics_events_created_at_idx on analytics_events (created_at desc);
create index if not exists analytics_events_event_type_idx on analytics_events (event_type);
create index if not exists analytics_events_session_id_idx on analytics_events (session_id);
create index if not exists analytics_events_path_idx on analytics_events (path);

-- ============================================================
-- Row Level Security (recommended)
-- Allow server-side service role key full access
-- ============================================================

alter table bookings enable row level security;
alter table analytics_events enable row level security;

-- Service role bypasses RLS automatically — no extra policy needed.
-- Public users cannot read/write directly.

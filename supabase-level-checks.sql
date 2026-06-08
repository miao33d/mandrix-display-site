-- ============================================================
-- Mandrix Free AI Level Checks
-- Run this in Supabase -> SQL Editor -> New Query -> Run
-- ============================================================

create table if not exists level_checks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz,

  status text not null default 'New',

  full_name text not null,
  email text not null,
  contact text,

  goal text,
  background text,
  confidence text,
  recognition text,
  word_order text,
  grammar text,
  scenario text,
  blocker text,
  sample text,

  report jsonb not null default '{}'::jsonb,
  teacher_notes text
);

create index if not exists level_checks_created_at_idx on level_checks (created_at desc);
create index if not exists level_checks_email_idx on level_checks (email);
create index if not exists level_checks_goal_idx on level_checks (goal);
create index if not exists level_checks_status_idx on level_checks (status);

alter table level_checks enable row level security;

-- Service role bypasses RLS automatically.
-- Public users never read or write this table directly; they submit through /api/level-check.js.

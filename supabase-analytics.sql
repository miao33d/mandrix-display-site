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

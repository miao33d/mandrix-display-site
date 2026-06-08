create table if not exists public.seo_pages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'published' check (status in ('published', 'draft')),
  category text not null,
  slug text not null,
  title text not null,
  description text not null,
  excerpt text,
  image text,
  image_alt text,
  payload jsonb not null default '{}'::jsonb,
  unique (category, slug)
);

create index if not exists seo_pages_status_updated_idx
  on public.seo_pages (status, updated_at desc);

create index if not exists seo_pages_category_updated_idx
  on public.seo_pages (category, updated_at desc);

alter table public.seo_pages enable row level security;

drop policy if exists "seo_pages_public_read_published" on public.seo_pages;
create policy "seo_pages_public_read_published"
  on public.seo_pages for select
  using (status = 'published');

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT,
  status TEXT,
  full_name TEXT,
  email TEXT,
  contact TEXT,
  country TEXT,
  timezone TEXT,
  level TEXT,
  course TEXT,
  booking_type TEXT,
  date TEXT,
  time TEXT,
  frequency TEXT,
  frequency_label TEXT,
  lesson_count INTEGER,
  lesson_schedule TEXT,
  payment TEXT,
  payment_provider TEXT,
  payment_reference TEXT,
  amount TEXT,
  goal TEXT,
  notes TEXT,
  meeting_link TEXT,
  teacher_notes TEXT
);

CREATE TABLE IF NOT EXISTS level_checks (
  id TEXT PRIMARY KEY,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  status TEXT,
  full_name TEXT,
  email TEXT,
  contact TEXT,
  goal TEXT,
  background TEXT,
  confidence TEXT,
  recognition TEXT,
  word_order TEXT,
  grammar TEXT,
  scenario TEXT,
  blocker TEXT,
  sample TEXT,
  report TEXT
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  event_type TEXT,
  path TEXT,
  page_title TEXT,
  referrer TEXT,
  session_id TEXT,
  metadata TEXT
);

CREATE TABLE IF NOT EXISTS payment_orders (
  id TEXT PRIMARY KEY,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  provider TEXT,
  order_id TEXT,
  email TEXT,
  amount TEXT,
  course TEXT,
  raw_payload TEXT,
  status TEXT
);

CREATE TABLE IF NOT EXISTS seo_pages (
  id TEXT PRIMARY KEY,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT,
  status TEXT,
  category TEXT,
  slug TEXT,
  title TEXT,
  description TEXT,
  excerpt TEXT,
  image TEXT,
  image_alt TEXT,
  payload TEXT,
  UNIQUE(category, slug)
);

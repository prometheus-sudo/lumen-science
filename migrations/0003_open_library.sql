create table if not exists paper_cache (
  cache_key text primary key,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists topic_lessons (
  id serial primary key,
  topic_slug text not null,
  topic text not null,
  field_slug text,
  learning_level text not null,
  region text not null,
  language_pref text not null,
  content text not null,
  papers jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (topic_slug, learning_level, region, language_pref)
);
create index if not exists topic_lessons_slug_idx on topic_lessons (topic_slug);

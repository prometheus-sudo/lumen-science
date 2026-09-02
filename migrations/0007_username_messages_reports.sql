-- Unique public usernames
alter table profiles
  add column if not exists username text;

create unique index if not exists profiles_username_unique
  on profiles (lower(username))
  where username is not null and username <> '';

create table if not exists teacher_messages (
  id serial primary key,
  thread_id text not null,
  field_slug text,
  concept_id text,
  from_user_id text not null,
  to_user_id text not null,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists teacher_messages_thread_idx on teacher_messages (thread_id, created_at);
create index if not exists teacher_messages_to_idx on teacher_messages (to_user_id, created_at);

create table if not exists content_reports (
  id serial primary key,
  reporter_user_id text not null,
  field_slug text not null,
  concept_id text not null,
  teacher_lesson_id integer,
  reason text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);
create index if not exists content_reports_status_idx on content_reports (status, created_at desc);

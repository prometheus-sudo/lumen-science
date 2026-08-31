-- Teacher role on profiles + teacher-authored lessons

alter table profiles
  add column if not exists account_role text not null default 'student';

create table if not exists teacher_lessons (
  id serial primary key,
  author_id text not null,
  field_slug text not null,
  module_name text not null default 'Teacher lessons',
  concept_id text not null,
  title text not null,
  why_it_matters text not null default '',
  body text not null,
  key_ideas jsonb not null default '[]'::jsonb,
  objectives jsonb not null default '[]'::jsonb,
  terms jsonb not null default '[]'::jsonb,
  check_questions jsonb not null default '[]'::jsonb,
  pitfalls jsonb not null default '[]'::jsonb,
  minutes integer not null default 25,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (field_slug, concept_id)
);

create index if not exists teacher_lessons_field_idx on teacher_lessons (field_slug);
create index if not exists teacher_lessons_author_idx on teacher_lessons (author_id);

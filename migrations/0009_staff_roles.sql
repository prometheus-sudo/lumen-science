-- Staff roles, one-use invite links, moderator field scopes

alter table profiles
  add column if not exists staff_role text not null default 'none';
-- none | moderator | admin

alter table profiles
  add column if not exists moderator_fields text[] not null default '{}';

create table if not exists staff_invite_tokens (
  token text primary key,
  email text not null,
  staff_role text not null check (staff_role in ('moderator', 'admin')),
  moderator_fields text[] not null default '{}',
  created_by text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz,
  used_by_user_id text
);

create index if not exists staff_invite_unused_idx
  on staff_invite_tokens (email) where used_at is null;

alter table content_reports
  add column if not exists status text not null default 'open';
alter table content_reports
  add column if not exists handled_by text;
alter table content_reports
  add column if not exists handled_at timestamptz;
alter table content_reports
  add column if not exists handler_note text not null default '';

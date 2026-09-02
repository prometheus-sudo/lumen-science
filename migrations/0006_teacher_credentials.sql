-- Teacher credential verification before full teach access
alter table profiles
  add column if not exists teacher_credential_status text not null default 'none';

alter table profiles
  add column if not exists teacher_credential_note text not null default '';

alter table profiles
  add column if not exists teacher_institution text not null default '';

alter table profiles
  add column if not exists teacher_qualification text not null default '';

alter table profiles
  add column if not exists teacher_credential_submitted_at timestamptz;

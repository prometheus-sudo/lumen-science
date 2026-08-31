-- Fact-check + AI integration fields for teacher lessons

alter table teacher_lessons
  add column if not exists fact_check_status text not null default 'unchecked';

alter table teacher_lessons
  add column if not exists fact_check_report jsonb not null default '{}'::jsonb;

alter table teacher_lessons
  add column if not exists fact_check_score integer;

alter table teacher_lessons
  add column if not exists integrated_body text;

alter table teacher_lessons
  add column if not exists integrated_at timestamptz;

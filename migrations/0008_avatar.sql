-- Profile picture preset key (no binary uploads)
alter table profiles
  add column if not exists avatar_key text;

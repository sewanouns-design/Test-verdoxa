-- Server-authoritative quiz sessions.
-- Run after 002_public_content.sql.
create table if not exists fbi_quiz_sessions (
  id uuid primary key default gen_random_uuid(),
  student_name text not null,
  student_key text not null,
  reset_version int not null default 1,
  current_level int not null default 1,
  score int not null default 0,
  correct_count int not null default 0,
  total_answered int not null default 0,
  status text not null default 'active' check (status in ('active','completed','expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);
create index if not exists fbi_quiz_sessions_student_idx on fbi_quiz_sessions(student_key);
create index if not exists fbi_quiz_sessions_expires_idx on fbi_quiz_sessions(expires_at);

create table if not exists fbi_quiz_session_questions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references fbi_quiz_sessions(id) on delete cascade,
  question_id text not null,
  level int not null,
  presented_options jsonb not null,
  correct_option int not null,
  points int not null default 0,
  verse_reference text not null default '',
  explanation text not null default '',
  answered boolean not null default false,
  correct boolean,
  timed_out boolean not null default false,
  answered_at timestamptz,
  created_at timestamptz not null default now(),
  unique(session_id, question_id)
);
create index if not exists fbi_quiz_session_questions_session_idx on fbi_quiz_session_questions(session_id, level);

alter table fbi_quiz_sessions enable row level security;
alter table fbi_quiz_session_questions enable row level security;

-- Keep timestamps correct when rows are updated directly from the server.
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists fbi_quiz_sessions_updated_at on fbi_quiz_sessions;
create trigger fbi_quiz_sessions_updated_at before update on fbi_quiz_sessions
for each row execute function set_updated_at();

drop trigger if exists fbi_scores_updated_at on fbi_scores;
create trigger fbi_scores_updated_at before update on fbi_scores
for each row execute function set_updated_at();

drop trigger if exists fbi_questions_updated_at on fbi_questions;
create trigger fbi_questions_updated_at before update on fbi_questions
for each row execute function set_updated_at();

-- Préparation de la persistance des fonctionnalités spirituelles Verdoxa.
-- Le MVP actuel fonctionne immédiatement en localStorage ; cette migration
-- permet d’activer la synchronisation lorsque l’authentification utilisateur
-- sera ajoutée.
create table if not exists verdoxa_profiles (
  id uuid primary key default gen_random_uuid(),
  student_name text not null,
  xp int not null default 0,
  current_streak int not null default 0,
  best_streak int not null default 0,
  reminders_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists verdoxa_saved_verses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references verdoxa_profiles(id) on delete cascade,
  verse_reference text not null,
  created_at timestamptz not null default now(),
  unique(profile_id, verse_reference)
);

create table if not exists verdoxa_journal_entries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references verdoxa_profiles(id) on delete cascade,
  entry_date date not null default current_date,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(profile_id, entry_date)
);

create table if not exists verdoxa_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique,
  created_by uuid references verdoxa_profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table verdoxa_profiles enable row level security;
alter table verdoxa_saved_verses enable row level security;
alter table verdoxa_journal_entries enable row level security;
alter table verdoxa_groups enable row level security;

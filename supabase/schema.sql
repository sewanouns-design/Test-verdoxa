-- Schema Supabase pour Verdoxa (v1 -- moteur du test de connaissance
-- biblique public, a difficulte croissante, avec classement).
-- A executer une seule fois dans un projet Supabase DEDIE a Verdoxa
-- (Supabase > SQL Editor > New query > Run).
--
-- Les recompenses (catalogue de lots, attribution aux gagnants) ne
-- sont pas encore incluses ici : elles arriveront dans une migration
-- separee une fois cette base validee (etape 5 du plan).

-- Apparence generale du site (nom, logo, couleurs)
create table if not exists settings (
  id int primary key default 1,
  site_name text not null default 'Verdoxa',
  logo_url text,
  primary_color text not null default '#1e2a5e',
  secondary_color text not null default '#c23b3b',
  constraint settings_single_row check (id = 1)
);
insert into settings (id) values (1) on conflict (id) do nothing;

-- Reglages du test : titre public, activation, duree et bareme par
-- niveau de difficulte
create table if not exists fbi_settings (
  id int primary key default 1 check (id = 1),
  title text not null default 'Verdoxa',
  subtitle text not null default 'Grandis dans la connaissance de la Parole, un defi a la fois.',
  intro_text text not null default 'Ouvert a tous, gratuit, sans inscription. Indique juste ton nom et releve le defi.',
  is_active boolean not null default true,
  questions_per_level int not null default 8,
  easy_seconds int not null default 45,
  medium_seconds int not null default 90,
  hard_seconds int not null default 135,
  expert_seconds int not null default 180,
  easy_points int not null default 10,
  medium_points int not null default 15,
  hard_points int not null default 20,
  expert_points int not null default 25,
  reset_version int not null default 1,
  updated_at timestamptz not null default now()
);
insert into fbi_settings (id) values (1) on conflict (id) do nothing;

-- Banque de questions (modifiable depuis /admin). Si cette table est
-- vide, l'API la remplit automatiquement au premier chargement a
-- partir de lib/infiniteQuestions.ts (banque de depart verifiee a la
-- main).
create table if not exists fbi_questions (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  difficulty text not null check (difficulty in ('facile','moyen','difficile','expert')),
  theme text not null default 'Bible',
  text text not null,
  options jsonb not null,
  correct_option int not null,
  verse_reference text not null default '',
  explanation text not null default '',
  points int not null default 10,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Classement public : meilleure performance par participant (nom
-- unique, insensible a la casse/aux espaces). Coordonnees facultatives
-- pour permettre de recompenser/contacter les premiers, jamais requises
-- pour participer.
create table if not exists fbi_scores (
  id uuid primary key default gen_random_uuid(),
  student_name text not null,
  best_level int not null default 1,
  best_score int not null default 0,
  best_correct int not null default 0,
  best_total int not null default 0,
  contact_email text,
  whatsapp text,
  contact_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists fbi_scores_name_key
  on fbi_scores (lower(trim(student_name)));
create index if not exists fbi_scores_ranking_idx
  on fbi_scores (best_level desc, best_score desc);

-- Anti-repetition : questions deja vues par participant, independant
-- des remises a zero du classement.
create table if not exists fbi_played_questions (
  student_key text not null,
  question_id text not null,
  played_at timestamptz not null default now(),
  primary key (student_key, question_id)
);
create index if not exists fbi_played_questions_student_idx
  on fbi_played_questions (student_key);

alter table settings enable row level security;
alter table fbi_settings enable row level security;
alter table fbi_questions enable row level security;
alter table fbi_scores enable row level security;
alter table fbi_played_questions enable row level security;

-- Toutes les lectures/ecritures passent par le serveur (route handlers
-- Next.js) avec la cle "service role", qui contourne RLS. Aucune
-- policy publique n'est donc necessaire ici : le navigateur ne parle
-- jamais directement a Supabase.

# Verdoxa

Plateforme de quiz bibliques et de progression spirituelle. Verdoxa aide chacun à grandir dans la connaissance de la Parole grâce à des défis, des parcours et des repères de progression.

## Fonctionnalités intégrées

L’espace `/parcours` rassemble un MVP local immédiatement utilisable : verset du jour avec sauvegarde, partage et lecture audio, série de régularité, défi hebdomadaire sur 7 jours, XP et niveaux, badges, journal spirituel privé, rappels optionnels, mode texte agrandi, mode sombre, partage avec un proche et accès au classement public. Le moteur `/jouer` conserve ses niveaux, son chronomètre, ses explications et ses références bibliques.

Les données de l’espace personnel sont stockées localement sur l’appareil pour fonctionner sans inscription. La migration `supabase/migrations/001_spiritual_features.sql`, `002_public_content.sql`, puis `003_quiz_security.sql` prépare la synchronisation future des profils, versets, journaux et groupes lorsque l’authentification sera activée.

## Stack

- [Next.js 14](https://nextjs.org/) (App Router) + TypeScript
- [Supabase](https://supabase.com/) (base de données + clé service role)
- Déploiement prévu sur [Vercel](https://vercel.com/)

## Démarrage local

1. `npm install`
2. Copier `.env.example` en `.env.local` et renseigner `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` et `ADMIN_PASSWORD`.
3. Exécuter `supabase/schema.sql` puis, si la persistance des fonctionnalités est souhaitée, `supabase/migrations/001_spiritual_features.sql`, `002_public_content.sql`, puis `003_quiz_security.sql` dans Supabase.
4. `npm run dev` puis ouvrir `http://localhost:3000`.

## Routes principales

- `/` — accueil Verdoxa
- `/jouer` — quiz biblique, niveaux, chronomètre, scores et explications
- `/parcours` — espace personnel spirituel et gamification
- `/jouer/classement` — classement public
- `/admin` — administration
- `/admin/dashboard` — questions, réglages et classement


### Migrations Supabase

Après `supabase/schema.sql`, exécuter dans l’ordre `supabase/migrations/001_spiritual_features.sql`, `002_public_content.sql`, puis `003_quiz_security.sql`. La dernière migration ajoute les sessions de quiz autoritaires côté serveur et les garde-fous nécessaires au classement.

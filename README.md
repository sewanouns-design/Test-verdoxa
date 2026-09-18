# Vedoxa

Test public de connaissance biblique, a difficulte croissante (facile
-> moyen -> difficile -> expert), avec classement. Ouvert a tous, sans
inscription -- juste un nom pour participer.

Ce depot est le point de depart technique du projet : le moteur du
test (questions, niveaux, chronometre, score, classement, image de
partage) est deja fonctionnel. Le catalogue de recompenses viendra
dans une prochaine etape.

## Stack

- [Next.js 14](https://nextjs.org/) (App Router) + TypeScript
- [Supabase](https://supabase.com/) (base de donnees + cle service role)
- Deploiement prevu sur [Vercel](https://vercel.com/), domaine `vedoxa.org`

## Demarrage local

1. `npm install`
2. Copier `.env.example` en `.env.local` et renseigner :
   - `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` (Supabase > Project Settings > API)
   - `ADMIN_PASSWORD` (mot de passe de l'espace `/admin`)
3. Executer `supabase/schema.sql` dans Supabase > SQL Editor (une seule fois)
4. `npm run dev` puis ouvrir http://localhost:3000

## Structure

- `/` -- page d'accueil du test public
- `/jouer` -- le quiz lui-meme (niveaux, chronometre, score)
- `/jouer/classement` -- classement public
- `/admin` -- connexion administrateur
- `/admin/dashboard` -- gestion des questions, des reglages et du classement
- `lib/infiniteQuestions.ts` -- banque de questions de depart (utilisee
  pour remplir la base au premier lancement)
- `supabase/schema.sql` -- schema complet de la base

## Prochaines etapes

1. Deployer sur Vercel et connecter le domaine `vedoxa.org`
2. Ajouter le catalogue de recompenses (lots, seuils d'eligibilite,
   attribution aux gagnants)
3. Etoffer la banque de questions par niveau

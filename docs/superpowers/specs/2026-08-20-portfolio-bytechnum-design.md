# Portfolio ByTechnum — design

- **Date** : 2026-08-20
- **Sous-domaine cible** : `moi.bytechnum.com`
- **Hébergement** : Spaceship (cPanel), même compte que `bytechnum.com`
- **Entrée du process** : dossier de recherche GitHub/web préalable (voir conversation du 2026-08-20 — 35 dépôts audités, présence en ligne cartographiée)

## Contexte

Elisée Magloire Atonde développe sous la marque **ByTechnum** (« la technologie à votre portée »). Le domaine `bytechnum.com` est déjà réservé sur Spaceship et héberge deux produits en sous-domaine (`oeil360finance.`, `disoui.`), mais la page racine reste une landing « bientôt disponible ». En dehors de GitHub, aucune trace publique indexée du nom ou de la marque n'existe : ce portfolio sera le premier point d'entrée public réel.

Trois tentatives de portfolio antérieures existent sur GitHub (`eliseeatonde`, `portfolio-website`, `portfolio-moderne`) — aucune n'a été déployée. Ce projet les remplace.

## Objectifs & contraintes validés

| Décision | Choix retenu |
|---|---|
| Public cible | Double : clients directs (mandats ByTechnum) **et** recruteurs |
| Langue | Bilingue FR/EN (contenu source actuel 100% FR) |
| Citation nommée des clients privés | Cas par cas, décidé projet par projet à la rédaction |
| Statut affiché | Freelance/ByTechnum à temps plein, disponible — CTA de contact actif |
| Structure de contenu | Multi-pages avec études de cas dédiées (pas de one-page, pas de modals) |
| Sous-domaine | `moi.bytechnum.com` |

## Architecture

```
moi.bytechnum.com/           → Next.js (App Router), export statique — React 19 + TypeScript + Tailwind
moi.bytechnum.com/api/*      → Laravel — API + admin Filament, MySQL
```

- Le contenu (projets, études de cas, témoignages, réglages) vit en base MySQL, géré via un admin **Filament** sur Laravel.
- Next.js consomme cette API **au moment du build** (`generateStaticParams` + fetch) et produit des pages HTML statiques par route — les études de cas sont de vraies pages indexables, pas du contenu chargé côté client après coup.
- Les deux applications tournent sur le même hébergement Spaceship (cPanel), cohérent avec la contrainte « léger, optimal, déployable sur Spaceship, capable de gérer un backend ».
- Convention de dépôt : un seul repo avec `backend/` (Laravel) et `frontend/` (Next.js), comme sur le dépôt `where` existant de l'auteur.

### Pourquoi ce choix plutôt que Next.js/Vercel seul ou Laravel/Blade seul

- Un Next.js + Vercel pur aurait été plus simple côté frontend mais n'aurait pas donné le « vrai backend » demandé (CRUD contenu, boîte de contact, réglages) sans dépendance externe.
- Un Laravel/Blade pur (sans découplage) aurait été le choix le plus naturel pour Spaceship/cPanel, mais l'utilisateur a explicitement demandé une séparation API/frontend.
- Le découplage retenu garde le meilleur des deux : backend Laravel natif à l'hébergement et à l'expertise la plus profonde de l'auteur, frontend React/Next cohérent avec ses projets les plus récents et les mieux finis (Dis_oui, where, cpdi-inji-poc), le tout servi en statique donc aussi léger et rapide qu'un site Blade classique.

## Plan du site

FR par défaut à la racine, miroir anglais sous `/en/...`.

| Route | Contenu |
|---|---|
| `/` | Hero, bande de compétences, grille des projets phares, aperçu méthode, CTA disponibilité |
| `/services` | Prestations ByTechnum — contenu géré dans le code (voir plus bas), pas en base |
| `/projets` | Index complet des projets présentables (produits ByTechnum + mandats clients sélectionnés) |
| `/projets/[slug]` | Étude de cas : contexte, problème, décisions techniques, captures, résultat, lien démo |
| `/a-propos` | Parcours, méthode (conformité APDP, cryptographie appliquée, workflow par PR, CI), photo |
| `/contact` | Formulaire de contact — seule partie interactive du site |

`/services` reste géré dans le code (fichiers de traduction / composants) plutôt qu'en base : les prestations ByTechnum changent rarement, contrairement aux projets, et ça évite d'alourdir l'admin pour du contenu quasi-statique.

## Modèle de contenu (Laravel / Filament)

### Project
- `slug`, `title` (fr/en), `tagline` (fr/en), `summary` (fr/en — pour les cartes), `body` (fr/en — contexte / problème / décisions techniques / résultat)
- `category` : `produit_bytechnum` \| `mandat_client`
- `client_name` (nullable), `client_display` (bool — bascule « afficher publiquement », gère le cas par cas déjà décidé)
- `stack` (tags), `role`, `screenshots` (media), `live_url` (nullable), `repo_url` (nullable, uniquement si dépôt public)
- `featured` (bool — apparaît sur `/`), `status` : `brouillon` \| `publié`

### Testimonial
- `author_name`, `author_role`, `author_company` (nullable — même logique d'anonymisation que `client_display`)
- `quote` (fr/en), `project_id` (nullable), `visible` (bool)

### ContactMessage
- `name`, `email`, `message`, `project_interest` (nullable), `locale`, `created_at`, `read` (bool), `replied` (bool)
- Boîte de réception simple dans l'admin + notification email via Laravel Mail

### Setting (singleton)
- `available_for_work` (bool) — pilote le CTA de disponibilité sur `/` sans toucher au code

### Garde-fou de contenu
Le build Next.js échoue si un projet `publié` n'a pas ses champs `fr` **et** `en` complets, ou n'a aucune capture d'écran — pour ne jamais publier une page à moitié traduite ou vide.

## Flux de publication (v1)

1. Éditer/publier un projet dans l'admin Filament.
2. Connexion SSH à Spaceship.
3. `npm run build` (Next.js, `output: 'export'`) — les fichiers statiques regénérés écrasent le dossier public servi par le sous-domaine.

Pas d'automatisation CI/CD en v1 (cohérent avec la contrainte « léger »). Piste explicitement mise de côté pour plus tard si l'édition devient fréquente : webhook Filament → cron Spaceship qui relance le build automatiquement.

## Formulaire de contact

Seul composant réellement interactif du site (le reste est statique) : appelle l'API Laravel en direct depuis le navigateur à l'exécution (pas au build). Anti-spam par champ honeypot plutôt que captcha externe, pour rester sans dépendance tierce. Validation côté client (Next.js) et côté serveur (Laravel), avec limitation de débit (throttle Laravel).

## Tests

- **Laravel** : suite Pest sur les endpoints API (liste/detail projets, validation et soumission du formulaire de contact) — même pratique que sur `caisse-depenses`.
- **Next.js** : TypeScript strict + script de build qui vérifie la complétude bilingue et la présence d'au moins une capture par projet publié (voir garde-fou de contenu ci-dessus).
- Pas de suite e2e lourde en v1 (Playwright resterait une option ultérieure si le site grossit).

## Hors scope pour la v1

- Automatisation du déploiement (CI/CD, webhook de rebuild)
- Blog / articles
- Rôles multiples dans l'admin (un seul éditeur : l'auteur)
- Toute fonctionnalité de paiement ou d'espace client authentifié

## Zones encore ouvertes (contenu, pas architecture)

Identifiées dans le dossier de recherche préalable, à trancher avant la rédaction du contenu réel :

- Formation / parcours académique à présenter sur `/a-propos`
- Ville/région précise et zone géographique visée pour les mandats
- Photo professionnelle disponible ou à produire
- Témoignages clients réels mobilisables (BESCAT, CAFAB, HODD GLOBAL...) ou à obtenir
- Contenu de `/services` : liste précise des prestations ByTechnum à formuler
- Direction visuelle (palette, typographie, ton) — non traitée dans cette spec, à faire en aval avec une passe de design dédiée

## Prochaine étape

Passer par la compétence `writing-plans` pour transformer cette spec en plan d'implémentation détaillé (scaffolding `backend/` Laravel + `frontend/` Next.js, migrations, endpoints API, pages).

# Conventions de contribution — moi.portfolio

Ce projet suit des standards enseignés. Deux écarts documentés ci-dessous, imposés par le contexte solo de ce projet
personnel

## Écart 1 — Numérotation des tickets

La convention impose `feature/PROJET-{numéro}-{description}`, le numéro traçant un ticket
Jira. Ce projet n'a pas de Jira : les **issues GitHub de ce dépôt** en tiennent lieu.

- Une tâche = une issue GitHub, puis une branche formatée `type/PORTFOLIO-{numéro-issue}-{description-kebab-case}`
- Exemple : issue #3 « Section hero de la page d'accueil » → `feature/PORTFOLIO-3-hero-section`
- Le reste du Gitflow ASIN s'applique sans changement (voir tableau ci-dessous)

## Écart 2 — Revue de code & merge

La convention interdit de merger sa propre PR (sauf urgence validée par un lead) et exige
1 à 2 reviewers désignés. Projet solo : il n'existe structurellement pas d'autre développeur.

- Toujours passer par une PR (jamais de commit direct sur `main` ou `develop`) — c'est ce qui
  garde l'historique, les checks CI et la trace de décision, même sans second reviewer
- Auto-review obligatoire avant merge : dérouler la checklist auteur du standard ASIN
  (build local, pas de secret exposé, nommage conforme, PR < 400 lignes ou justifiée) directement
  sur la PR avant de la merger soi-même
- Aucune review externe requise — c'est la substitution assumée du « minimum 1 reviewer »

## Le reste s'applique tel quel

- **Branches** : `main` (prod, protégée) / `develop` (intégration) / `feature`, `bugfix`,
  `hotfix`, `release` — mêmes règles de merge que le standard ASIN
- **Commits** : Conventional Commits (`feat`, `fix`, `docs`, `refactor`, `chore`, `test`,
  `style`, `perf`), minuscules, pas de point final, < 72 caractères
- **PR** : titre `[PORTFOLIO-{numéro}] Description courte`, template objectif/changements/tests/checklist,
  < 400 lignes ou justifiée
- **Nommage code, routes API, réponses, codes HTTP** : voir `docs/superpowers/specs/2026-08-20-portfolio-bytechnum-design.md` et le standard ASIN — nommage intention (pas implémentation), zéro abréviation, enveloppe `data`/`meta`/`error` systématique sur l'API Laravel

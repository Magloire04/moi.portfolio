# Frontend (Next.js) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Next.js static-export frontend that consumes the Laravel API (already complete, `backend/openapi.yaml`) to render the bilingual (FR/EN) ByTechnum portfolio: home, services, projects index + case-study pages, about, and a working contact form.

**Architecture:** Next.js (App Router, `output: 'export'`) + React 19 + TypeScript + Tailwind, in `frontend/`. Content is fetched from the Laravel API **at build time** (`generateStaticParams` + `fetch` in Server Components), so every page ships as real static HTML — no client-side data fetching except the contact form, the one interactive part of the site. French routes live at the site root (no prefix); English routes live under `/en/...` with translated URL segments (`/en/projects`, `/en/about`, …), achieved via Next.js's "multiple root layouts" pattern so each locale gets its own `<html lang>`.

**Tech Stack:** Node 20+, Next.js (App Router, static export), React 19, TypeScript, Tailwind CSS, Vitest + React Testing Library for tests.

**Spec:** `docs/superpowers/specs/2026-08-20-portfolio-bytechnum-design.md`

**API contract this plan consumes:** `backend/openapi.yaml` (already implemented and tested — 35 backend tests passing). Read it before Task 2; every field name used below is copied from it verbatim.

## Global Constraints

- Node 20+, TypeScript strict mode.
- **No placeholder/lorem content.** Every page ships with real, editable draft copy grounded in the actual research on ByTechnum/Elisée Atonde — the user will refine wording later, but nothing reads as a stub.
- API base URL comes from `NEXT_PUBLIC_API_BASE_URL` (Next.js requires the `NEXT_PUBLIC_` prefix for any env var read in the browser, which the contact form needs). Every fetch — build-time and browser-time — uses an **absolute** URL built from this constant; never a relative path.
- Every project the frontend renders is defensively re-validated for translation/screenshot completeness at fetch time (`lib/api.ts`), even though the backend's own `Project::booted()` guard already prevents publishing incomplete projects — this is belt-and-braces, not the primary safeguard, and it should stay cheap (a handful of truthiness checks, not a rules engine).
- **No Claude/Claude Code/Anthropic attribution anywhere in git history** — no `Co-Authored-By: Claude ...` trailer or similar in any commit, ever. This is a firm, non-negotiable project rule.
- Conventional Commits on every commit.
- Each Task below = one GitHub issue + one branch `type/PORTFOLIO-{issue#}-{description-kebab-case}` + one PR into `develop`, per `CONTRIBUTING.md`. Create the issue and branch before Step 1 of a Task. **Open the PR and stop — do not merge it yourself.** The controller (whoever is executing this plan under subagent-driven-development) merges after the task review passes.
- **Next.js/Tailwind version drift risk:** this plan's code targets the App Router conventions and Tailwind setup current as of early 2026. By the time this plan executes, `create-next-app` may scaffold a newer minor/major version with small API differences (this happened for real on the backend plan with Filament — v3-era plan code, v5.7.6 actually installed, and every task successfully adapted by verifying against the real installed source instead of trusting the plan blindly). Apply the same discipline here: if something in this plan's code doesn't match what's actually installed (e.g. `params` as a Promise vs. a plain object in route handlers, Tailwind v4's CSS-based config vs. v3's `tailwind.config.ts`), verify against the installed package's own docs/types before writing code, and note what you found and why in your report.

---

## Route map (locked in, used by every later task)

| URL | File |
|---|---|
| `/` | `frontend/app/(fr)/page.tsx` |
| `/services` | `frontend/app/(fr)/services/page.tsx` |
| `/projets` | `frontend/app/(fr)/projets/page.tsx` |
| `/projets/[slug]` | `frontend/app/(fr)/projets/[slug]/page.tsx` |
| `/a-propos` | `frontend/app/(fr)/a-propos/page.tsx` |
| `/contact` | `frontend/app/(fr)/contact/page.tsx` |
| `/en` | `frontend/app/en/page.tsx` |
| `/en/services` | `frontend/app/en/services/page.tsx` |
| `/en/projects` | `frontend/app/en/projects/page.tsx` |
| `/en/projects/[slug]` | `frontend/app/en/projects/[slug]/page.tsx` |
| `/en/about` | `frontend/app/en/about/page.tsx` |
| `/en/contact` | `frontend/app/en/contact/page.tsx` |

`(fr)` is a route group — it groups French pages under their own root layout without adding a `/fr` URL segment. Every route file above is a **thin wrapper**: it fetches data (if any) and renders a shared presentational component from `frontend/components/pages/`, so French and English pages share 100% of their logic and only differ in `locale` prop + fetched content.

---

### Task 1: Project scaffold & tooling

**Files:**
- Create: `frontend/` (Next.js app via `create-next-app`)
- Create: `frontend/lib/env.ts`
- Test: `frontend/lib/env.test.ts`
- Create/modify: `frontend/vitest.config.ts`, `frontend/package.json` (test scripts)

**Interfaces:**
- Consumes: nothing (first task)
- Produces: a bootable Next.js app in `frontend/` with `npm run build` producing a static export; `getApiBaseUrl(): string` in `lib/env.ts`, which Task 2 imports

- [ ] **Step 1: Issue and branch**

```bash
gh issue create --repo Magloire04/moi.portfolio \
  --title "Scaffold du frontend Next.js" \
  --body "Initialiser frontend/ : Next.js (App Router, export statique), TypeScript, Tailwind, Vitest. Réf. plan 2026-08-21."
git checkout develop && git pull origin develop
git checkout -b feature/PORTFOLIO-<issue#>-frontend-scaffold
```

- [ ] **Step 2: Scaffold Next.js**

```bash
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm
cd frontend
```

If prompted interactively for anything not covered by the flags above, accept the shown default. Verify afterward what Tailwind version was actually installed (`npm ls tailwindcss`) — Tailwind v4 ships a CSS-based config (no `tailwind.config.ts`, configuration lives in `@theme` blocks inside `app/globals.css`) while v3 uses `tailwind.config.ts`. Note which one you have; later tasks only use plain utility classes, which work the same either way, but if you need to add a custom color/font token, do it in whichever config format is actually present.

- [ ] **Step 3: Configure static export**

Edit `frontend/next.config.ts` (or `.js`, whichever `create-next-app` generated):

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

(`images.unoptimized` is mandatory for `output: 'export'` — Next's image optimizer needs a server, which a static export doesn't have. `trailingSlash: true` makes every route emit as `path/index.html`, which Apache/Spaceship serves correctly with zero rewrite rules.)

- [ ] **Step 4: Install the test runner**

```bash
npm install --save-dev vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Create `frontend/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
```

Create `frontend/vitest.setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

Add to `frontend/package.json`'s `"scripts"` block:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Write the failing test for a small real utility**

Create `frontend/lib/env.ts` (empty file for now, or skip creating it — the point of this step is the test fails because the function doesn't exist yet):

Create `frontend/lib/env.test.ts`:

```ts
import { describe, expect, it, vi, afterEach } from 'vitest';
import { getApiBaseUrl } from './env';

describe('getApiBaseUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns the configured NEXT_PUBLIC_API_BASE_URL when set', () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'https://moi.bytechnum.com');
    expect(getApiBaseUrl()).toBe('https://moi.bytechnum.com');
  });

  it('falls back to the local Laravel dev server when unset', () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', '');
    expect(getApiBaseUrl()).toBe('http://localhost:8000');
  });
});
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `npx vitest run lib/env.test.ts`
Expected: FAIL — `getApiBaseUrl` is not exported

- [ ] **Step 7: Implement**

Write `frontend/lib/env.ts`:

```ts
export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
}
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `npx vitest run lib/env.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 9: Verify the app builds**

Create `frontend/.env.local.example`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Run: `npm run build`
Expected: succeeds, produces an `out/` directory (Next's static export output) with at least `index.html`. This build doesn't fetch anything yet (Task 1 has no pages that call the API), so it should succeed even without the Laravel backend running.

- [ ] **Step 10: Commit, push, open the PR**

```bash
cd ..
git add frontend .gitignore 2>/dev/null || git add frontend
git commit -m "chore(frontend): scaffold Next.js app with static export and Vitest"
git push -u origin feature/PORTFOLIO-<issue#>-frontend-scaffold
gh pr create --repo Magloire04/moi.portfolio --base develop \
  --title "[PORTFOLIO-<issue#>] Scaffold du frontend Next.js" \
  --body "## Objectif
Initialiser frontend/ (Next.js App Router, export statique, TypeScript, Tailwind, Vitest). Réf. #<issue#>

## Changements
- [x] Scaffold Next.js dans frontend/
- [x] output: 'export' + trailingSlash + images.unoptimized configurés
- [x] Vitest + Testing Library installés, un test réel qui passe
- [x] npm run build produit un export statique

## Tests
- [x] npx vitest run
- [x] npm run build

## Checklist auteur
- [x] Code relu par moi-même
- [x] Pas de console.log
- [x] Pas de secret exposé"
```

Do not merge — leave the PR open.

---

### Task 2: API client, types, and content-validation guard

**Files:**
- Create: `frontend/lib/types.ts`
- Create: `frontend/lib/api.ts`
- Test: `frontend/lib/api.test.ts`

**Interfaces:**
- Consumes: `getApiBaseUrl()` from Task 1's `lib/env.ts`
- Produces: types `Locale`, `LocalizedText`, `ProjectCategory`, `Testimonial`, `Project`, `Meta`, `Settings`, `ApiError`, `ContactMessagePayload`; functions `getProjects(params?: { category?: ProjectCategory }): Promise<{ data: Project[]; meta: Meta }>`, `getProject(slug: string): Promise<Project>`, `getSettings(): Promise<Settings>`, `submitContactMessage(payload: ContactMessagePayload): Promise<{ received: boolean }>`, `getScreenshotUrl(path: string): string`. Every later task that fetches data imports from here — these exact names and signatures are load-bearing.

- [ ] **Step 1: Issue and branch**

```bash
gh issue create --repo Magloire04/moi.portfolio \
  --title "Client API typé + garde-fou de contenu" \
  --body "Types TS + fonctions fetch pour les 4 endpoints publics de backend/openapi.yaml, avec re-validation défensive de la complétude d'un projet."
git checkout -b feature/PORTFOLIO-<issue#>-api-client
```

- [ ] **Step 2: Write the types**

Create `frontend/lib/types.ts`:

```ts
export type Locale = 'fr' | 'en';

export interface LocalizedText {
  fr: string;
  en: string;
}

export type ProjectCategory = 'produit_bytechnum' | 'mandat_client';

export interface Testimonial {
  id: string;
  authorName: string;
  authorRole: string | null;
  authorCompany: string | null;
  quote: LocalizedText;
}

export interface Project {
  id: string;
  slug: string;
  category: ProjectCategory;
  title: LocalizedText;
  tagline: LocalizedText;
  summary: LocalizedText;
  body: LocalizedText;
  clientName: string | null;
  stack: string[];
  role: string | null;
  screenshots: string[];
  liveUrl: string | null;
  repoUrl: string | null;
  featured: boolean;
  testimonials: Testimonial[];
}

export interface Meta {
  page: number;
  limit: number;
  total: number;
}

export interface Settings {
  availableForWork: boolean;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    status: number;
  };
}

export interface ContactMessagePayload {
  name: string;
  email: string;
  message: string;
  projectInterest?: string;
  locale: Locale;
  website?: string;
}
```

- [ ] **Step 3: Write the failing tests**

Create `frontend/lib/api.test.ts`:

```ts
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  getProjects,
  getProject,
  getSettings,
  submitContactMessage,
  getScreenshotUrl,
} from './api';
import type { Project } from './types';

const completeProject: Project = {
  id: '1',
  slug: 'oeil-360-finance',
  category: 'produit_bytechnum',
  title: { fr: 'Titre', en: 'Title' },
  tagline: { fr: 'Accroche', en: 'Tagline' },
  summary: { fr: 'Résumé', en: 'Summary' },
  body: { fr: 'Corps', en: 'Body' },
  clientName: null,
  stack: ['Laravel'],
  role: null,
  screenshots: ['projects/shot.png'],
  liveUrl: null,
  repoUrl: null,
  featured: true,
  testimonials: [],
};

function mockFetchOnce(body: unknown, status = 200) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    }),
  );
}

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'https://api.test');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('getProjects', () => {
  it('fetches the list endpoint and returns data + meta', async () => {
    mockFetchOnce({ data: [completeProject], meta: { page: 1, limit: 20, total: 1 } });

    const result = await getProjects();

    expect(fetch).toHaveBeenCalledWith('https://api.test/api/v1/projects');
    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });

  it('appends a category query param when provided', async () => {
    mockFetchOnce({ data: [], meta: { page: 1, limit: 20, total: 0 } });

    await getProjects({ category: 'mandat_client' });

    expect(fetch).toHaveBeenCalledWith('https://api.test/api/v1/projects?category=mandat_client');
  });

  it('throws IncompleteProjectError if the API returns a project missing an English translation', async () => {
    const broken = { ...completeProject, title: { fr: 'Titre', en: '' } };
    mockFetchOnce({ data: [broken], meta: { page: 1, limit: 20, total: 1 } });

    await expect(getProjects()).rejects.toThrow(/incomplete/i);
  });

  it('throws IncompleteProjectError if the API returns a project with no screenshots', async () => {
    const broken = { ...completeProject, screenshots: [] };
    mockFetchOnce({ data: [broken], meta: { page: 1, limit: 20, total: 1 } });

    await expect(getProjects()).rejects.toThrow(/incomplete/i);
  });
});

describe('getProject', () => {
  it('fetches the detail endpoint by slug', async () => {
    mockFetchOnce({ data: completeProject });

    const result = await getProject('oeil-360-finance');

    expect(fetch).toHaveBeenCalledWith('https://api.test/api/v1/projects/oeil-360-finance');
    expect(result.slug).toBe('oeil-360-finance');
  });

  it('throws on a 404 response', async () => {
    mockFetchOnce({ error: { code: 'PROJECT_NOT_FOUND', message: 'Introuvable', status: 404 } }, 404);

    await expect(getProject('inconnu')).rejects.toThrow();
  });
});

describe('getSettings', () => {
  it('fetches availableForWork', async () => {
    mockFetchOnce({ data: { availableForWork: true } });

    const result = await getSettings();

    expect(fetch).toHaveBeenCalledWith('https://api.test/api/v1/settings');
    expect(result.availableForWork).toBe(true);
  });
});

describe('submitContactMessage', () => {
  it('posts the payload and returns received: true', async () => {
    mockFetchOnce({ data: { received: true } }, 201);

    const result = await submitContactMessage({
      name: 'Amina',
      email: 'amina@example.com',
      message: 'Bonjour',
      locale: 'fr',
    });

    expect(fetch).toHaveBeenCalledWith(
      'https://api.test/api/v1/contact-messages',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(result.received).toBe(true);
  });

  it('throws with the API error message on a 422', async () => {
    mockFetchOnce(
      { error: { code: 'VALIDATION_ERROR', message: "L'email est invalide.", status: 422 } },
      422,
    );

    await expect(
      submitContactMessage({ name: '', email: 'x', message: '', locale: 'fr' }),
    ).rejects.toThrow("L'email est invalide.");
  });
});

describe('getScreenshotUrl', () => {
  it('builds an absolute URL from a storage-relative path', () => {
    expect(getScreenshotUrl('projects/shot.png')).toBe('https://api.test/storage/projects/shot.png');
  });
});
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `npx vitest run lib/api.test.ts`
Expected: FAIL — `api.ts` doesn't exist yet

- [ ] **Step 5: Implement**

Create `frontend/lib/api.ts`:

```ts
import { getApiBaseUrl } from './env';
import type {
  ApiErrorBody,
  ContactMessagePayload,
  Meta,
  Project,
  ProjectCategory,
  Settings,
} from './types';

export class IncompleteProjectError extends Error {
  constructor(slug: string, reason: string) {
    super(`Project "${slug}" is incomplete: ${reason}`);
    this.name = 'IncompleteProjectError';
  }
}

function validateProject(project: Project): void {
  const hasCompleteTranslations =
    Boolean(project.title.fr) &&
    Boolean(project.title.en) &&
    Boolean(project.tagline.fr) &&
    Boolean(project.tagline.en) &&
    Boolean(project.summary.fr) &&
    Boolean(project.summary.en) &&
    Boolean(project.body.fr) &&
    Boolean(project.body.en);

  if (!hasCompleteTranslations) {
    throw new IncompleteProjectError(project.slug, 'missing FR or EN translation');
  }

  if (project.screenshots.length === 0) {
    throw new IncompleteProjectError(project.slug, 'no screenshots');
  }
}

async function parseJsonOrThrow<T>(response: Response): Promise<T> {
  const body = await response.json();

  if (!response.ok) {
    const errorBody = body as ApiErrorBody;
    throw new Error(errorBody.error?.message ?? `Request failed with status ${response.status}`);
  }

  return body as T;
}

export async function getProjects(
  params?: { category?: ProjectCategory },
): Promise<{ data: Project[]; meta: Meta }> {
  const url = new URL('/api/v1/projects', getApiBaseUrl());
  if (params?.category) {
    url.searchParams.set('category', params.category);
  }

  const response = await fetch(url.toString());
  const result = await parseJsonOrThrow<{ data: Project[]; meta: Meta }>(response);
  result.data.forEach(validateProject);

  return result;
}

export async function getProject(slug: string): Promise<Project> {
  const url = new URL(`/api/v1/projects/${slug}`, getApiBaseUrl());
  const response = await fetch(url.toString());
  const result = await parseJsonOrThrow<{ data: Project }>(response);
  validateProject(result.data);

  return result.data;
}

export async function getSettings(): Promise<Settings> {
  const url = new URL('/api/v1/settings', getApiBaseUrl());
  const response = await fetch(url.toString());
  const result = await parseJsonOrThrow<{ data: Settings }>(response);

  return result.data;
}

export async function submitContactMessage(
  payload: ContactMessagePayload,
): Promise<{ received: boolean }> {
  const url = new URL('/api/v1/contact-messages', getApiBaseUrl());
  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const result = await parseJsonOrThrow<{ data: { received: boolean } }>(response);

  return result.data;
}

export function getScreenshotUrl(path: string): string {
  return new URL(`/storage/${path}`, getApiBaseUrl()).toString();
}
```

Note: `new URL('/api/v1/projects', getApiBaseUrl())` correctly produces `https://api.test/api/v1/projects` — the second argument to the `URL` constructor is the base, and a leading-slash path replaces the base's path entirely, which is exactly the behavior the tests above expect (verify this against the actual `URL` global behavior if anything looks off; it's a standard Web API, not framework-specific, so it should behave identically regardless of Next.js version).

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run lib/api.test.ts`
Expected: PASS (9 tests)

- [ ] **Step 7: Run the full suite, commit, push, open the PR**

```bash
npx vitest run
cd ..
git add frontend
git commit -m "feat(frontend): add typed API client with content-validation guard"
git push -u origin feature/PORTFOLIO-<issue#>-api-client
gh pr create --repo Magloire04/moi.portfolio --base develop \
  --title "[PORTFOLIO-<issue#>] Client API typé" \
  --body "## Objectif
Types + fonctions fetch pour l'API Laravel, garde-fou de complétude défensif. Réf. #<issue#>

## Changements
- [x] lib/types.ts — types miroir de backend/openapi.yaml
- [x] lib/api.ts — getProjects/getProject/getSettings/submitContactMessage/getScreenshotUrl
- [x] Re-validation défensive (traductions + captures) à la lecture

## Tests
- [x] npx vitest run

## Checklist auteur
- [x] Code relu par moi-même
- [x] Pas de console.log
- [x] Pas de secret exposé"
```

Do not merge — leave the PR open.

---

### Task 3: i18n dictionary, routing skeleton, Header/Footer

**Files:**
- Create: `frontend/lib/routes.ts`
- Test: `frontend/lib/routes.test.ts`
- Create: `frontend/content/i18n.ts`
- Create: `frontend/components/layout/Header.tsx`
- Create: `frontend/components/layout/Footer.tsx`
- Create: `frontend/app/(fr)/layout.tsx`
- Create: `frontend/app/en/layout.tsx`
- Create: `frontend/app/not-found.tsx`
- Modify/remove: `frontend/app/layout.tsx`, `frontend/app/page.tsx` (the `create-next-app` defaults — replaced by the route-group structure below)

**Interfaces:**
- Consumes: nothing new from earlier tasks (pure routing/UI infrastructure)
- Produces: `getAlternateHref(pathname: string, locale: Locale): string` from `lib/routes.ts`; `getDictionary(locale: Locale): Dictionary` and the `Dictionary` type from `content/i18n.ts`; `<Header locale={Locale} />` and `<Footer locale={Locale} />` components. Every page task (4-8) renders inside the `(fr)` or `en` layout and may use `getDictionary()` for nav/shared UI strings.

- [ ] **Step 1: Issue and branch**

```bash
gh issue create --repo Magloire04/moi.portfolio \
  --title "Squelette de routage bilingue + Header/Footer" \
  --body "Route groups (fr)/en avec layouts racine distincts (html lang correct par locale), dictionnaire i18n, Header avec sélecteur de langue, Footer."
git checkout -b feature/PORTFOLIO-<issue#>-i18n-routing
```

- [ ] **Step 2: Write the failing test for the language-switcher path logic**

Create `frontend/lib/routes.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getAlternateHref } from './routes';

describe('getAlternateHref', () => {
  it('maps the FR home page to the EN home page', () => {
    expect(getAlternateHref('/', 'fr')).toBe('/en');
  });

  it('maps the EN home page to the FR home page', () => {
    expect(getAlternateHref('/en', 'en')).toBe('/');
  });

  it('translates static FR segments to their EN equivalents', () => {
    expect(getAlternateHref('/projets', 'fr')).toBe('/en/projects');
    expect(getAlternateHref('/a-propos', 'fr')).toBe('/en/about');
    expect(getAlternateHref('/services', 'fr')).toBe('/en/services');
    expect(getAlternateHref('/contact', 'fr')).toBe('/en/contact');
  });

  it('translates static EN segments back to their FR equivalents', () => {
    expect(getAlternateHref('/en/projects', 'en')).toBe('/projets');
    expect(getAlternateHref('/en/about', 'en')).toBe('/a-propos');
  });

  it('preserves a shared slug on project detail pages', () => {
    expect(getAlternateHref('/projets/tracacajou', 'fr')).toBe('/en/projects/tracacajou');
    expect(getAlternateHref('/en/projects/tracacajou', 'en')).toBe('/projets/tracacajou');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run lib/routes.test.ts`
Expected: FAIL — `getAlternateHref` doesn't exist

- [ ] **Step 4: Implement**

Create `frontend/lib/routes.ts`:

```ts
import type { Locale } from './types';

const FR_TO_EN_SEGMENT: Record<string, string> = {
  services: 'services',
  projets: 'projects',
  'a-propos': 'about',
  contact: 'contact',
};

const EN_TO_FR_SEGMENT: Record<string, string> = {
  services: 'services',
  projects: 'projets',
  about: 'a-propos',
  contact: 'contact',
};

export function getAlternateHref(pathname: string, locale: Locale): string {
  const segments = pathname.split('/').filter(Boolean);

  if (locale === 'fr') {
    const [first, ...rest] = segments;
    const enFirst = first ? (FR_TO_EN_SEGMENT[first] ?? first) : undefined;
    const tail = [enFirst, ...rest].filter(Boolean).join('/');
    return tail ? `/en/${tail}` : '/en';
  }

  const [, first, ...rest] = segments; // segments[0] is always 'en'
  const frFirst = first ? (EN_TO_FR_SEGMENT[first] ?? first) : undefined;
  const tail = [frFirst, ...rest].filter(Boolean).join('/');
  return tail ? `/${tail}` : '/';
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run lib/routes.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 6: Write the i18n dictionary**

Create `frontend/content/i18n.ts`:

```ts
import type { Locale } from '@/lib/types';

export interface Dictionary {
  nav: {
    home: string;
    services: string;
    projects: string;
    about: string;
    contact: string;
  };
  footer: {
    rights: string;
    availableForWork: string;
    notAvailableForWork: string;
  };
  cta: {
    contactMe: string;
    viewProject: string;
    liveDemo: string;
  };
  notFound: {
    title: string;
    body: string;
    backHome: string;
  };
}

const dictionaries: Record<Locale, Dictionary> = {
  fr: {
    nav: {
      home: 'Accueil',
      services: 'Services',
      projects: 'Projets',
      about: 'À propos',
      contact: 'Contact',
    },
    footer: {
      rights: 'Tous droits réservés.',
      availableForWork: 'Disponible pour de nouveaux mandats',
      notAvailableForWork: 'Actuellement complet',
    },
    cta: {
      contactMe: 'Me contacter',
      viewProject: 'Voir le projet',
      liveDemo: 'Démo en ligne',
    },
    notFound: {
      title: 'Page introuvable',
      body: "La page que vous cherchez n'existe pas ou plus.",
      backHome: "Retour à l'accueil",
    },
  },
  en: {
    nav: {
      home: 'Home',
      services: 'Services',
      projects: 'Projects',
      about: 'About',
      contact: 'Contact',
    },
    footer: {
      rights: 'All rights reserved.',
      availableForWork: 'Available for new engagements',
      notAvailableForWork: 'Currently fully booked',
    },
    cta: {
      contactMe: 'Get in touch',
      viewProject: 'View project',
      liveDemo: 'Live demo',
    },
    notFound: {
      title: 'Page not found',
      body: "The page you're looking for doesn't exist.",
      backHome: 'Back to home',
    },
  },
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
```

- [ ] **Step 7: Write the Header component**

Create `frontend/components/layout/Header.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getAlternateHref } from '@/lib/routes';
import { getDictionary } from '@/content/i18n';
import type { Locale } from '@/lib/types';

const FR_HREFS = {
  home: '/',
  services: '/services',
  projects: '/projets',
  about: '/a-propos',
  contact: '/contact',
};

const EN_HREFS = {
  home: '/en',
  services: '/en/services',
  projects: '/en/projects',
  about: '/en/about',
  contact: '/en/contact',
};

export function Header({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const dictionary = getDictionary(locale);
  const hrefs = locale === 'fr' ? FR_HREFS : EN_HREFS;
  const alternateHref = getAlternateHref(pathname, locale);

  return (
    <header className="border-b border-slate-200">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href={hrefs.home} className="font-mono text-lg font-semibold">
          ByTechnum
        </Link>
        <ul className="flex items-center gap-6 text-sm">
          <li><Link href={hrefs.services}>{dictionary.nav.services}</Link></li>
          <li><Link href={hrefs.projects}>{dictionary.nav.projects}</Link></li>
          <li><Link href={hrefs.about}>{dictionary.nav.about}</Link></li>
          <li><Link href={hrefs.contact}>{dictionary.nav.contact}</Link></li>
          <li>
            <Link href={alternateHref} className="uppercase text-slate-500">
              {locale === 'fr' ? 'EN' : 'FR'}
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
```

- [ ] **Step 8: Write the Footer component**

Create `frontend/components/layout/Footer.tsx`:

```tsx
import { getDictionary } from '@/content/i18n';
import type { Locale } from '@/lib/types';

export function Footer({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 py-8 text-sm text-slate-500">
      <div className="mx-auto max-w-5xl px-6">
        <p>ByTechnum — {year}. {dictionary.footer.rights}</p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 9: Restructure the app directory into the two root layouts**

Delete the `create-next-app` defaults: `frontend/app/layout.tsx` and `frontend/app/page.tsx` (their content moves into the route groups below — there is no longer a single top-level root layout, by design, per the "multiple root layouts" pattern this plan relies on for correct `<html lang>` per locale).

Create `frontend/app/(fr)/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import '../globals.css';

export const metadata: Metadata = {
  title: {
    default: 'ByTechnum — Elisée Atonde, développeur full-stack',
    template: '%s | ByTechnum',
  },
  description:
    'Développement web sur-mesure au Bénin : applications de gestion, identité numérique, traçabilité, conformité APDP.',
};

export default function FrenchRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Header locale="fr" />
        <main>{children}</main>
        <Footer locale="fr" />
      </body>
    </html>
  );
}
```

Create `frontend/app/en/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import '../globals.css';

export const metadata: Metadata = {
  title: {
    default: 'ByTechnum — Elisée Atonde, full-stack developer',
    template: '%s | ByTechnum',
  },
  description:
    'Custom web development from Benin: management applications, digital identity, traceability, data-protection compliance.',
};

export default function EnglishRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header locale="en" />
        <main>{children}</main>
        <Footer locale="en" />
      </body>
    </html>
  );
}
```

(Both import `../globals.css` — verify that path resolves correctly against wherever `create-next-app` actually put `globals.css`; adjust the relative path if needed, don't guess.)

Create `frontend/app/not-found.tsx` (this file sits outside both route groups, so per Next.js's multiple-root-layouts rule it needs its own complete `<html>`/`<body>` — it can't know which locale the visitor wanted, so it defaults to French with a link to the English home page too):

```tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <html lang="fr">
      <body>
        <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="text-2xl font-semibold">Page introuvable</h1>
          <p className="text-slate-600">La page que vous cherchez n&apos;existe pas ou plus.</p>
          <div className="flex gap-4">
            <Link href="/" className="underline">Retour à l&apos;accueil</Link>
            <Link href="/en" className="underline">English home</Link>
          </div>
        </main>
      </body>
    </html>
  );
}
```

- [ ] **Step 10: Write a temporary placeholder home page so the build has something to render**

Create `frontend/app/(fr)/page.tsx` (temporary — Task 4 replaces this with the real home page):

```tsx
export default function HomeRoute() {
  return <p>Accueil — à venir (Task 4)</p>;
}
```

Create `frontend/app/en/page.tsx`:

```tsx
export default function HomeRoute() {
  return <p>Home — coming soon (Task 4)</p>;
}
```

- [ ] **Step 11: Run the full suite and verify the build**

Run: `npx vitest run`
Expected: all tests pass (Task 1's 2 + Task 2's 9 + Task 3's 6 = 17)

Run: `npm run build`
Expected: succeeds, `out/index.html` has `<html lang="fr">`, `out/en/index.html` has `<html lang="en">` — open both files and grep for `lang=` to confirm, don't just trust that the build succeeding means the layouts are right:

```bash
grep -o '<html lang="[^"]*"' out/index.html
grep -o '<html lang="[^"]*"' out/en/index.html
```

Expected output: `<html lang="fr">` and `<html lang="en">` respectively. If Next.js's actual installed version handles multiple root layouts differently than described here (verify: this is standard, stable App Router behavior, but confirm it still works as expected against whatever version is installed), report it rather than forcing something that doesn't build.

- [ ] **Step 12: Commit, push, open the PR**

```bash
git add frontend
git commit -m "feat(frontend): add bilingual routing skeleton with per-locale root layouts"
git push -u origin feature/PORTFOLIO-<issue#>-i18n-routing
gh pr create --repo Magloire04/moi.portfolio --base develop \
  --title "[PORTFOLIO-<issue#>] Squelette de routage bilingue" \
  --body "## Objectif
Route groups (fr)/en, html lang correct par locale, dictionnaire i18n, Header/Footer. Réf. #<issue#>

## Changements
- [x] lib/routes.ts — getAlternateHref pour le sélecteur de langue
- [x] content/i18n.ts — dictionnaire FR/EN
- [x] app/(fr)/layout.tsx + app/en/layout.tsx — deux root layouts, html lang correct
- [x] app/not-found.tsx
- [x] Header (sélecteur de langue) + Footer

## Tests
- [x] npx vitest run
- [x] npm run build + vérification manuelle du lang= dans les deux exports

## Checklist auteur
- [x] Code relu par moi-même
- [x] Pas de console.log
- [x] Pas de secret exposé"
```

Do not merge — leave the PR open.

---

### Task 4: Home page

**Files:**
- Create: `frontend/components/pages/HomePage.tsx`
- Modify: `frontend/app/(fr)/page.tsx` (replace Task 3's placeholder)
- Modify: `frontend/app/en/page.tsx` (replace Task 3's placeholder)
- Create: `frontend/components/ProjectCard.tsx`
- Test: `frontend/components/ProjectCard.test.tsx`
- Test: `frontend/components/pages/HomePage.test.tsx`

**Interfaces:**
- Consumes: `getProjects`, `getSettings`, `getScreenshotUrl` from Task 2's `lib/api.ts`; `Project`, `Settings`, `Locale` types; `getDictionary` from Task 3
- Produces: `<ProjectCard project={Project} locale={Locale} href={string} />` — Task 6 (projects index) reuses this exact component

- [ ] **Step 1: Issue and branch**

```bash
gh issue create --repo Magloire04/moi.portfolio \
  --title "Page d'accueil" \
  --body "Hero, bande de compétences, grille des projets phares, CTA disponibilité."
git checkout -b feature/PORTFOLIO-<issue#>-home-page
```

- [ ] **Step 2: Write the failing test for ProjectCard**

Create `frontend/components/ProjectCard.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProjectCard } from './ProjectCard';
import type { Project } from '@/lib/types';

const project: Project = {
  id: '1',
  slug: 'tracacajou',
  category: 'produit_bytechnum',
  title: { fr: 'TraçaCajou', en: 'TraçaCajou' },
  tagline: { fr: 'Certification de la filière anacarde', en: 'Cashew supply chain certification' },
  summary: { fr: 'Résumé FR', en: 'Summary EN' },
  body: { fr: 'Corps FR', en: 'Body EN' },
  clientName: null,
  stack: ['Laravel', 'Vue 3'],
  role: null,
  screenshots: ['projects/tracacajou.png'],
  liveUrl: null,
  repoUrl: null,
  featured: true,
  testimonials: [],
};

describe('ProjectCard', () => {
  it('renders the title, tagline, and stack for the given locale', () => {
    render(<ProjectCard project={project} locale="fr" href="/projets/tracacajou" />);

    expect(screen.getByText('TraçaCajou')).toBeInTheDocument();
    expect(screen.getByText('Certification de la filière anacarde')).toBeInTheDocument();
    expect(screen.getByText('Laravel')).toBeInTheDocument();
    expect(screen.getByText('Vue 3')).toBeInTheDocument();
  });

  it('links to the provided href', () => {
    render(<ProjectCard project={project} locale="fr" href="/projets/tracacajou" />);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/projets/tracacajou');
  });

  it('renders the English tagline when locale is en', () => {
    render(<ProjectCard project={project} locale="en" href="/en/projects/tracacajou" />);

    expect(screen.getByText('Cashew supply chain certification')).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run components/ProjectCard.test.tsx`
Expected: FAIL — component doesn't exist

- [ ] **Step 4: Implement ProjectCard**

Create `frontend/components/ProjectCard.tsx`:

```tsx
import Link from 'next/link';
import Image from 'next/image';
import { getScreenshotUrl } from '@/lib/api';
import type { Locale, Project } from '@/lib/types';

export function ProjectCard({
  project,
  locale,
  href,
}: {
  project: Project;
  locale: Locale;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block overflow-hidden rounded-lg border border-slate-200 transition hover:border-slate-400"
    >
      {project.screenshots[0] && (
        <Image
          src={getScreenshotUrl(project.screenshots[0])}
          alt={project.title[locale]}
          width={640}
          height={360}
          className="aspect-video w-full object-cover"
          unoptimized
        />
      )}
      <div className="p-4">
        <h3 className="font-semibold">{project.title[locale]}</h3>
        <p className="mt-1 text-sm text-slate-600">{project.tagline[locale]}</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {project.stack.map((technology) => (
            <li
              key={technology}
              className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700"
            >
              {technology}
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run components/ProjectCard.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 6: Write the failing test for HomePage**

Create `frontend/components/pages/HomePage.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HomePage } from './HomePage';
import type { Project, Settings } from '@/lib/types';

const featuredProject: Project = {
  id: '1',
  slug: 'oeil-360-finance',
  category: 'produit_bytechnum',
  title: { fr: 'Oeil 360° Finance', en: 'Oeil 360° Finance' },
  tagline: { fr: 'Gestion de finances personnelles', en: 'Personal finance management' },
  summary: { fr: 'Résumé', en: 'Summary' },
  body: { fr: 'Corps', en: 'Body' },
  clientName: null,
  stack: ['Laravel'],
  role: null,
  screenshots: ['projects/oeil360.png'],
  liveUrl: 'https://oeil360finance.bytechnum.com',
  repoUrl: null,
  featured: true,
  testimonials: [],
};

const settings: Settings = { availableForWork: true };

describe('HomePage', () => {
  it('renders the hero heading and featured projects for French', () => {
    render(<HomePage locale="fr" featuredProjects={[featuredProject]} settings={settings} />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Oeil 360° Finance')).toBeInTheDocument();
  });

  it('shows the available-for-work message when settings.availableForWork is true', () => {
    render(<HomePage locale="fr" featuredProjects={[featuredProject]} settings={settings} />);

    expect(screen.getByText(/disponible pour de nouveaux mandats/i)).toBeInTheDocument();
  });

  it('shows the not-available message when settings.availableForWork is false', () => {
    render(
      <HomePage
        locale="fr"
        featuredProjects={[featuredProject]}
        settings={{ availableForWork: false }}
      />,
    );

    expect(screen.getByText(/actuellement complet/i)).toBeInTheDocument();
  });

  it('renders in English when locale is en', () => {
    render(<HomePage locale="en" featuredProjects={[featuredProject]} settings={settings} />);

    expect(screen.getByText('Personal finance management')).toBeInTheDocument();
  });
});
```

- [ ] **Step 7: Run test to verify it fails**

Run: `npx vitest run components/pages/HomePage.test.tsx`
Expected: FAIL — component doesn't exist

- [ ] **Step 8: Implement HomePage**

Create `frontend/components/pages/HomePage.tsx`:

```tsx
import Link from 'next/link';
import { ProjectCard } from '@/components/ProjectCard';
import { getDictionary } from '@/content/i18n';
import type { Locale, Project, Settings } from '@/lib/types';

const STACK_HIGHLIGHTS = ['Laravel', 'PHP', 'React', 'TypeScript', 'Spring Boot', 'PWA'];

const COPY = {
  fr: {
    heroKicker: 'Développeur full-stack — Bénin 🇧🇯',
    heroHeadline: "Je construis des applications qu'on peut auditer, pas juste qu'on peut démontrer.",
    heroBody:
      "ByTechnum conçoit des applications web sur-mesure pour des clients institutionnels et privés en Afrique de l'Ouest : gestion, identité numérique, traçabilité, conformité APDP.",
    featuredHeading: 'Projets phares',
    methodHeading: 'Une méthode, pas juste du code',
    methodBody:
      "Workflow par pull request même en solo, tests automatisés, en-têtes de sécurité stricts, conformité à la loi béninoise sur les données personnelles (APDP) citée explicitement dans plusieurs projets.",
    contactHref: '/contact',
    projectsHref: '/projets',
    viewAllProjects: 'Voir tous les projets',
  },
  en: {
    heroKicker: 'Full-stack developer — Benin 🇧🇯',
    heroHeadline: 'I build applications you can audit, not just ones you can demo.',
    heroBody:
      'ByTechnum builds custom web applications for institutional and private clients across West Africa: management systems, digital identity, traceability, data-protection compliance.',
    featuredHeading: 'Featured projects',
    methodHeading: 'A method, not just code',
    methodBody:
      'Pull-request workflow even solo, automated tests, strict security headers, compliance with Benin’s data-protection law (APDP) explicitly cited across several projects.',
    contactHref: '/en/contact',
    projectsHref: '/en/projects',
    viewAllProjects: 'View all projects',
  },
} as const;

export function HomePage({
  locale,
  featuredProjects,
  settings,
}: {
  locale: Locale;
  featuredProjects: Project[];
  settings: Settings;
}) {
  const dictionary = getDictionary(locale);
  const copy = COPY[locale];
  const projectHref = (project: Project) =>
    locale === 'fr' ? `/projets/${project.slug}` : `/en/projects/${project.slug}`;

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <section>
        <p className="font-mono text-sm uppercase tracking-wide text-slate-500">{copy.heroKicker}</p>
        <h1 className="mt-3 text-4xl font-bold leading-tight">{copy.heroHeadline}</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">{copy.heroBody}</p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link href={copy.contactHref} className="rounded bg-slate-900 px-5 py-2.5 text-white">
            {dictionary.cta.contactMe}
          </Link>
          <p className="text-sm text-slate-600">
            {settings.availableForWork
              ? dictionary.footer.availableForWork
              : dictionary.footer.notAvailableForWork}
          </p>
        </div>
      </section>

      <section className="mt-12 flex flex-wrap gap-2">
        {STACK_HIGHLIGHTS.map((technology) => (
          <span
            key={technology}
            className="rounded-full border border-slate-300 px-3 py-1 font-mono text-xs"
          >
            {technology}
          </span>
        ))}
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold">{copy.featuredHeading}</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {featuredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              locale={locale}
              href={projectHref(project)}
            />
          ))}
        </div>
        <Link href={copy.projectsHref} className="mt-6 inline-block underline">
          {copy.viewAllProjects}
        </Link>
      </section>

      <section className="mt-16 rounded-lg bg-slate-50 p-8">
        <h2 className="text-2xl font-semibold">{copy.methodHeading}</h2>
        <p className="mt-3 max-w-2xl text-slate-600">{copy.methodBody}</p>
      </section>
    </div>
  );
}
```

- [ ] **Step 9: Run test to verify it passes**

Run: `npx vitest run components/pages/HomePage.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 10: Wire the real route files**

Replace `frontend/app/(fr)/page.tsx`:

```tsx
import { HomePage } from '@/components/pages/HomePage';
import { getProjects, getSettings } from '@/lib/api';

export default async function HomeRoute() {
  const [{ data: featured }, settings] = await Promise.all([
    getProjects({ category: 'produit_bytechnum' }),
    getSettings(),
  ]);

  return <HomePage locale="fr" featuredProjects={featured.filter((p) => p.featured)} settings={settings} />;
}
```

Replace `frontend/app/en/page.tsx`:

```tsx
import { HomePage } from '@/components/pages/HomePage';
import { getProjects, getSettings } from '@/lib/api';

export default async function HomeRoute() {
  const [{ data: featured }, settings] = await Promise.all([
    getProjects({ category: 'produit_bytechnum' }),
    getSettings(),
  ]);

  return <HomePage locale="en" featuredProjects={featured.filter((p) => p.featured)} settings={settings} />;
}
```

- [ ] **Step 11: Verify the build against the real backend**

This step needs the Laravel backend actually running, since the home route now fetches at build time. From the repo root:

```bash
cd backend
php artisan serve --port=8000 &
cd ../frontend
```

If the SQLite dev database has no published projects yet, the build will still succeed (an empty featured list is valid), but to verify the real rendering path, seed one:

```bash
cd ../backend
php artisan tinker --execute="App\Models\Project::factory()->featured()->create();"
cd ../frontend
```

Run: `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000 npm run build`
Expected: succeeds; `out/index.html` contains the seeded project's title.

Stop the backend server afterward (`kill %1` or close the terminal) — don't leave it running past this verification step.

- [ ] **Step 12: Run the full suite, commit, push, open the PR**

```bash
npx vitest run
cd ..
git add frontend
git commit -m "feat(frontend): add home page with featured projects and availability CTA"
git push -u origin feature/PORTFOLIO-<issue#>-home-page
gh pr create --repo Magloire04/moi.portfolio --base develop \
  --title "[PORTFOLIO-<issue#>] Page d'accueil" \
  --body "## Objectif
Hero, bande de compétences, projets phares, CTA disponibilité. Réf. #<issue#>

## Changements
- [x] ProjectCard (réutilisé par la page /projets en Tâche 6)
- [x] HomePage + routes (fr)/page.tsx et en/page.tsx

## Tests
- [x] npx vitest run
- [x] npm run build vérifié contre le backend réel (projet seedé visible dans le HTML)

## Checklist auteur
- [x] Code relu par moi-même
- [x] Pas de console.log
- [x] Pas de secret exposé"
```

Do not merge — leave the PR open.

---

### Task 5: Services page

**Files:**
- Create: `frontend/content/services.ts`
- Create: `frontend/components/pages/ServicesPage.tsx`
- Test: `frontend/components/pages/ServicesPage.test.tsx`
- Create: `frontend/app/(fr)/services/page.tsx`
- Create: `frontend/app/en/services/page.tsx`

**Interfaces:**
- Consumes: `Locale` type, `getDictionary` from Task 3
- Produces: nothing later tasks import — this page is a leaf

- [ ] **Step 1: Issue and branch**

```bash
gh issue create --repo Magloire04/moi.portfolio \
  --title "Page Services" \
  --body "Prestations ByTechnum — contenu géré dans le code, pas en base."
git checkout -b feature/PORTFOLIO-<issue#>-services-page
```

- [ ] **Step 2: Write the content module**

Create `frontend/content/services.ts` (grounded in the actual pattern across the audited GitHub projects: management/CMS applications, PWAs, APDP-compliant data handling, cryptographic certification, government-adjacent digital-identity work):

```ts
import type { Locale, LocalizedText } from '@/lib/types';

export interface Service {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
}

export const services: Service[] = [
  {
    id: 'web-applications',
    title: { fr: 'Applications web sur-mesure', en: 'Custom web applications' },
    description: {
      fr: "Sites vitrines, CMS et applications de gestion (caisse, attestations, pointage) développés en Laravel/PHP ou React/TypeScript, adaptés au métier réel de votre structure plutôt qu'à un gabarit générique.",
      en: 'Corporate sites, content-managed platforms, and business-management applications (cash handling, certificates, attendance) built in Laravel/PHP or React/TypeScript, shaped around how your organization actually works.',
    },
  },
  {
    id: 'progressive-web-apps',
    title: { fr: 'Applications web progressives (PWA)', en: 'Progressive web apps' },
    description: {
      fr: 'Applications installables, utilisables hors-ligne, pensées pour des contextes de connexion instable — un standard technique appliqué à chaque produit ByTechnum public.',
      en: 'Installable, offline-capable applications built for unreliable connectivity — a technical standard applied to every public ByTechnum product.',
    },
  },
  {
    id: 'data-compliance',
    title: { fr: 'Conformité données personnelles (APDP)', en: 'Data-protection compliance (APDP)' },
    description: {
      fr: "Traitement des données personnelles conforme à la loi béninoise n°2017-20 (APDP) : minimisation des champs, consentement explicite, cité et appliqué dans plusieurs projets en production.",
      en: "Personal-data handling aligned with Benin's data-protection law (n°2017-20, APDP): field minimization, explicit consent — applied and cited across several production projects.",
    },
  },
  {
    id: 'digital-certification',
    title: { fr: 'Certification numérique & traçabilité', en: 'Digital certification & traceability' },
    description: {
      fr: 'Signature cryptographique réelle (ECDSA), vérification publique par QR code, pour rendre une chaîne de production ou une transaction vérifiable sans base de données centrale interrogeable.',
      en: 'Real cryptographic signing (ECDSA), public QR-code verification — making a production chain or a transaction verifiable without exposing a queryable central database.',
    },
  },
  {
    id: 'digital-identity',
    title: { fr: 'Identité numérique', en: 'Digital identity' },
    description: {
      fr: "Preuves de concept et intégrations autour de l'identité décentralisée (standards W3C Verifiable Credentials, infrastructure MOSIP), pour des acteurs institutionnels qui évaluent ces technologies.",
      en: 'Proofs of concept and integrations around decentralized identity (W3C Verifiable Credentials standards, MOSIP infrastructure), for institutional actors evaluating these technologies.',
    },
  },
  {
    id: 'admin-backoffice',
    title: { fr: "Back-office & tableaux de bord d'administration", en: 'Admin back-offices & dashboards' },
    description: {
      fr: "Interfaces d'administration complètes (Filament/Laravel) pour gérer du contenu, suivre des statistiques, traiter des demandes — sans dépendre de vous pour chaque mise à jour.",
      en: 'Full admin interfaces (Filament/Laravel) to manage content, track statistics, and process requests — without needing a developer for every routine update.',
    },
  },
];
```

- [ ] **Step 3: Write the failing test**

Create `frontend/components/pages/ServicesPage.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ServicesPage } from './ServicesPage';

describe('ServicesPage', () => {
  it('renders every service title and description in French', () => {
    render(<ServicesPage locale="fr" />);

    expect(screen.getByText('Applications web sur-mesure')).toBeInTheDocument();
    expect(screen.getByText('Conformité données personnelles (APDP)')).toBeInTheDocument();
  });

  it('renders every service title and description in English', () => {
    render(<ServicesPage locale="en" />);

    expect(screen.getByText('Custom web applications')).toBeInTheDocument();
    expect(screen.getByText('Data-protection compliance (APDP)')).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npx vitest run components/pages/ServicesPage.test.tsx`
Expected: FAIL — component doesn't exist

- [ ] **Step 5: Implement**

Create `frontend/components/pages/ServicesPage.tsx`:

```tsx
import { services } from '@/content/services';
import type { Locale } from '@/lib/types';

const HEADING = { fr: 'Services', en: 'Services' };
const INTRO = {
  fr: "Ce que ByTechnum livre concrètement — pas une liste de mots-clés, mais les compétences appliquées sur les projets présentés dans le portfolio.",
  en: 'What ByTechnum actually delivers — not a buzzword list, but the skills applied across the projects shown in this portfolio.',
};

export function ServicesPage({ locale }: { locale: Locale }) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-bold">{HEADING[locale]}</h1>
      <p className="mt-3 max-w-2xl text-slate-600">{INTRO[locale]}</p>

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        {services.map((service) => (
          <article key={service.id}>
            <h2 className="font-semibold">{service.title[locale]}</h2>
            <p className="mt-2 text-sm text-slate-600">{service.description[locale]}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run components/pages/ServicesPage.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 7: Wire the routes**

Create `frontend/app/(fr)/services/page.tsx`:

```tsx
import { ServicesPage } from '@/components/pages/ServicesPage';

export default function ServicesRoute() {
  return <ServicesPage locale="fr" />;
}
```

Create `frontend/app/en/services/page.tsx`:

```tsx
import { ServicesPage } from '@/components/pages/ServicesPage';

export default function ServicesRoute() {
  return <ServicesPage locale="en" />;
}
```

- [ ] **Step 8: Run the full suite, commit, push, open the PR**

```bash
npx vitest run
cd ..
git add frontend
git commit -m "feat(frontend): add services page with code-managed content"
git push -u origin feature/PORTFOLIO-<issue#>-services-page
gh pr create --repo Magloire04/moi.portfolio --base develop \
  --title "[PORTFOLIO-<issue#>] Page Services" \
  --body "## Objectif
Prestations ByTechnum, contenu géré dans le code. Réf. #<issue#>

## Changements
- [x] content/services.ts
- [x] ServicesPage + routes /services et /en/services

## Tests
- [x] npx vitest run

## Checklist auteur
- [x] Code relu par moi-même
- [x] Pas de console.log
- [x] Pas de secret exposé"
```

Do not merge — leave the PR open.

---

### Task 6: Projects index + detail pages

**Files:**
- Create: `frontend/components/pages/ProjectsIndexPage.tsx`
- Test: `frontend/components/pages/ProjectsIndexPage.test.tsx`
- Create: `frontend/components/pages/ProjectDetailPage.tsx`
- Test: `frontend/components/pages/ProjectDetailPage.test.tsx`
- Create: `frontend/components/TestimonialQuote.tsx`
- Create: `frontend/app/(fr)/projets/page.tsx`
- Create: `frontend/app/(fr)/projets/[slug]/page.tsx`
- Create: `frontend/app/en/projects/page.tsx`
- Create: `frontend/app/en/projects/[slug]/page.tsx`

**Interfaces:**
- Consumes: `ProjectCard` from Task 4; `getProjects`, `getProject` from Task 2; `Project`, `Testimonial`, `Locale` types
- Produces: nothing later tasks import — these are leaves

- [ ] **Step 1: Issue and branch**

```bash
gh issue create --repo Magloire04/moi.portfolio \
  --title "Index des projets + pages d'étude de cas" \
  --body "Liste complète des projets + page détaillée par projet (contexte, décisions techniques, résultat, témoignages)."
git checkout -b feature/PORTFOLIO-<issue#>-projects-pages
```

- [ ] **Step 2: Write the failing test for ProjectsIndexPage**

Create `frontend/components/pages/ProjectsIndexPage.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProjectsIndexPage } from './ProjectsIndexPage';
import type { Project } from '@/lib/types';

function makeProject(overrides: Partial<Project>): Project {
  return {
    id: '1',
    slug: 'x',
    category: 'produit_bytechnum',
    title: { fr: 'Titre', en: 'Title' },
    tagline: { fr: 'Accroche', en: 'Tagline' },
    summary: { fr: 'Résumé', en: 'Summary' },
    body: { fr: 'Corps', en: 'Body' },
    clientName: null,
    stack: [],
    role: null,
    screenshots: ['projects/x.png'],
    liveUrl: null,
    repoUrl: null,
    featured: false,
    testimonials: [],
    ...overrides,
  };
}

describe('ProjectsIndexPage', () => {
  it('renders every project passed in', () => {
    const projects = [
      makeProject({ id: '1', slug: 'a', title: { fr: 'Projet A', en: 'Project A' } }),
      makeProject({ id: '2', slug: 'b', title: { fr: 'Projet B', en: 'Project B' } }),
    ];

    render(<ProjectsIndexPage locale="fr" projects={projects} />);

    expect(screen.getByText('Projet A')).toBeInTheDocument();
    expect(screen.getByText('Projet B')).toBeInTheDocument();
  });

  it('links each card to the locale-correct detail URL', () => {
    const projects = [makeProject({ id: '1', slug: 'tracacajou' })];

    render(<ProjectsIndexPage locale="en" projects={projects} />);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/en/projects/tracacajou');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run components/pages/ProjectsIndexPage.test.tsx`
Expected: FAIL — component doesn't exist

- [ ] **Step 4: Implement ProjectsIndexPage**

Create `frontend/components/pages/ProjectsIndexPage.tsx`:

```tsx
import { ProjectCard } from '@/components/ProjectCard';
import type { Locale, Project } from '@/lib/types';

const HEADING = { fr: 'Projets', en: 'Projects' };
const INTRO = {
  fr: 'Produits publics et mandats clients sélectionnés — chacun avec son contexte, ses décisions techniques et son résultat.',
  en: 'Public products and selected client engagements — each with its context, technical decisions, and outcome.',
};

export function ProjectsIndexPage({ locale, projects }: { locale: Locale; projects: Project[] }) {
  const detailHref = (project: Project) =>
    locale === 'fr' ? `/projets/${project.slug}` : `/en/projects/${project.slug}`;

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-bold">{HEADING[locale]}</h1>
      <p className="mt-3 max-w-2xl text-slate-600">{INTRO[locale]}</p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            locale={locale}
            href={detailHref(project)}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run components/pages/ProjectsIndexPage.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 6: Write the failing test for TestimonialQuote and ProjectDetailPage**

Create `frontend/components/TestimonialQuote.tsx` is written directly (no dedicated test file — it's a trivial presentational component exercised through `ProjectDetailPage`'s tests below).

Create `frontend/components/pages/ProjectDetailPage.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProjectDetailPage } from './ProjectDetailPage';
import type { Project } from '@/lib/types';

const namedClientProject: Project = {
  id: '1',
  slug: 'oeil-360-finance',
  category: 'produit_bytechnum',
  title: { fr: 'Oeil 360° Finance', en: 'Oeil 360° Finance' },
  tagline: { fr: 'Accroche FR', en: 'Tagline EN' },
  summary: { fr: 'Résumé FR', en: 'Summary EN' },
  body: { fr: 'Corps détaillé FR', en: 'Detailed body EN' },
  clientName: null,
  stack: ['Laravel', 'PHP 8.4'],
  role: 'Développeur full-stack',
  screenshots: ['projects/oeil360-1.png', 'projects/oeil360-2.png'],
  liveUrl: 'https://oeil360finance.bytechnum.com',
  repoUrl: 'https://github.com/Magloire04/oeil-360-finance',
  featured: true,
  testimonials: [
    {
      id: 't1',
      authorName: 'Une cliente',
      authorRole: 'Directrice',
      authorCompany: null,
      quote: { fr: 'Citation FR', en: 'Quote EN' },
    },
  ],
};

describe('ProjectDetailPage', () => {
  it('renders the title, tagline, body, and stack for the given locale', () => {
    render(<ProjectDetailPage locale="fr" project={namedClientProject} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Oeil 360° Finance' })).toBeInTheDocument();
    expect(screen.getByText('Corps détaillé FR')).toBeInTheDocument();
    expect(screen.getByText('Laravel')).toBeInTheDocument();
  });

  it('renders a live-demo link when liveUrl is present', () => {
    render(<ProjectDetailPage locale="fr" project={namedClientProject} />);

    expect(screen.getByRole('link', { name: /démo en ligne/i })).toHaveAttribute(
      'href',
      'https://oeil360finance.bytechnum.com',
    );
  });

  it('renders visible testimonials with their locale-correct quote', () => {
    render(<ProjectDetailPage locale="en" project={namedClientProject} />);

    expect(screen.getByText('Quote EN')).toBeInTheDocument();
    expect(screen.getByText('Une cliente')).toBeInTheDocument();
  });

  it('does not render a client name when clientName is null', () => {
    render(<ProjectDetailPage locale="fr" project={namedClientProject} />);

    expect(screen.queryByText(/client\s*:/i)).not.toBeInTheDocument();
  });

  it('renders the client name when present and displayed', () => {
    const namedProject = { ...namedClientProject, clientName: 'CAFAB' };
    render(<ProjectDetailPage locale="fr" project={namedProject} />);

    expect(screen.getByText('CAFAB')).toBeInTheDocument();
  });
});
```

- [ ] **Step 7: Run tests to verify they fail**

Run: `npx vitest run components/pages/ProjectDetailPage.test.tsx`
Expected: FAIL — components don't exist

- [ ] **Step 8: Implement TestimonialQuote and ProjectDetailPage**

Create `frontend/components/TestimonialQuote.tsx`:

```tsx
import type { Locale, Testimonial } from '@/lib/types';

export function TestimonialQuote({ testimonial, locale }: { testimonial: Testimonial; locale: Locale }) {
  return (
    <blockquote className="border-l-2 border-slate-300 pl-4">
      <p className="italic text-slate-700">&ldquo;{testimonial.quote[locale]}&rdquo;</p>
      <footer className="mt-2 text-sm text-slate-500">
        {testimonial.authorName}
        {testimonial.authorRole ? `, ${testimonial.authorRole}` : ''}
        {testimonial.authorCompany ? ` — ${testimonial.authorCompany}` : ''}
      </footer>
    </blockquote>
  );
}
```

Create `frontend/components/pages/ProjectDetailPage.tsx`:

```tsx
import Image from 'next/image';
import { getScreenshotUrl } from '@/lib/api';
import { getDictionary } from '@/content/i18n';
import { TestimonialQuote } from '@/components/TestimonialQuote';
import type { Locale, Project } from '@/lib/types';

const CLIENT_LABEL = { fr: 'Client', en: 'Client' };
const ROLE_LABEL = { fr: 'Rôle', en: 'Role' };

export function ProjectDetailPage({ locale, project }: { locale: Locale; project: Project }) {
  const dictionary = getDictionary(locale);

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <header>
        <h1 className="text-3xl font-bold">{project.title[locale]}</h1>
        <p className="mt-2 text-lg text-slate-600">{project.tagline[locale]}</p>

        <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm text-slate-500">
          {project.clientName && (
            <div>
              <dt className="font-semibold">{CLIENT_LABEL[locale]}</dt>
              <dd>{project.clientName}</dd>
            </div>
          )}
          {project.role && (
            <div>
              <dt className="font-semibold">{ROLE_LABEL[locale]}</dt>
              <dd>{project.role}</dd>
            </div>
          )}
        </dl>

        <ul className="mt-4 flex flex-wrap gap-2">
          {project.stack.map((technology) => (
            <li
              key={technology}
              className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700"
            >
              {technology}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex gap-4">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded bg-slate-900 px-4 py-2 text-sm text-white"
            >
              {dictionary.cta.liveDemo}
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded border border-slate-300 px-4 py-2 text-sm"
            >
              GitHub
            </a>
          )}
        </div>
      </header>

      {project.screenshots.length > 0 && (
        <div className="mt-10 space-y-6">
          {project.screenshots.map((screenshot) => (
            <Image
              key={screenshot}
              src={getScreenshotUrl(screenshot)}
              alt={project.title[locale]}
              width={1200}
              height={675}
              className="w-full rounded-lg border border-slate-200"
              unoptimized
            />
          ))}
        </div>
      )}

      <div className="prose mt-10 max-w-none whitespace-pre-line text-slate-700">
        {project.body[locale]}
      </div>

      {project.testimonials.length > 0 && (
        <div className="mt-10 space-y-6">
          {project.testimonials.map((testimonial) => (
            <TestimonialQuote key={testimonial.id} testimonial={testimonial} locale={locale} />
          ))}
        </div>
      )}
    </article>
  );
}
```

- [ ] **Step 9: Run tests to verify they pass**

Run: `npx vitest run components/pages/ProjectDetailPage.test.tsx`
Expected: PASS (5 tests)

- [ ] **Step 10: Wire the routes**

Create `frontend/app/(fr)/projets/page.tsx`:

```tsx
import { ProjectsIndexPage } from '@/components/pages/ProjectsIndexPage';
import { getProjects } from '@/lib/api';

export default async function ProjetsRoute() {
  const { data: projects } = await getProjects();

  return <ProjectsIndexPage locale="fr" projects={projects} />;
}
```

Create `frontend/app/(fr)/projets/[slug]/page.tsx`:

```tsx
import { ProjectDetailPage } from '@/components/pages/ProjectDetailPage';
import { getProject, getProjects } from '@/lib/api';

export async function generateStaticParams() {
  const { data: projects } = await getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export default async function ProjetDetailRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);

  return <ProjectDetailPage locale="fr" project={project} />;
}
```

(`params` is typed as a `Promise` here, matching Next.js 15's App Router convention — verify this against whatever version is actually installed; if it's a plain object instead in the installed version, drop the `Promise`/`await` and adjust the type accordingly, and note the discrepancy in your report.)

Create `frontend/app/en/projects/page.tsx`:

```tsx
import { ProjectsIndexPage } from '@/components/pages/ProjectsIndexPage';
import { getProjects } from '@/lib/api';

export default async function ProjectsRoute() {
  const { data: projects } = await getProjects();

  return <ProjectsIndexPage locale="en" projects={projects} />;
}
```

Create `frontend/app/en/projects/[slug]/page.tsx`:

```tsx
import { ProjectDetailPage } from '@/components/pages/ProjectDetailPage';
import { getProject, getProjects } from '@/lib/api';

export async function generateStaticParams() {
  const { data: projects } = await getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export default async function ProjectDetailRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);

  return <ProjectDetailPage locale="en" project={project} />;
}
```

- [ ] **Step 11: Verify the build against the real backend**

```bash
cd ../backend
php artisan serve --port=8000 &
php artisan tinker --execute="App\Models\Project::factory()->featured()->create(['slug' => 'test-e2e']);"
cd ../frontend
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000 npm run build
```

Expected: succeeds, and both `out/projets/test-e2e/index.html` and `out/en/projects/test-e2e/index.html` exist (confirming `generateStaticParams` ran and produced pages for the seeded slug in both locales).

```bash
ls out/projets/test-e2e/index.html out/en/projects/test-e2e/index.html
```

Stop the backend server afterward.

- [ ] **Step 12: Run the full suite, commit, push, open the PR**

```bash
npx vitest run
cd ..
git add frontend
git commit -m "feat(frontend): add projects index and case-study detail pages"
git push -u origin feature/PORTFOLIO-<issue#>-projects-pages
gh pr create --repo Magloire04/moi.portfolio --base develop \
  --title "[PORTFOLIO-<issue#>] Index projets + études de cas" \
  --body "## Objectif
Liste complète des projets + page détaillée par slug, dans les deux langues. Réf. #<issue#>

## Changements
- [x] ProjectsIndexPage + routes /projets et /en/projects
- [x] ProjectDetailPage (contexte, stack, captures, témoignages) + generateStaticParams + routes [slug]
- [x] TestimonialQuote

## Tests
- [x] npx vitest run
- [x] npm run build vérifié contre le backend réel — pages générées pour un slug de test dans les deux langues

## Checklist auteur
- [x] Code relu par moi-même
- [x] Pas de console.log
- [x] Pas de secret exposé"
```

Do not merge — leave the PR open.

---

### Task 7: About page

**Files:**
- Create: `frontend/content/about.ts`
- Create: `frontend/components/pages/AboutPage.tsx`
- Test: `frontend/components/pages/AboutPage.test.tsx`
- Create: `frontend/app/(fr)/a-propos/page.tsx`
- Create: `frontend/app/en/about/page.tsx`

**Interfaces:**
- Consumes: `Locale` type from Task 2
- Produces: nothing later tasks import — this page is a leaf

- [ ] **Step 1: Issue and branch**

```bash
gh issue create --repo Magloire04/moi.portfolio \
  --title "Page À propos" \
  --body "Parcours, méthode (APDP, cryptographie, workflow PR, CI) — contenu géré dans le code."
git checkout -b feature/PORTFOLIO-<issue#>-about-page
```

- [ ] **Step 2: Write the content module**

Create `frontend/content/about.ts` (grounded in the confirmed research: full-stack dev based in Bénin, ByTechnum brand, ~2.9 years of public GitHub activity, disciplined PR-based git workflow, APDP compliance cited across multiple production projects, real cryptography used — not decorative — and CI with secret scanning; the bio deliberately leaves education/city as short editable placeholders since the spec flags those as still-open content decisions, not architecture):

```ts
import type { LocalizedText } from '@/lib/types';

export interface MethodPoint {
  id: string;
  title: LocalizedText;
  body: LocalizedText;
}

export const bio: LocalizedText = {
  fr: "Je suis développeur full-stack, basé au Bénin, et je conçois des applications pour des clients institutionnels et privés en Afrique de l'Ouest sous la marque ByTechnum. Mon terrain de jeu principal est Laravel/PHP, avec une bascule récente vers React et TypeScript pour les produits les plus récents — Dis oui, TraçaCajou, l'estimateur de bourse « where ». Je m'intéresse particulièrement aux projets qui touchent à l'infrastructure : identité numérique décentralisée, certification cryptographique, paiements de masse.",
  en: "I'm a full-stack developer based in Benin, building applications for institutional and private clients across West Africa under the ByTechnum brand. My core stack is Laravel/PHP, with a recent shift to React and TypeScript for the newest products — Dis oui, TraçaCajou, the \"where\" scholarship estimator. I'm especially drawn to infrastructure-adjacent work: decentralized digital identity, cryptographic certification, mass payments.",
};

export const methodPoints: MethodPoint[] = [
  {
    id: 'pr-workflow',
    title: { fr: 'Workflow par pull request, même en solo', en: 'Pull-request workflow, even solo' },
    body: {
      fr: "Chaque changement passe par une issue, une branche, une PR et une relecture — sur ce portfolio comme sur mes mandats clients. Ça laisse une trace de décision, pas seulement du code.",
      en: 'Every change goes through an issue, a branch, a PR, and a review — on this portfolio the same as on client work. It leaves a decision trail, not just code.',
    },
  },
  {
    id: 'apdp',
    title: { fr: 'Conformité APDP citée explicitement', en: 'APDP compliance, explicitly cited' },
    body: {
      fr: "La loi béninoise n°2017-20 sur la protection des données personnelles est nommée et appliquée dans plusieurs projets en production, pas traitée comme un détail administratif après coup.",
      en: "Benin's data-protection law (n°2017-20, APDP) is named and applied across several production projects, not treated as an administrative afterthought.",
    },
  },
  {
    id: 'real-crypto',
    title: { fr: 'Cryptographie appliquée, pas décorative', en: 'Applied cryptography, not decorative' },
    body: {
      fr: 'Signatures ECDSA P-384 réelles pour des certificats vérifiables publiquement, JWT signés pour un PoC d’identité numérique, Argon2id pour les mots de passe — la sécurité vit dans le code, pas dans une brochure.',
      en: 'Real ECDSA P-384 signatures for publicly verifiable certificates, signed JWTs for a digital-identity PoC, Argon2id for passwords — security lives in the code, not in a brochure.',
    },
  },
  {
    id: 'tests-ci',
    title: { fr: 'Tests et intégration continue', en: 'Tests and continuous integration' },
    body: {
      fr: 'Suites de tests automatisées et scan de secrets sur chaque changement — y compris sur ce site, dont le code est public.',
      en: 'Automated test suites and secret scanning on every change — including this site, whose code is public.',
    },
  },
];
```

- [ ] **Step 3: Write the failing test**

Create `frontend/components/pages/AboutPage.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AboutPage } from './AboutPage';

describe('AboutPage', () => {
  it('renders the French bio and method points', () => {
    render(<AboutPage locale="fr" />);

    expect(screen.getByText(/développeur full-stack/i)).toBeInTheDocument();
    expect(screen.getByText('Workflow par pull request, même en solo')).toBeInTheDocument();
  });

  it('renders the English bio and method points', () => {
    render(<AboutPage locale="en" />);

    expect(screen.getByText(/full-stack developer/i)).toBeInTheDocument();
    expect(screen.getByText('Pull-request workflow, even solo')).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npx vitest run components/pages/AboutPage.test.tsx`
Expected: FAIL — component doesn't exist

- [ ] **Step 5: Implement**

Create `frontend/components/pages/AboutPage.tsx`:

```tsx
import { bio, methodPoints } from '@/content/about';
import type { Locale } from '@/lib/types';

const HEADING = { fr: 'À propos', en: 'About' };
const METHOD_HEADING = { fr: 'Méthode', en: 'Method' };

export function AboutPage({ locale }: { locale: Locale }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold">{HEADING[locale]}</h1>
      <p className="mt-6 text-lg text-slate-700">{bio[locale]}</p>

      <h2 className="mt-12 text-2xl font-semibold">{METHOD_HEADING[locale]}</h2>
      <div className="mt-6 space-y-6">
        {methodPoints.map((point) => (
          <div key={point.id}>
            <h3 className="font-semibold">{point.title[locale]}</h3>
            <p className="mt-1 text-sm text-slate-600">{point.body[locale]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run components/pages/AboutPage.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 7: Wire the routes**

Create `frontend/app/(fr)/a-propos/page.tsx`:

```tsx
import { AboutPage } from '@/components/pages/AboutPage';

export default function AProposRoute() {
  return <AboutPage locale="fr" />;
}
```

Create `frontend/app/en/about/page.tsx`:

```tsx
import { AboutPage } from '@/components/pages/AboutPage';

export default function AboutRoute() {
  return <AboutPage locale="en" />;
}
```

- [ ] **Step 8: Run the full suite, commit, push, open the PR**

```bash
npx vitest run
cd ..
git add frontend
git commit -m "feat(frontend): add about page with bio and method"
git push -u origin feature/PORTFOLIO-<issue#>-about-page
gh pr create --repo Magloire04/moi.portfolio --base develop \
  --title "[PORTFOLIO-<issue#>] Page À propos" \
  --body "## Objectif
Parcours et méthode, contenu géré dans le code. Réf. #<issue#>

## Changements
- [x] content/about.ts
- [x] AboutPage + routes /a-propos et /en/about

## Tests
- [x] npx vitest run

## Checklist auteur
- [x] Code relu par moi-même
- [x] Pas de console.log
- [x] Pas de secret exposé"
```

Do not merge — leave the PR open.

---

### Task 8: Contact page and form

**Files:**
- Create: `frontend/components/ContactForm.tsx`
- Test: `frontend/components/ContactForm.test.tsx`
- Create: `frontend/components/pages/ContactPage.tsx`
- Create: `frontend/app/(fr)/contact/page.tsx`
- Create: `frontend/app/en/contact/page.tsx`

**Interfaces:**
- Consumes: `submitContactMessage` from Task 2's `lib/api.ts`; `Locale` type; `getDictionary` from Task 3
- Produces: nothing later tasks import — this page is a leaf

- [ ] **Step 1: Issue and branch**

```bash
gh issue create --repo Magloire04/moi.portfolio \
  --title "Page Contact + formulaire" \
  --body "Seule partie interactive du site : formulaire de contact avec honeypot, appelant l'API en direct."
git checkout -b feature/PORTFOLIO-<issue#>-contact-page
```

- [ ] **Step 2: Write the failing tests for ContactForm**

Create `frontend/components/ContactForm.test.tsx`:

```tsx
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactForm } from './ContactForm';
import * as api from '@/lib/api';

describe('ContactForm', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders name, email, and message fields plus a hidden honeypot field', () => {
    render(<ContactForm locale="fr" />);

    expect(screen.getByLabelText(/nom/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-?mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();

    const honeypot = document.querySelector('input[name="website"]');
    expect(honeypot).toBeInTheDocument();
    expect(honeypot).toHaveAttribute('tabindex', '-1');
    expect(honeypot).toHaveAttribute('autocomplete', 'off');
  });

  it('submits the form and shows a success message', async () => {
    vi.spyOn(api, 'submitContactMessage').mockResolvedValue({ received: true });
    const user = userEvent.setup();

    render(<ContactForm locale="fr" />);

    await user.type(screen.getByLabelText(/nom/i), 'Amina Traoré');
    await user.type(screen.getByLabelText(/e-?mail/i), 'amina@example.com');
    await user.type(screen.getByLabelText(/message/i), "Bonjour, je souhaite discuter d'un mandat.");
    await user.click(screen.getByRole('button', { name: /envoyer/i }));

    await waitFor(() => {
      expect(screen.getByText(/message envoyé/i)).toBeInTheDocument();
    });

    expect(api.submitContactMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Amina Traoré',
        email: 'amina@example.com',
        message: "Bonjour, je souhaite discuter d'un mandat.",
        locale: 'fr',
      }),
    );
  });

  it('shows an error message when the API call fails', async () => {
    vi.spyOn(api, 'submitContactMessage').mockRejectedValue(new Error("L'email est invalide."));
    const user = userEvent.setup();

    render(<ContactForm locale="fr" />);

    await user.type(screen.getByLabelText(/nom/i), 'A');
    await user.type(screen.getByLabelText(/e-?mail/i), 'pas-un-email');
    await user.type(screen.getByLabelText(/message/i), 'Test');
    await user.click(screen.getByRole('button', { name: /envoyer/i }));

    await waitFor(() => {
      expect(screen.getByText("L'email est invalide.")).toBeInTheDocument();
    });
  });

  it('renders English labels and success message when locale is en', async () => {
    vi.spyOn(api, 'submitContactMessage').mockResolvedValue({ received: true });
    const user = userEvent.setup();

    render(<ContactForm locale="en" />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/^name/i), 'Amina');
    await user.type(screen.getByLabelText(/email/i), 'amina@example.com');
    await user.type(screen.getByLabelText(/message/i), 'Hello');
    await user.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByText(/message sent/i)).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run components/ContactForm.test.tsx`
Expected: FAIL — component doesn't exist

- [ ] **Step 4: Implement ContactForm**

Create `frontend/components/ContactForm.tsx`:

```tsx
'use client';

import { useState, type FormEvent } from 'react';
import { submitContactMessage } from '@/lib/api';
import type { Locale } from '@/lib/types';

const COPY = {
  fr: {
    name: 'Nom',
    email: 'E-mail',
    message: 'Message',
    projectInterest: 'Projet concerné (optionnel)',
    submit: 'Envoyer',
    submitting: 'Envoi en cours…',
    success: 'Message envoyé — je vous réponds rapidement.',
    genericError: "Une erreur est survenue, réessayez dans un instant.",
  },
  en: {
    name: 'Name',
    email: 'Email',
    message: 'Message',
    projectInterest: 'Project of interest (optional)',
    submit: 'Send',
    submitting: 'Sending…',
    success: "Message sent — I'll get back to you shortly.",
    genericError: 'Something went wrong, please try again in a moment.',
  },
} as const;

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function ContactForm({ locale }: { locale: Locale }) {
  const copy = COPY[locale];
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    const form = new FormData(event.currentTarget);

    try {
      await submitContactMessage({
        name: String(form.get('name') ?? ''),
        email: String(form.get('email') ?? ''),
        message: String(form.get('message') ?? ''),
        projectInterest: String(form.get('projectInterest') ?? '') || undefined,
        locale,
        website: String(form.get('website') ?? ''),
      });
      setStatus('success');
      event.currentTarget.reset();
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : copy.genericError);
    }
  }

  if (status === 'success') {
    return <p role="status">{copy.success}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">{copy.name}</label>
        <input id="name" name="name" type="text" required maxLength={120} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium">{copy.email}</label>
        <input id="email" name="email" type="email" required maxLength={180} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
      </div>

      <div>
        <label htmlFor="projectInterest" className="block text-sm font-medium">{copy.projectInterest}</label>
        <input id="projectInterest" name="projectInterest" type="text" maxLength={120} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium">{copy.message}</label>
        <textarea id="message" name="message" required maxLength={5000} rows={6} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
      </div>

      {/* Honeypot: invisible to a human visitor (off-screen, unreachable by keyboard tab order,
          excluded from autofill), but present in the DOM for a bot to fill in. Any real content
          here makes the backend silently drop the submission — see backend/openapi.yaml. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 overflow-hidden"
      />

      {status === 'error' && (
        <p role="alert" className="text-sm text-red-600">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="rounded bg-slate-900 px-5 py-2.5 text-white disabled:opacity-50"
      >
        {status === 'submitting' ? copy.submitting : copy.submit}
      </button>
    </form>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run components/ContactForm.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 6: Write ContactPage and wire the routes**

Create `frontend/components/pages/ContactPage.tsx`:

```tsx
import { ContactForm } from '@/components/ContactForm';
import type { Locale } from '@/lib/types';

const HEADING = { fr: 'Contact', en: 'Contact' };
const INTRO = {
  fr: 'Une question, un mandat à discuter — écrivez-moi directement.',
  en: 'A question, an engagement to discuss — write to me directly.',
};

export function ContactPage({ locale }: { locale: Locale }) {
  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-3xl font-bold">{HEADING[locale]}</h1>
      <p className="mt-3 text-slate-600">{INTRO[locale]}</p>
      <div className="mt-8">
        <ContactForm locale={locale} />
      </div>
    </div>
  );
}
```

Create `frontend/app/(fr)/contact/page.tsx`:

```tsx
import { ContactPage } from '@/components/pages/ContactPage';

export default function ContactRoute() {
  return <ContactPage locale="fr" />;
}
```

Create `frontend/app/en/contact/page.tsx`:

```tsx
import { ContactPage } from '@/components/pages/ContactPage';

export default function ContactRoute() {
  return <ContactPage locale="en" />;
}
```

- [ ] **Step 7: Verify the build (this page has no build-time fetch, so no backend needed)**

Run: `npm run build`
Expected: succeeds; `out/contact/index.html` and `out/en/contact/index.html` both exist.

- [ ] **Step 8: Run the full suite, commit, push, open the PR**

```bash
npx vitest run
cd ..
git add frontend
git commit -m "feat(frontend): add contact page with honeypot-protected form"
git push -u origin feature/PORTFOLIO-<issue#>-contact-page
gh pr create --repo Magloire04/moi.portfolio --base develop \
  --title "[PORTFOLIO-<issue#>] Page Contact" \
  --body "## Objectif
Formulaire de contact, seule partie interactive du site. Réf. #<issue#>

## Changements
- [x] ContactForm (honeypot, gestion d'erreur, succès)
- [x] ContactPage + routes /contact et /en/contact

## Tests
- [x] npx vitest run
- [x] npm run build

## Checklist auteur
- [x] Code relu par moi-même
- [x] Pas de console.log
- [x] Pas de secret exposé"
```

Do not merge — leave the PR open.

---

### Task 9: Continuous integration

**Files:**
- Create: `.github/workflows/frontend-ci.yml` (repo root)

**Interfaces:**
- Consumes: every earlier task's full test suite and the backend's `Project` factory (via `php artisan tinker`) to seed one real fixture for the build step
- Produces: a GitHub Actions workflow gating every PR into `develop`/`main` on `frontend/**` changes

- [ ] **Step 1: Issue and branch**

```bash
gh issue create --repo Magloire04/moi.portfolio \
  --title "CI frontend (lint, typecheck, tests, build contre le backend)" \
  --body "Pipeline GitHub Actions sur frontend/** : lint + tsc + vitest + next build contre une API Laravel réelle démarrée en service dans le job."
git checkout -b feature/PORTFOLIO-<issue#>-frontend-ci
```

- [ ] **Step 2: Write the workflow**

Create `.github/workflows/frontend-ci.yml` (repo root, alongside the existing `backend-ci.yml`):

```yaml
name: Frontend CI

on:
  pull_request:
    branches: [main, develop]
    paths: ['frontend/**']
  push:
    branches: [main, develop]
    paths: ['frontend/**']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
          extensions: mbstring, sqlite3, pdo_sqlite

      - name: Prepare the backend as a live fixture API
        working-directory: backend
        run: |
          composer install --no-interaction --prefer-dist
          cp .env.example .env
          php artisan key:generate
          touch database/database.sqlite
          php artisan migrate --force
          php artisan tinker --execute="App\Models\Project::factory()->featured()->create();"
          php artisan serve --port=8000 &
          sleep 3

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: frontend/package-lock.json

      - name: Install frontend dependencies
        working-directory: frontend
        run: npm ci

      - name: Lint
        working-directory: frontend
        run: npm run lint

      - name: Typecheck
        working-directory: frontend
        run: npx tsc --noEmit

      - name: Unit tests
        working-directory: frontend
        run: npx vitest run

      - name: Build (static export against the live fixture API)
        working-directory: frontend
        env:
          NEXT_PUBLIC_API_BASE_URL: http://127.0.0.1:8000
        run: npm run build
```

- [ ] **Step 3: Verify locally that the referenced commands succeed**

From `frontend/`:

```bash
npm run lint
npx tsc --noEmit
```

Expected: both exit cleanly (0). This is a smoke check, not a real CI run — CI only executes on GitHub itself.

- [ ] **Step 4: Commit, push, open the PR**

```bash
cd ..
git add .github/workflows/frontend-ci.yml
git commit -m "chore(ci): add frontend GitHub Actions workflow (lint, typecheck, tests, build)"
git push -u origin feature/PORTFOLIO-<issue#>-frontend-ci
gh pr create --repo Magloire04/moi.portfolio --base develop \
  --title "[PORTFOLIO-<issue#>] CI frontend" \
  --body "## Objectif
Lint + typecheck + tests + build (contre une API Laravel réelle) sur chaque PR touchant frontend/. Réf. #<issue#>

## Changements
- [x] .github/workflows/frontend-ci.yml

## Tests
- [x] Vérification locale : npm run lint, npx tsc --noEmit

## Checklist auteur
- [x] Code relu par moi-même
- [x] Pas de console.log
- [x] Pas de secret exposé"
```

Do not merge — leave the PR open.

---

## After this plan

The frontend is a complete, statically-exportable site consuming the Laravel API exactly as documented in `backend/openapi.yaml`: `npm run build` (with `NEXT_PUBLIC_API_BASE_URL` pointing at the real API) produces an `out/` directory of plain HTML/CSS/JS ready to be copied onto the Spaceship hosting alongside the backend, per the design spec's publication flow (SSH + `npm run build`, manual for v1). Bilingual routing, the six pages from the spec's site map, and the honeypot-protected contact form are all in place and tested. Content still needs the user's real photo, final wording pass on the about/services copy, and any client testimonials gathered per the spec's still-open items — none of that blocks the architecture being complete and deployable.

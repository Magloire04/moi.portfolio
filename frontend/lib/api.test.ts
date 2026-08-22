import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  ApiError,
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

  it('throws an ApiError with the backend message and code on a 422', async () => {
    mockFetchOnce(
      { error: { code: 'VALIDATION_ERROR', message: "L'email est invalide.", status: 422 } },
      422,
    );

    const promise = submitContactMessage({ name: '', email: 'x', message: '', locale: 'fr' });

    await expect(promise).rejects.toThrow("L'email est invalide.");
    await expect(promise).rejects.toBeInstanceOf(ApiError);
    await promise.catch((error: ApiError) => {
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.status).toBe(422);
    });
  });

  it('throws a plain Error (not an ApiError) when a non-ok response has no valid error envelope', async () => {
    mockFetchOnce({}, 500);

    const promise = submitContactMessage({ name: 'A', email: 'a@b.com', message: 'Hi', locale: 'fr' });

    await expect(promise).rejects.toThrow();
    await expect(promise).rejects.not.toBeInstanceOf(ApiError);
  });
});

describe('getScreenshotUrl', () => {
  it('builds an absolute URL from a storage-relative path', () => {
    expect(getScreenshotUrl('projects/shot.png')).toBe('https://api.test/storage/projects/shot.png');
  });

  it('preserves a non-empty base path instead of discarding it (production topology)', () => {
    // Regression test: production's NEXT_PUBLIC_API_BASE_URL is
    // https://moi.bytechnum.com/api (the app is physically nested under /api there — see
    // PUBLIC_DISK_ROOT in backend/config/filesystems.php). `new URL('/storage/...', base)`
    // would silently discard that "/api" segment since the relative reference starts with
    // "/", producing a 404. Plain concatenation must keep it.
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'https://moi.bytechnum.com/api');

    expect(getScreenshotUrl('projects/shot.png')).toBe(
      'https://moi.bytechnum.com/api/storage/projects/shot.png',
    );
  });
});

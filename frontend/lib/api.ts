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

/**
 * A backend-authored API error (a well-formed `{ error: { code, message, status } }`
 * envelope). Safe to show `message` to a visitor. Any other failure (network error,
 * invalid JSON, etc.) propagates as its original error type instead of becoming an
 * ApiError, so callers can distinguish "the backend told us something" from
 * "something went wrong before/outside the backend's response".
 */
export class ApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
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
    if (errorBody?.error?.code && errorBody?.error?.message) {
      throw new ApiError(errorBody.error.code, errorBody.error.message, response.status);
    }
    throw new Error(`Request failed with status ${response.status}`);
  }

  return body as T;
}

export async function getProjects(
  params?: { category?: ProjectCategory; limit?: number },
): Promise<{ data: Project[]; meta: Meta }> {
  const url = new URL('/api/v1/projects', getApiBaseUrl());
  if (params?.category) {
    url.searchParams.set('category', params.category);
  }
  if (params?.limit) {
    url.searchParams.set('limit', String(params.limit));
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
  // Unlike the /api/v1/... calls above, this must NOT use `new URL(leadingSlashPath, base)`:
  // that constructor discards the base's own path entirely once the relative reference starts
  // with `/`, which is exactly what the /api/v1/... calls want (their explicit "/api/..." already
  // replaces whatever base path there is) but is wrong here. Storage has no such fixed prefix of
  // its own: locally NEXT_PUBLIC_API_BASE_URL is the app's own bare origin (storage:link serves
  // from that root, e.g. http://localhost:8000/storage/...), while in production it already
  // includes the real "/api" the app is physically nested under (see PUBLIC_DISK_ROOT in
  // backend/config/filesystems.php), so storage there is under THAT same root instead
  // (https://moi.bytechnum.com/api/storage/...). A plain concatenation preserves either base's
  // path as-is, which is what both cases need.
  const base = getApiBaseUrl().replace(/\/$/, '');
  return `${base}/storage/${path}`;
}

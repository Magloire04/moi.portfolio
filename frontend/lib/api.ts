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

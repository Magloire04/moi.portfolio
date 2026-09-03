import type { Project } from './types';

export type ProjectAccent = 'blue' | 'blue-dark';

const KICKER_LABEL = { fr: "Projet d'équipe", en: 'Team project' };

/**
 * The short label shown above a project's title (TECHNUM for an in-house
 * product, the client's name for a paid mandate, or a generic team-project
 * label when there is no single client to name).
 */
export function getProjectKicker(project: Project, locale: 'fr' | 'en'): string {
  switch (project.category) {
    case 'produit_bytechnum':
      return 'TECHNUM';
    case 'projet_equipe':
      return KICKER_LABEL[locale];
    case 'mandat_client':
    default:
      return project.clientName ?? '';
  }
}

/**
 * Picks one of the brand book's two blue tones for a project: TECHNUM Blue
 * (the primary accent) or TECHNUM Blue Dark (the "active state / contrast"
 * variant). There is no "tone" field on the Project model, so this is a
 * stable rotation by numeric id parity, not a read of editorial intent. If
 * per-project control ever matters, this should become a real field set
 * from the admin instead.
 */
export function getProjectAccent(project: { id: string }): ProjectAccent {
  return Number(project.id) % 2 === 0 ? 'blue' : 'blue-dark';
}

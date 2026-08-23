import type { Project } from './types';

export type ProjectAccent = 'signet' | 'bloom';

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
 * Picks one of the two brand accents for a project. There is no "tone" field
 * on the Project model, so this is a stable rotation by numeric id parity,
 * not a read of editorial intent. It happens to land Oeil 360° Finance
 * (id 2, the compliance-driven product) on Signet and Dis oui (id 3, the
 * playful one) on Bloom today, but it is not guaranteed to track a future
 * project's actual register. If per-project control ever matters, this
 * should become a real field set from the admin instead.
 */
export function getProjectAccent(project: { id: string }): ProjectAccent {
  return Number(project.id) % 2 === 0 ? 'signet' : 'bloom';
}

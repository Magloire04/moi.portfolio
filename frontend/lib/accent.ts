export type ProjectAccent = 'signet' | 'bloom';

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

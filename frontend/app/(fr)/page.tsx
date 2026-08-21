import { HomePage } from '@/components/pages/HomePage';
import { getProjects, getSettings } from '@/lib/api';

export default async function HomeRoute() {
  const [{ data: featured }, settings] = await Promise.all([
    getProjects({ category: 'produit_bytechnum' }),
    getSettings(),
  ]);

  return <HomePage locale="fr" featuredProjects={featured.filter((p) => p.featured)} settings={settings} />;
}

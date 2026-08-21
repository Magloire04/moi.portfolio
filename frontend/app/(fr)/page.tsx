import { HomePage } from '@/components/pages/HomePage';
import { getProjects, getSettings } from '@/lib/api';

export default async function HomeRoute() {
  const [{ data: featured }, settings] = await Promise.all([
    getProjects({ limit: 100 }),
    getSettings(),
  ]);

  return <HomePage locale="fr" featuredProjects={featured.filter((p) => p.featured)} settings={settings} />;
}

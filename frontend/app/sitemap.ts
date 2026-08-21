import type { MetadataRoute } from 'next';
import { getProjects } from '@/lib/api';
import { SITE_URL, STATIC_PAGE_PATH_PAIRS, getProjectPathPair } from '@/lib/routes';

// Required under `output: export` (static export): this route fetches data, so
// Next.js needs an explicit static-rendering marker instead of inferring it.
export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: projects } = await getProjects({ limit: 100 });

  const pathPairs = [
    ...Object.values(STATIC_PAGE_PATH_PAIRS),
    ...projects.map((project) => getProjectPathPair(project.slug)),
  ];

  // Every static page and every project slug gets its own entry in BOTH locales
  // (not just one canonical entry with alternates) so each indexable URL is listed.
  return pathPairs.flatMap(({ fr, en }) => {
    const frUrl = `${SITE_URL}${fr}`;
    const enUrl = `${SITE_URL}${en}`;
    const alternates = { languages: { fr: frUrl, en: enUrl } };

    return [
      { url: frUrl, alternates },
      { url: enUrl, alternates },
    ];
  });
}

import type { MetadataRoute } from 'next';
import { getProjects } from '@/lib/api';
import { SITE_URL } from '@/lib/routes';

// Required under `output: export` (static export): this route fetches data, so
// Next.js needs an explicit static-rendering marker instead of inferring it.
export const dynamic = 'force-static';

// Mirrors the FR_HREFS / EN_HREFS pairs in components/layout/Header.tsx.
// Trailing slashes match the actual static-export output (next.config.ts sets
// `trailingSlash: true`), so these are the canonical, redirect-free URLs.
const STATIC_PATH_PAIRS: Array<{ fr: string; en: string }> = [
  { fr: '/', en: '/en/' },
  { fr: '/services/', en: '/en/services/' },
  { fr: '/projets/', en: '/en/projects/' },
  { fr: '/a-propos/', en: '/en/about/' },
  { fr: '/contact/', en: '/en/contact/' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: projects } = await getProjects({ limit: 100 });

  const pathPairs = [
    ...STATIC_PATH_PAIRS,
    ...projects.map((project) => ({
      fr: `/projets/${project.slug}/`,
      en: `/en/projects/${project.slug}/`,
    })),
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

import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/routes';

// Required under `output: export` (static export) for this route to be picked up
// as a static file rather than erroring during the export.
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

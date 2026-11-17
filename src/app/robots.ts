import type { MetadataRoute } from 'next';
import { allowIndexing, siteUrl } from '@/lib/env';

export default function robots(): MetadataRoute.Robots {
  if (!allowIndexing()) return { rules: [{ userAgent: '*', disallow: '/' }] };
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api'] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}

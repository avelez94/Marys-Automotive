import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/env';
import { allServices } from '@/content/services';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const pages = ['', '/services', '/about', '/reviews', '/contact', '/request-a-quote', '/privacy'];
  return [
    ...pages.map((p) => ({ url: `${base}${p}`, changeFrequency: 'monthly' as const, priority: p === '' ? 1 : 0.7 })),
    ...allServices.map((s) => ({ url: `${base}/services/${s.slug}`, changeFrequency: 'monthly' as const, priority: 0.8 })),
  ];
}

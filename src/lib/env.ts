/** Central place for environment flags. Values are read at call time so builds stay flexible. */

export function vercelEnv(): 'production' | 'preview' | 'development' {
  const v = process.env.VERCEL_ENV;
  return v === 'production' || v === 'preview' ? v : 'development';
}

/**
 * Canonical origin for URLs, sitemap and Open Graph.
 * Set SITE_URL (for example https://marysautomotive.com) once the domain is reconnected.
 * Nothing else in the app needs to change.
 */
export function siteUrl(): string {
  const explicit = process.env.SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, '');
  if (vercelEnv() === 'production' && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

/** Search engines may index only the production deployment. Previews are always noindex. */
export function allowIndexing(): boolean {
  if (process.env.ALLOW_INDEXING === 'false') return false;
  return vercelEnv() === 'production';
}

/** Show "pending confirmation" markers on previews so unverified content is easy to review. */
export function showPendingMarkers(): boolean {
  const flag = process.env.SHOW_PENDING_MARKERS;
  if (flag === 'true') return true;
  if (flag === 'false') return false;
  return vercelEnv() !== 'production';
}

export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '',
};

export function supabaseConfigured(): boolean {
  return Boolean(supabaseConfig.url && supabaseConfig.publishableKey);
}

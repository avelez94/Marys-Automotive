import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { supabaseConfig, supabaseConfigured } from '@/lib/env';

/** Supabase client bound to the signed in user's cookies. Every query is subject to RLS. */
export async function supabaseServer() {
  if (!supabaseConfigured()) return null;
  const cookieStore = await cookies();
  return createServerClient(supabaseConfig.url, supabaseConfig.publishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component; the proxy refreshes the session instead.
        }
      },
    },
  });
}

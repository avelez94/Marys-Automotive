import 'server-only';
import { createClient } from '@supabase/supabase-js';

/**
 * Service role client. Bypasses RLS, so it is used only in server code paths that have already
 * validated input and checked authorization. The key never reaches the browser.
 */
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

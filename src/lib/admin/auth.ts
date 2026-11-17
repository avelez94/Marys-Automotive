import 'server-only';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';

/**
 * Server side gate for admin pages and actions. Confirms the session with Supabase Auth and
 * checks the admin allowlist through RLS. Anything else is redirected to the login page.
 */
export async function requireAdminPage() {
  const supabase = await supabaseServer();
  if (!supabase) return { supabase: null, user: null, configured: false as const };

  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect('/admin/login');

  const { data: row } = await supabase.from('admin_users').select('user_id').eq('user_id', data.user.id).maybeSingle();
  if (!row) redirect('/admin/login?denied=1');

  return { supabase, user: data.user, configured: true as const };
}

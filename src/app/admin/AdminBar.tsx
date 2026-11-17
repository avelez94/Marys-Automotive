'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/browser';

export function AdminBar({ email }: { email?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  async function signOut() {
    await supabaseBrowser()?.auth.signOut();
    router.replace('/admin/login');
    router.refresh();
  }
  const link = (href: string, label: string) => (
    <Link href={href} aria-current={pathname === href || (href !== '/admin' && pathname.startsWith(href)) ? 'page' : undefined}>
      {label}
    </Link>
  );
  return (
    <header className="admin-bar">
      <div className="admin-wrap admin-bar__inner">
        <span className="admin-bar__brand">
          Mary&rsquo;s <span>Automotive</span> <small>Shop Admin</small>
        </span>
        <nav aria-label="Admin">
          {link('/admin', 'Requests')}
          {link('/admin/invoice', 'Invoice')}
        </nav>
        <div className="admin-bar__user">
          {email ? <span className="admin-muted">{email}</span> : null}
          <button type="button" className="btn btn--sm btn--outline-light" onClick={signOut}>
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}

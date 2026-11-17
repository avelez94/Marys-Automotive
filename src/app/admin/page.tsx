import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAdminPage } from '@/lib/admin/auth';
import { STATUSES, STATUS_LABEL, fmtDateTime, isStatus, telFor, type QuoteRow } from '@/lib/admin/quotes';
import { AdminBar } from './AdminBar';
import { NotConfigured } from './NotConfigured';

export const metadata: Metadata = { title: 'Quote Requests' };
export const dynamic = 'force-dynamic';

type Search = { status?: string; q?: string };

export default async function AdminHome({ searchParams }: { searchParams: Promise<Search> }) {
  const { supabase, user, configured } = await requireAdminPage();
  if (!configured) return <NotConfigured />;

  const sp = await searchParams;
  const status = isStatus(sp.status) ? sp.status : undefined;
  const q = (sp.q ?? '').trim().slice(0, 80);

  let query = supabase
    .from('quote_requests')
    .select('id, created_at, updated_at, status, name, phone, email, preferred_contact, vehicle_year, vehicle_make, vehicle_model, mileage, service, description, source_page')
    .order('created_at', { ascending: false })
    .limit(200);
  if (status) query = query.eq('status', status);
  if (q) {
    // Escape LIKE wildcards so the search is literal.
    const literal = q.toLowerCase().replace(/[\\%_]/g, (c) => `\\${c}`);
    query = query.ilike('search_text', `%${literal}%`);
  }
  const { data, error } = await query;
  const rows = (data ?? []) as QuoteRow[];

  const { data: countRows } = await supabase.from('quote_requests').select('status');
  const counts = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<string, number>;
  (countRows ?? []).forEach((r: { status: string }) => (counts[r.status] = (counts[r.status] ?? 0) + 1));
  const total = (countRows ?? []).length;

  const href = (s?: string) => {
    const p = new URLSearchParams();
    if (s) p.set('status', s);
    if (q) p.set('q', q);
    const qs = p.toString();
    return qs ? `/admin?${qs}` : '/admin';
  };

  return (
    <>
      <AdminBar email={user.email} />
      <main className="admin-wrap admin-page">
        <div className="admin-head">
          <h1 className="admin-h1">Quote requests</h1>
          <form className="admin-search" role="search" action="/admin">
            {status ? <input type="hidden" name="status" value={status} /> : null}
            <label htmlFor="q" className="visually-hidden">Search requests</label>
            <input id="q" name="q" type="search" defaultValue={q} placeholder="Search name, phone, vehicle, problem" />
            <button className="btn btn--sm" type="submit">Search</button>
          </form>
        </div>

        <nav className="admin-tabs" aria-label="Filter by status">
          <Link href={href()} aria-current={!status ? 'page' : undefined}>All <span>{total}</span></Link>
          {STATUSES.map((s) => (
            <Link key={s} href={href(s)} aria-current={status === s ? 'page' : undefined} data-status={s}>
              {STATUS_LABEL[s]} <span>{counts[s]}</span>
            </Link>
          ))}
        </nav>

        {error ? <p className="form-alert form-alert--error">Could not load requests. Refresh to try again.</p> : null}

        {rows.length === 0 && !error ? (
          <div className="admin-empty">
            <p><strong>No requests here.</strong></p>
            <p className="admin-muted">{q ? 'Try a different search.' : 'New requests from the website will show up here.'}</p>
          </div>
        ) : (
          <ul className="q-list" role="list">
            {rows.map((r) => (
              <li key={r.id} className="q-item">
                <Link href={`/admin/quotes/${r.id}`} className="q-item__main">
                  <span className={`badge badge--${r.status}`}>{STATUS_LABEL[r.status]}</span>
                  <span className="q-item__name">{r.name}</span>
                  <span className="q-item__vehicle">
                    {[r.vehicle_year, r.vehicle_make, r.vehicle_model].filter(Boolean).join(' ')}
                    {r.service ? ` · ${r.service}` : ''}
                  </span>
                  <span className="q-item__desc">{r.description}</span>
                  <time className="q-item__time" dateTime={r.created_at}>{fmtDateTime(r.created_at)}</time>
                </Link>
                <a className="btn btn--sm btn--outline q-item__call" href={telFor(r.phone)} aria-label={`Call ${r.name}`}>
                  Call
                </a>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}

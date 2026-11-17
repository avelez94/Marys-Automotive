import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdminPage } from '@/lib/admin/auth';
import { STATUSES, STATUS_LABEL, fmtDateTime, smsFor, telFor, type QuoteRow } from '@/lib/admin/quotes';
import { AdminBar } from '../../AdminBar';
import { NotConfigured } from '../../NotConfigured';
import { addNote, updateStatus } from './actions';

export const metadata: Metadata = { title: 'Request' };
export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function QuoteDetail({ params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, configured } = await requireAdminPage();
  if (!configured) return <NotConfigured />;
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const [{ data }, { data: notes }] = await Promise.all([
    supabase.from('quote_requests').select('*').eq('id', id).maybeSingle(),
    supabase.from('quote_notes').select('id, body, created_at, author_id').eq('quote_id', id).order('created_at', { ascending: true }),
  ]);
  if (!data) notFound();
  const r = data as QuoteRow;
  const vehicle = [r.vehicle_year, r.vehicle_make, r.vehicle_model].filter(Boolean).join(' ');
  const prefer = { phone: 'Call', text: 'Text', email: 'Email' }[r.preferred_contact];

  return (
    <>
      <AdminBar email={user.email} />
      <main className="admin-wrap admin-page">
        <p><Link href="/admin" className="admin-back">← All requests</Link></p>
        <div className="admin-head">
          <div>
            <h1 className="admin-h1">{r.name}</h1>
            <p className="admin-muted">Submitted {fmtDateTime(r.created_at)}</p>
          </div>
          <span className={`badge badge--${r.status}`}>{STATUS_LABEL[r.status]}</span>
        </div>

        <div className="detail">
          <div className="detail__main">
            <section className="admin-card">
              <div className="btn-row">
                <a className="btn" href={telFor(r.phone)}>Call {r.phone}</a>
                <a className="btn btn--outline" href={smsFor(r.phone)}>Text</a>
                {r.email ? <a className="btn btn--outline" href={`mailto:${r.email}?subject=${encodeURIComponent("Your request with Mary's Automotive")}`}>Email</a> : null}
              </div>
              <p className="admin-muted" style={{ marginTop: '0.75rem' }}>Prefers: <strong>{prefer}</strong></p>
            </section>

            <section className="admin-card">
              <h2 className="admin-h2">The problem</h2>
              {r.service ? <p><strong>{r.service}</strong></p> : null}
              <p className="detail__desc">{r.description}</p>
            </section>

            <section className="admin-card">
              <h2 className="admin-h2">Internal notes</h2>
              <p className="admin-muted">Only visible to the shop.</p>
              {notes && notes.length ? (
                <ol className="notes" role="list">
                  {notes.map((n) => (
                    <li key={n.id}>
                      <time className="admin-muted">{fmtDateTime(n.created_at)}</time>
                      <p>{n.body}</p>
                    </li>
                  ))}
                </ol>
              ) : null}
              <form action={addNote} className="admin-form">
                <input type="hidden" name="id" value={r.id} />
                <div className="field">
                  <label htmlFor="note">Add a note</label>
                  <textarea id="note" name="body" maxLength={4000} required rows={3} />
                </div>
                <button className="btn btn--sm" type="submit">Save note</button>
              </form>
            </section>
          </div>

          <aside className="detail__side">
            <section className="admin-card">
              <h2 className="admin-h2">Status</h2>
              <form action={updateStatus} className="status-form">
                <input type="hidden" name="id" value={r.id} />
                {STATUSES.map((s) => (
                  <button key={s} type="submit" name="status" value={s} className={`status-btn ${s === r.status ? 'is-current' : ''}`} aria-pressed={s === r.status}>
                    {STATUS_LABEL[s]}
                  </button>
                ))}
              </form>
            </section>
            <section className="admin-card">
              <h2 className="admin-h2">Details</h2>
              <dl className="kv">
                <div><dt>Phone</dt><dd>{r.phone}</dd></div>
                <div><dt>Email</dt><dd>{r.email ?? 'Not provided'}</dd></div>
                <div><dt>Vehicle</dt><dd>{vehicle || 'Not provided'}</dd></div>
                <div><dt>Mileage</dt><dd>{r.mileage != null ? r.mileage.toLocaleString('en-US') : 'Not provided'}</dd></div>
                <div><dt>From page</dt><dd>{r.source_page ?? 'Unknown'}</dd></div>
                <div><dt>Updated</dt><dd>{fmtDateTime(r.updated_at)}</dd></div>
              </dl>
            </section>
          </aside>
        </div>
      </main>
    </>
  );
}

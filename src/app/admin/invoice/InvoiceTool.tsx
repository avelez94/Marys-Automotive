'use client';

/**
 * Port of the original invoice.html tool. Same fields, same PDF layout, same terms and the same
 * email flow, now sent with the signed in user's session so the API can verify access.
 */
import { useEffect, useMemo, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/browser';

// The original warranty terms name this entity. Confirm the correct legal name with the owner.
const WARRANTY_ENTITY = "Mary's Auto Transport";

type Line = { id: number; svc: string; parts: string; labor: string };
type Data = ReturnType<typeof collect>;

const money = (n: number) => '$' + n.toFixed(2);
const formatDate = (val: string) => {
  if (!val) return '';
  const [y, m, d] = val.split('-');
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[parseInt(m) - 1]} ${parseInt(d)}, ${y}`;
};
const localToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function collect(f: {
  name: string; phone: string; vehicle: string; odometer: string; email: string; date: string;
  wParts: string; wLabor: string; lines: Line[];
}) {
  const lines = f.lines
    .map((l) => {
      const parts = parseFloat(l.parts) || 0;
      const labor = parseFloat(l.labor) || 0;
      return { svc: l.svc.trim() || 'Service', parts, labor, total: parts + labor, keep: Boolean(l.svc.trim() || parts || labor) };
    })
    .filter((l) => l.keep);
  const partsTotal = lines.reduce((s, l) => s + l.parts, 0);
  const laborTotal = lines.reduce((s, l) => s + l.labor, 0);
  return {
    name: f.name.trim(), phone: f.phone.trim(), vehicle: f.vehicle.trim(), odometer: f.odometer.trim(),
    customerEmail: f.email.trim(), date: f.date, wParts: f.wParts || '___', wLabor: f.wLabor || '___',
    lines, partsTotal, laborTotal, grandTotal: partsTotal + laborTotal,
  };
}

const terms = (d: Data): [string, string][] => [
  ['Warranty Period', `This labor warranty is valid for ${d.wLabor} days from the date of service (${formatDate(d.date)}). This parts warranty is valid for ${d.wParts} days from the date of service (${formatDate(d.date)}).`],
  ['Coverage Scope', 'This warranty applies to any defects in materials or workmanship that arise during normal use of the serviced vehicle.'],
  ['Exclusions', `This warranty does not cover damage from accidents, misuse, or neglect including running vehicle hot; normal wear and tear; parts not supplied by ${WARRANTY_ENTITY}; or repairs made by parties other than ${WARRANTY_ENTITY}.`],
  ['Claims Procedure', `Customer must present original invoice and proof of routine maintenance. Claims must be reported within 7 days of discovering the issue. ${WARRANTY_ENTITY} reserves the right to inspect the vehicle to verify the claim.`],
  ['Resolution', `If a covered defect is found, ${WARRANTY_ENTITY} will repair or replace the defective part(s) or correct faulty workmanship at no additional cost. If repair or replacement is not feasible, a refund for the original cost may be provided.`],
  ['Limitations', `${WARRANTY_ENTITY} shall not be liable for any indirect, incidental, special, or consequential damages. Liability is limited solely to repair, replacement, or refund as outlined in this agreement.`],
  ['Transferability', 'This warranty is non-transferable and applies only to the original customer who received the service.'],
  ['Voiding', 'This warranty will be void if the vehicle is used for racing or competition; if the odometer has been tampered with; or if the customer fails to follow proper maintenance instructions.'],
  ['Governing Law', 'This warranty shall be governed by the laws of Indiana. Any disputes shall be resolved exclusively in the courts of Indiana.'],
];

async function buildPdf(d: Data): Promise<string> {
  const [{ jsPDF }, { autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const red: [number, number, number] = [138, 14, 24];
  const black: [number, number, number] = [17, 20, 24];
  const gray: [number, number, number] = [107, 114, 128];
  const lightGray: [number, number, number] = [243, 244, 246];
  const margin = 48;
  let y = 48;

  doc.setFontSize(20); doc.setFont('helvetica', 'bold'); doc.setTextColor(...black);
  doc.text("Mary's ", margin, y);
  const w = doc.getTextWidth("Mary's ");
  doc.setTextColor(...red); doc.text('Automotive', margin + w, y);

  doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(...gray);
  doc.text('3249 W Washington St, Indianapolis, IN 46222', margin, y + 16);
  doc.text('(317) 491-3393   marysautomotive.com', margin, y + 28);

  doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(...black);
  doc.text(formatDate(d.date), 560, y, { align: 'right' });

  y += 48; doc.setDrawColor(...black); doc.setLineWidth(1.5); doc.line(margin, y, 560, y); y += 18;

  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...gray); doc.text('BILL TO', margin, y);
  y += 14; doc.setFontSize(14); doc.setTextColor(...black); doc.text(d.name, margin, y);
  y += 14; doc.setFontSize(11); doc.setFont('helvetica', 'normal'); doc.setTextColor(...gray);
  if (d.phone) { doc.text(d.phone, margin, y); y += 13; }
  if (d.vehicle) { doc.setTextColor(...black); doc.setFont('helvetica', 'bold'); doc.text(d.vehicle, margin, y); doc.setFont('helvetica', 'normal'); doc.setTextColor(...gray); y += 13; }
  if (d.odometer) { doc.text('Odometer: ' + d.odometer, margin, y); y += 13; }
  y += 10;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Service', 'Parts', 'Labor', 'Line Total']],
    body: d.lines.map((l) => [l.svc, money(l.parts), money(l.labor), money(l.total)]),
    headStyles: { fillColor: lightGray, textColor: gray, fontStyle: 'bold', fontSize: 9, halign: 'left' },
    columnStyles: { 0: { halign: 'left' }, 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right', fontStyle: 'bold' } },
    bodyStyles: { fontSize: 11, textColor: black },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    styles: { cellPadding: 8 },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 16;

  const tx = 560;
  doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(...gray);
  doc.text('PARTS TOTAL', tx - 90, y, { align: 'right' }); doc.setTextColor(...black); doc.text(money(d.partsTotal), tx, y, { align: 'right' });
  y += 16; doc.setTextColor(...gray);
  doc.text('LABOR TOTAL', tx - 90, y, { align: 'right' }); doc.setTextColor(...black); doc.text(money(d.laborTotal), tx, y, { align: 'right' });
  y += 10; doc.setDrawColor(...black); doc.setLineWidth(1.5); doc.line(tx - 160, y, tx, y);
  y += 14; doc.setFontSize(13); doc.setTextColor(...gray); doc.text('GRAND TOTAL', tx - 90, y, { align: 'right' });
  doc.setTextColor(...black); doc.setFontSize(18); doc.text(money(d.grandTotal), tx, y, { align: 'right' });
  y += 28;

  const termsStartY = y;
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...black);
  doc.text('TERMS AND CONDITIONS', margin, y + 14);
  y += 28;
  const pageWidth = 560;
  const textWidth = pageWidth - margin - 16;
  for (const [title, body] of terms(d)) {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(...black); doc.text(title, margin + 8, y);
    y += 11; doc.setFont('helvetica', 'normal'); doc.setTextColor(...gray);
    const lines = doc.splitTextToSize(body, textWidth);
    doc.text(lines, margin + 8, y);
    y += lines.length * 11 + 4;
    if (y > 720) { doc.addPage(); y = 48; }
  }
  doc.setDrawColor(229, 231, 235); doc.setLineWidth(1); doc.rect(margin, termsStartY, pageWidth - margin, y - termsStartY + 8);

  y += 20; doc.setFont('helvetica', 'italic'); doc.setFontSize(9); doc.setTextColor(...gray);
  doc.text(`By accepting services from ${WARRANTY_ENTITY}, the customer acknowledges and agrees to these terms.`, margin, y);
  y += 24; doc.setDrawColor(229, 231, 235); doc.line(margin, y, 560, y);
  y += 14; doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...gray);
  doc.text('Thank you for your business! For inquiries contact us at (317) 491-3393.', doc.internal.pageSize.width / 2, y, { align: 'center' });

  return doc.output('datauristring').split(',')[1];
}

let nextId = 1;
const newLine = (): Line => ({ id: nextId++, svc: '', parts: '', labor: '' });

export function InvoiceTool() {
  const [f, setF] = useState({ name: '', phone: '', vehicle: '', odometer: '', email: '', date: '', wParts: '', wLabor: '' });
  const [lines, setLines] = useState<Line[]>(() => [newLine()]);
  const [view, setView] = useState<'form' | 'preview'>('form');
  const [status, setStatus] = useState<{ kind: 'idle' | 'busy' | 'sent' | 'error'; msg?: string }>({ kind: 'idle' });

  useEffect(() => setF((p) => ({ ...p, date: p.date || localToday() })), []);
  const d = useMemo(() => collect({ ...f, lines }), [f, lines]);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((p) => ({ ...p, [k]: e.target.value }));
  const setLine = (id: number, k: keyof Line) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setLines((ls) => ls.map((l) => (l.id === id ? { ...l, [k]: e.target.value } : l)));

  function preview() {
    if (!d.name) return setStatus({ kind: 'error', msg: 'Please enter the customer name.' });
    if (!d.lines.length) return setStatus({ kind: 'error', msg: 'Please add at least one service.' });
    setStatus({ kind: 'idle' });
    setView('preview');
    window.scrollTo({ top: 0 });
  }

  async function send() {
    if (!d.customerEmail) return setStatus({ kind: 'error', msg: 'Please enter the customer email address.' });
    const supabase = supabaseBrowser();
    const session = (await supabase?.auth.getSession())?.data.session;
    if (!session) return setStatus({ kind: 'error', msg: 'Your sign in expired. Refresh the page and sign in again.' });
    setStatus({ kind: 'busy', msg: 'Generating PDF…' });
    try {
      const pdfBase64 = await buildPdf(d);
      setStatus({ kind: 'busy', msg: 'Sending…' });
      const res = await fetch('/api/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ name: d.name, customerEmail: d.customerEmail, pdfBase64 }),
      });
      const result = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.ok) setStatus({ kind: 'sent', msg: `Invoice sent to ${d.customerEmail}.` });
      else setStatus({ kind: 'error', msg: result.error ?? 'Something went wrong. Please try again.' });
    } catch {
      setStatus({ kind: 'error', msg: 'Could not connect. Check your internet and try again.' });
    }
  }

  const alert = status.msg && status.kind !== 'idle' ? (
    <p className={`form-alert ${status.kind === 'error' ? 'form-alert--error' : 'form-alert--ok'}`} role={status.kind === 'error' ? 'alert' : 'status'}>
      {status.msg}
    </p>
  ) : null;

  if (view === 'preview') {
    return (
      <div className="invoice">
        <div className="admin-head">
          <h1 className="admin-h1">Invoice preview</h1>
        </div>
        <article className="inv-preview">
          <header className="inv-preview__head">
            <div>
              <p className="inv-shop">Mary&rsquo;s <span>Automotive</span></p>
              <p className="admin-muted">3249 W Washington St, Indianapolis, IN 46222<br />(317) 491-3393 · marysautomotive.com</p>
            </div>
            <p className="inv-date">{formatDate(d.date)}</p>
          </header>
          <p className="inv-label">Bill To</p>
          <p className="inv-customer">{d.name}</p>
          {d.phone ? <p className="admin-muted">{d.phone}</p> : null}
          {d.vehicle ? <p><strong>{d.vehicle}</strong></p> : null}
          {d.odometer ? <p className="admin-muted">Odometer: {d.odometer}</p> : null}
          <table className="inv-table">
            <thead>
              <tr><th>Service</th><th>Parts</th><th>Labor</th><th>Line Total</th></tr>
            </thead>
            <tbody>
              {d.lines.map((l, i) => (
                <tr key={i}><td>{l.svc}</td><td>{money(l.parts)}</td><td>{money(l.labor)}</td><td><strong>{money(l.total)}</strong></td></tr>
              ))}
            </tbody>
          </table>
          <dl className="inv-totals">
            <div><dt>Parts Total</dt><dd>{money(d.partsTotal)}</dd></div>
            <div><dt>Labor Total</dt><dd>{money(d.laborTotal)}</dd></div>
            <div className="inv-totals__grand"><dt>Grand Total</dt><dd>{money(d.grandTotal)}</dd></div>
          </dl>
          <section className="inv-terms">
            <h2>Terms and Conditions</h2>
            {terms(d).map(([t, b]) => (
              <p key={t}><strong>{t}.</strong> {b}</p>
            ))}
          </section>
        </article>
        {alert}
        <div className="btn-row no-print" style={{ marginTop: '1.5rem' }}>
          <button className="btn" onClick={send} disabled={status.kind === 'busy' || status.kind === 'sent'}>
            {status.kind === 'sent' ? 'Sent' : 'Send Invoice'}
          </button>
          <button className="btn btn--outline" onClick={() => window.print()}>Print</button>
          <button className="btn btn--outline" onClick={() => { setView('form'); setStatus({ kind: 'idle' }); }}>Edit Invoice</button>
        </div>
      </div>
    );
  }

  return (
    <div className="invoice">
      <div className="admin-head">
        <h1 className="admin-h1">Create an invoice</h1>
      </div>
      <section className="admin-card">
        <h2 className="admin-h2">Customer</h2>
        <div className="field-grid field-grid--2">
          <div className="field"><label htmlFor="c-name">Customer name</label><input id="c-name" value={f.name} onChange={set('name')} /></div>
          <div className="field"><label htmlFor="c-phone">Phone</label><input id="c-phone" type="tel" value={f.phone} onChange={set('phone')} /></div>
          <div className="field"><label htmlFor="c-vehicle">Vehicle</label><input id="c-vehicle" placeholder="2018 Toyota Camry" value={f.vehicle} onChange={set('vehicle')} /></div>
          <div className="field"><label htmlFor="c-date">Invoice date</label><input id="c-date" type="date" value={f.date} onChange={set('date')} /></div>
          <div className="field"><label htmlFor="c-odo">Odometer</label><input id="c-odo" placeholder="87,432 miles" value={f.odometer} onChange={set('odometer')} /></div>
          <div className="field"><label htmlFor="c-email">Customer email</label><input id="c-email" type="email" value={f.email} onChange={set('email')} /></div>
        </div>
      </section>

      <section className="admin-card">
        <h2 className="admin-h2">Services and charges</h2>
        <div className="inv-lines">
          {lines.map((l) => (
            <div className="inv-line" key={l.id}>
              <div className="field inv-line__svc"><label htmlFor={`svc-${l.id}`}>Service</label><input id={`svc-${l.id}`} placeholder="Brake pad replacement" value={l.svc} onChange={setLine(l.id, 'svc')} /></div>
              <div className="field"><label htmlFor={`p-${l.id}`}>Parts ($)</label><input id={`p-${l.id}`} type="number" min="0" step="0.01" inputMode="decimal" value={l.parts} onChange={setLine(l.id, 'parts')} /></div>
              <div className="field"><label htmlFor={`l-${l.id}`}>Labor ($)</label><input id={`l-${l.id}`} type="number" min="0" step="0.01" inputMode="decimal" value={l.labor} onChange={setLine(l.id, 'labor')} /></div>
              <button type="button" className="inv-line__remove" aria-label="Remove this service" disabled={lines.length === 1} onClick={() => setLines((ls) => ls.filter((x) => x.id !== l.id))}>×</button>
            </div>
          ))}
        </div>
        <button type="button" className="btn btn--outline btn--sm" onClick={() => setLines((ls) => [...ls, newLine()])}>+ Add service</button>
        <dl className="inv-totals">
          <div><dt>Parts Total</dt><dd>{money(d.partsTotal)}</dd></div>
          <div><dt>Labor Total</dt><dd>{money(d.laborTotal)}</dd></div>
          <div className="inv-totals__grand"><dt>Grand Total</dt><dd>{money(d.grandTotal)}</dd></div>
        </dl>
      </section>

      <section className="admin-card">
        <h2 className="admin-h2">Warranty terms</h2>
        <div className="field-grid field-grid--2">
          <div className="field"><label htmlFor="w-parts">Parts warranty (days)</label><input id="w-parts" type="number" min="0" placeholder="90" value={f.wParts} onChange={set('wParts')} /></div>
          <div className="field"><label htmlFor="w-labor">Labor warranty (days)</label><input id="w-labor" type="number" min="0" placeholder="30" value={f.wLabor} onChange={set('wLabor')} /></div>
        </div>
      </section>
      {alert}
      <div className="btn-row" style={{ marginTop: '1rem' }}>
        <button className="btn" onClick={preview}>Preview Invoice</button>
      </div>
    </div>
  );
}

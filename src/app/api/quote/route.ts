import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { business } from '@/content/business';
import { contactMethods, quoteServiceOptions } from '@/content/quote';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { mailer } from '@/lib/server/mailer';
import { siteUrl } from '@/lib/env';
import { clientIp, escapeHtml, hashKey, isSameOrigin, json, rateLimit, readJson } from '@/lib/server/security';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const currentYear = new Date().getFullYear();
const optionalText = (max: number) =>
  z.string().trim().max(max).optional().transform((v) => (v ? v : undefined));

const QuoteSchema = z
  .object({
    name: z.string().trim().min(2, 'Please enter your name.').max(120),
    phone: z
      .string()
      .trim()
      .max(32)
      .refine((v) => v.replace(/\D/g, '').length >= 10, 'Please enter a 10 digit phone number.'),
    email: z.union([z.literal(''), z.email('Please enter a valid email address.').max(254)]).optional(),
    preferredContact: z.enum(contactMethods, { error: 'Choose how we should reach you.' }),
    vehicleYear: z.coerce
      .number({ error: 'Enter the vehicle year.' })
      .int('Enter the vehicle year.')
      .min(1950, 'Enter a year between 1950 and now.')
      .max(currentYear + 1, 'Enter a year between 1950 and now.'),
    vehicleMake: z.string().trim().min(1, 'Please enter the make.').max(60),
    vehicleModel: z.string().trim().min(1, 'Please enter the model.').max(60),
    mileage: z
      .union([z.literal(''), z.coerce.number().int().min(0).max(2_000_000)], { error: 'Numbers only, for example 87500.' })
      .optional()
      .transform((v) => (v === '' || v === undefined ? undefined : v)),
    service: z.enum(quoteServiceOptions, { error: 'Choose the closest match.' }),
    description: z.string().trim().min(10, 'Please tell us a little more about the problem.').max(4000),
    sourcePage: optionalText(200),
    // Spam traps
    company: z.string().max(0).optional(),
    startedAt: z.coerce.number().int(),
  })
  .refine((d) => d.preferredContact !== 'email' || Boolean(d.email), {
    path: ['email'],
    message: 'Add an email address or choose another way to reach you.',
  });

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return json(403, { error: 'Forbidden.' });

  const ipKey = hashKey(clientIp(req));
  const [burst, daily] = await Promise.all([
    rateLimit(`quote:ip:${ipKey}:burst`, 4, 600),
    rateLimit(`quote:ip:${ipKey}:day`, 12, 86400),
  ]);
  if (burst === 'limited' || daily === 'limited') {
    return json(429, {
      error: `We've received several requests from this connection. Please call us at ${business.phone.display}.`,
    });
  }

  const body = await readJson(req, 20_000);
  if (body === 'too_large' || body === 'invalid') {
    return json(400, { error: 'The request could not be read. Please try again.' });
  }

  const parsed = QuoteSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form');
      if (key === 'company' || key === 'startedAt') continue;
      fieldErrors[key] ??= issue.message;
    }
    // A filled honeypot or impossible timing: pretend success so bots learn nothing.
    if (parsed.error.issues.some((i) => i.path[0] === 'company')) return json(200, { success: true });
    return json(422, { error: 'Please check the highlighted fields.', fieldErrors });
  }

  const d = parsed.data;
  const elapsed = Date.now() - d.startedAt;
  if (elapsed < 4000 || elapsed > 1000 * 60 * 60 * 12) return json(200, { success: true });

  const record = {
    name: d.name,
    phone: d.phone,
    email: d.email || null,
    preferred_contact: d.preferredContact,
    vehicle_year: d.vehicleYear,
    vehicle_make: d.vehicleMake,
    vehicle_model: d.vehicleModel,
    mileage: d.mileage ?? null,
    service: d.service,
    description: d.description,
    source_page: d.sourcePage ?? null,
  };

  const db = supabaseAdmin();
  let id: string | null = null;
  if (db) {
    const { data, error } = await db.from('quote_requests').insert(record).select('id').single();
    if (error) console.error('quote insert failed', error.message);
    else id = data.id;
  }

  const notified = await notifyShop(record, id);
  if (id && notified && db) {
    await db.from('quote_requests').update({ notified_at: new Date().toISOString() }).eq('id', id);
  }

  if (!id && !notified) {
    return json(503, {
      error: `We couldn't send your request right now. Please call us at ${business.phone.display}.`,
    });
  }
  return json(200, { success: true });
}

async function notifyShop(r: Record<string, unknown>, id: string | null): Promise<boolean> {
  const resend = mailer();
  const from = process.env.FROM_EMAIL;
  const to = process.env.QUOTE_NOTIFY_EMAIL || process.env.SHOP_EMAIL;
  if (!resend || !from || !to) return false;

  const rows: [string, unknown][] = [
    ['Name', r.name],
    ['Phone', r.phone],
    ['Email', r.email ?? 'Not provided'],
    ['Prefers', r.preferred_contact],
    ['Vehicle', `${r.vehicle_year} ${r.vehicle_make} ${r.vehicle_model}`],
    ['Mileage', r.mileage ?? 'Not provided'],
    ['Service', r.service],
  ];
  const link = id ? `${siteUrl()}/admin/quotes/${id}` : null;
  const html = `<h2 style="font-family:Arial,sans-serif">New quote request</h2>
<table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">
${rows.map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#555">${escapeHtml(k)}</td><td style="padding:4px 0"><strong>${escapeHtml(v)}</strong></td></tr>`).join('\n')}
</table>
<p style="font-family:Arial,sans-serif;font-size:14px;white-space:pre-wrap">${escapeHtml(r.description)}</p>
${link ? `<p style="font-family:Arial,sans-serif"><a href="${escapeHtml(link)}">Open in the dashboard</a></p>` : '<p style="font-family:Arial,sans-serif;color:#b6282e">This request was not saved to the dashboard. Keep this email.</p>'}`;

  const { error } = await resend.emails.send({
    from,
    to: [to],
    replyTo: typeof r.email === 'string' ? r.email : undefined,
    subject: `Quote request: ${String(r.vehicle_year)} ${String(r.vehicle_make)} ${String(r.vehicle_model)}`.replace(/[\r\n]+/g, ' ').slice(0, 120),
    html,
  });
  if (error) console.error('quote notification failed', error.message);
  return !error;
}

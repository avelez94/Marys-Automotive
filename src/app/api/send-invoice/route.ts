import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { business, fullAddress } from '@/content/business';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { mailer, shopRecipients } from '@/lib/server/mailer';
import {
  clientIp,
  escapeHtml,
  hashKey,
  isSameOrigin,
  json,
  rateLimit,
  readJson,
  requireAdmin,
} from '@/lib/server/security';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 5_500_000; // base64 overhead on a 4 MB PDF
const MAX_PDF_BYTES = 4_000_000;

const InvoiceSchema = z.object({
  name: z.string().trim().min(1).max(120),
  customerEmail: z.email().max(254),
  pdfBase64: z
    .string()
    .min(100)
    .max(MAX_BODY_BYTES)
    .regex(/^[A-Za-z0-9+/]+={0,2}$/, 'Invalid attachment encoding'),
});

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return json(403, { error: 'Forbidden.' });

  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const [perUser, perIp] = await Promise.all([
    rateLimit(`invoice:user:${auth.userId}`, 30, 3600),
    rateLimit(`invoice:ip:${hashKey(clientIp(req))}`, 60, 3600),
  ]);
  if (perUser !== 'allowed' || perIp !== 'allowed') {
    // Fail closed: invoices go out under the shop's name, so never send without a working limiter.
    return json(429, { error: 'Too many invoices sent in a short time. Please wait and try again.' });
  }

  const body = await readJson(req, MAX_BODY_BYTES);
  if (body === 'too_large') return json(413, { error: 'The invoice file is too large.' });
  if (body === 'invalid') return json(400, { error: 'The request could not be read.' });

  const parsed = InvoiceSchema.safeParse(body);
  if (!parsed.success) {
    return json(400, { error: 'Please check the customer name and email address.' });
  }
  const { name, customerEmail, pdfBase64 } = parsed.data;

  const pdf = Buffer.from(pdfBase64, 'base64');
  if (pdf.length === 0 || pdf.length > MAX_PDF_BYTES || pdf.subarray(0, 5).toString('latin1') !== '%PDF-') {
    return json(400, { error: 'The attachment is not a valid invoice PDF.' });
  }

  const resend = mailer();
  const from = process.env.FROM_EMAIL;
  if (!resend || !from) return json(503, { error: 'Email is not configured.' });

  const safeFileName = name.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 60) || 'Customer';
  const db = supabaseAdmin();

  const { data, error } = await resend.emails.send({
    from,
    to: [customerEmail],
    cc: shopRecipients(),
    subject: `Your Invoice from ${business.name}`,
    html: `<p>Hi ${escapeHtml(name)},</p>
<p>Please find your invoice attached.</p>
<p>Thank you for choosing ${escapeHtml(business.name)}.<br>${escapeHtml(business.phone.display)}<br>${escapeHtml(fullAddress)}</p>`,
    text: `Hi ${name},\n\nPlease find your invoice attached.\n\nThank you for choosing ${business.name}.\n${business.phone.display}\n${fullAddress}`,
    attachments: [{ filename: `Marys_Automotive_Invoice_${safeFileName}.pdf`, content: pdf }],
  });

  await db
    ?.from('invoice_sends')
    .insert({
      sent_by: auth.userId,
      recipient: customerEmail,
      customer_name: name,
      status: error ? 'failed' : 'sent',
      provider_id: data?.id ?? null,
      error: error ? String(error.message).slice(0, 500) : null,
    })
    .then(({ error: logError }) => logError && console.error('invoice log failed', logError.message));

  if (error) {
    console.error('invoice send failed', error.message);
    return json(502, { error: 'The email could not be sent. Please try again.' });
  }
  return json(200, { success: true });
}

export function GET() {
  return json(405, { error: 'Method not allowed.' }, { Allow: 'POST' });
}

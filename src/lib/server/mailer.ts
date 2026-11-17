import 'server-only';
import { Resend } from 'resend';

export function mailer(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

export function shopRecipients(): string[] {
  return [process.env.SHOP_EMAIL, process.env.INVOICE_STORAGE].filter((v): v is string => Boolean(v));
}

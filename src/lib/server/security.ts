import 'server-only';
import { createHash } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
}

export function json(status: number, body: Record<string, unknown>, headers?: HeadersInit) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
}

export function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}

/** One way hash so raw IP addresses are never stored. */
export function hashKey(value: string): string {
  const salt = process.env.RATE_LIMIT_SALT ?? 'marys-automotive';
  return createHash('sha256').update(`${salt}:${value}`).digest('hex').slice(0, 32);
}

/**
 * Reject cross site requests. Browsers always send Origin on POST from fetch, so a mismatch
 * means another site is trying to call this endpoint.
 */
export function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return false;
  try {
    const o = new URL(origin);
    const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
    return o.host === host;
  } catch {
    return false;
  }
}

export type RateResult = 'allowed' | 'limited' | 'unavailable';

/** Fixed window rate limit backed by Postgres, shared across serverless instances. */
export async function rateLimit(bucket: string, max: number, windowSeconds: number): Promise<RateResult> {
  const db = supabaseAdmin();
  if (!db) return 'unavailable';
  const { data, error } = await db.rpc('check_rate_limit', {
    p_bucket: bucket,
    p_max: max,
    p_window_seconds: windowSeconds,
  });
  if (error) {
    console.error('rate limit check failed', error.message);
    return 'unavailable';
  }
  return data === true ? 'allowed' : 'limited';
}

/** Read a JSON body with a hard size cap, without trusting Content-Length alone. */
export async function readJson(req: NextRequest, maxBytes: number): Promise<unknown | 'too_large' | 'invalid'> {
  const declared = Number(req.headers.get('content-length') ?? '0');
  if (declared > maxBytes) return 'too_large';
  const text = await req.text();
  if (Buffer.byteLength(text) > maxBytes) return 'too_large';
  try {
    return JSON.parse(text);
  } catch {
    return 'invalid';
  }
}

export type AdminCheck =
  | { ok: true; userId: string; email: string | undefined }
  | { ok: false; response: NextResponse };

/**
 * Authenticate with a Supabase access token (Authorization: Bearer) and authorize against the
 * admin_users allowlist. Bearer tokens are not sent automatically by browsers, so this is CSRF safe.
 */
export async function requireAdmin(req: NextRequest): Promise<AdminCheck> {
  const db = supabaseAdmin();
  if (!db) return { ok: false, response: json(503, { error: 'Service is not configured.' }) };

  const header = req.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) return { ok: false, response: json(401, { error: 'Please sign in again.' }) };

  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) return { ok: false, response: json(401, { error: 'Please sign in again.' }) };

  const { data: row, error: adminError } = await db
    .from('admin_users')
    .select('user_id')
    .eq('user_id', data.user.id)
    .maybeSingle();
  if (adminError) return { ok: false, response: json(503, { error: 'Could not verify access.' }) };
  if (!row) return { ok: false, response: json(403, { error: 'This account does not have access.' }) };

  return { ok: true, userId: data.user.id, email: data.user.email };
}

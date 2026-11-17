'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/browser';

function safeNext(value: string | null): string {
  // Only allow redirects back into the admin area of this site.
  if (value && /^\/admin(\/[A-Za-z0-9/_-]*)?$/.test(value) && value !== '/admin/login') return value;
  return '/admin';
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState(params.get('denied') ? 'This account does not have access to the shop admin.' : '');
  const [busy, setBusy] = useState(false);
  const supabase = supabaseBrowser();

  if (!supabase) {
    return <p className="admin-muted">Sign in is not configured for this deployment yet.</p>;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const fd = new FormData(e.currentTarget);
    const { error: authError } = await supabase!.auth.signInWithPassword({
      email: String(fd.get('email') ?? '').trim(),
      password: String(fd.get('password') ?? ''),
    });
    if (authError) {
      setBusy(false);
      setError('That email and password did not match. Try again.');
      return;
    }
    router.replace(safeNext(params.get('next')));
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="admin-form">
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {error ? (
        <p className="form-alert form-alert--error" role="alert">
          {error}
        </p>
      ) : null}
      <button className="btn" type="submit" disabled={busy} style={{ width: '100%' }}>
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}

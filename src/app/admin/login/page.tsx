import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <main className="admin-login">
      <div className="admin-login__card">
        <p className="admin-bar__brand admin-bar__brand--dark">
          Mary&rsquo;s <span>Automotive</span> <small>Shop Admin</small>
        </p>
        <h1 className="admin-h1">Sign in</h1>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}

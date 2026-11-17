import type { Metadata } from 'next';
import './admin.css';

export const metadata: Metadata = {
  title: { default: 'Shop Admin', template: '%s | Shop Admin' },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin">{children}</div>;
}

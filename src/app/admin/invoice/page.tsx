import type { Metadata } from 'next';
import { requireAdminPage } from '@/lib/admin/auth';
import { AdminBar } from '../AdminBar';
import { NotConfigured } from '../NotConfigured';
import { InvoiceTool } from './InvoiceTool';

export const metadata: Metadata = { title: 'Invoice' };
export const dynamic = 'force-dynamic';

export default async function InvoicePage() {
  const { configured, user } = await requireAdminPage();
  if (!configured) return <NotConfigured />;
  return (
    <>
      <AdminBar email={user.email} />
      <main className="admin-wrap admin-page">
        <InvoiceTool />
      </main>
    </>
  );
}

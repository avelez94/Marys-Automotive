import type { Metadata } from 'next';
import { QuoteSection, ServicesOverview } from '@/components/Sections';
import { PageHead } from '@/components/PageHead';

export const metadata: Metadata = {
  title: 'Auto Repair Services',
  description:
    'Oil changes, brakes, tires and alignments, diagnostics, electrical, AC and heating, transmission and exhaust service in Indianapolis.',
  alternates: { canonical: '/services' },
};

export default function ServicesPage() {
  return (
    <>
      <PageHead
        spec="Services"
        title="Full service auto repair."
        lead="Maintenance, diagnostics and repairs for domestic and foreign vehicles at our shop on West Washington Street."
      />
      <ServicesOverview />
      <QuoteSection sourcePage="/services" />
    </>
  );
}

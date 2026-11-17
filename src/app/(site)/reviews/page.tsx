import type { Metadata } from 'next';
import { PageHead } from '@/components/PageHead';
import { Reviews, QuoteSection } from '@/components/Sections';

export const metadata: Metadata = {
  title: 'Customer Reviews',
  description: "What customers say about Mary's Automotive in Indianapolis.",
  alternates: { canonical: '/reviews' },
};

export default function ReviewsPage() {
  return (
    <>
      <PageHead spec="Reviews" title="From our customers." lead="We only publish reviews we can point to a real source for." />
      <Reviews />
      <QuoteSection sourcePage="/reviews" />
    </>
  );
}

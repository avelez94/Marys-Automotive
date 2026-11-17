import type { Metadata } from 'next';
import { Faq, QuoteSection } from '@/components/Sections';

export const metadata: Metadata = {
  title: 'Request a Quote',
  description: "Send Mary's Automotive a repair request. Tell us about your vehicle and the problem and we'll get back to you.",
  alternates: { canonical: '/request-a-quote' },
};

export default function QuotePage() {
  return (
    <>
      <QuoteSection headingLevel={1} sourcePage="/request-a-quote" />
      <Faq />
    </>
  );
}

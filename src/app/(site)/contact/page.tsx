import type { Metadata } from 'next';
import { Faq, QuoteSection, Visit } from '@/components/Sections';

export const metadata: Metadata = {
  title: 'Contact and Directions',
  description: "Call, text or visit Mary's Automotive at 3249 W Washington St, Indianapolis, IN 46222. (317) 491-3393.",
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <>
      <Visit headingLevel={1} />
      <QuoteSection sourcePage="/contact" />
      <Faq />
    </>
  );
}

import type { Metadata } from 'next';
import { Faq, Hero, Process, QuoteSection, Reviews, ServicesOverview, Story, TrustStrip, Visit, WhyUs } from '@/components/Sections';

export const metadata: Metadata = { alternates: { canonical: '/' } };

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <ServicesOverview />
      <WhyUs />
      <Story />
      <Process />
      <Reviews />
      <QuoteSection />
      <Faq />
      <Visit />
    </>
  );
}

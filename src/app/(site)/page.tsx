import { Faq, Hero, Process, QuoteSection, Reviews, ServicesOverview, Story, TrustStrip, Visit, WhyUs } from '@/components/Sections';

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

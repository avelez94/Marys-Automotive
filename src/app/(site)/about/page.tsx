import type { Metadata } from 'next';
import { PageHead } from '@/components/PageHead';
import { Process, Story, Visit } from '@/components/Sections';

export const metadata: Metadata = {
  title: 'About the Shop',
  description: "Mary's Automotive is a family auto repair shop on West Washington Street in Indianapolis, in business since 1994.",
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <>
      <PageHead spec="About" title="Honest work, since 1994." lead="A family auto repair shop on the west side of Indianapolis." />
      <Story />
      <Process />
      <Visit />
    </>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { serviceGroups } from '@/content/services';
import { PageHead } from '@/components/PageHead';
import { QuoteSection } from '@/components/Sections';
import { Pending } from '@/components/Pending';
import { ArrowIcon } from '@/components/Icons';

type Params = { slug: string };

function find(slug: string) {
  for (const g of serviceGroups) {
    const s = g.services.find((x) => x.slug === slug);
    if (s) return { group: g, service: s };
  }
  return null;
}

export function generateStaticParams(): Params[] {
  return serviceGroups.flatMap((g) => g.services.map((s) => ({ slug: s.slug })));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const hit = find((await params).slug);
  if (!hit) return {};
  return {
    title: `${hit.service.name} in Indianapolis`,
    description: `${hit.service.summary} ${hit.service.name} at Mary's Automotive, 3249 W Washington St, Indianapolis.`,
    alternates: { canonical: `/services/${hit.service.slug}` },
  };
}

export default async function ServicePage({ params }: { params: Promise<Params> }) {
  const hit = find((await params).slug);
  if (!hit) notFound();
  const { group, service } = hit;
  const related = group.services.filter((s) => s.slug !== service.slug);
  return (
    <>
      <PageHead spec={`${group.code} / ${group.title}`} title={service.name} lead={service.summary}>
        <Pending block note="Full service page (symptoms, what to expect, next steps) is written in the next stage." />
      </PageHead>
      {related.length ? (
        <section className="section tone-ivory">
          <div className="container">
            <p className="spec">Related</p>
            <ul className="ro-lines" role="list" style={{ maxWidth: '48rem' }}>
              {related.map((s) => (
                <li className="ro-line" key={s.slug}>
                  <Link href={`/services/${s.slug}`}>
                    <span className="ro-line__name">{s.name}</span>
                    <span className="ro-line__sum">{s.summary}</span>
                    <span className="ro-line__go" aria-hidden="true">
                      <ArrowIcon />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
      <QuoteSection sourcePage={`/services/${service.slug}`} />
    </>
  );
}

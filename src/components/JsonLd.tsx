import { business } from '@/content/business';
import { siteUrl } from '@/lib/env';

/**
 * AutoRepair structured data built only from confirmed facts.
 * No aggregateRating or review markup: self published ratings are not eligible and the old
 * rating could not be traced to a source. Hours are added once confirmed.
 */
export function LocalBusinessJsonLd() {
  const url = siteUrl();
  const data = {
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    '@id': `${url}/#business`,
    name: business.name,
    url,
    telephone: business.phone.e164,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address.street,
      addressLocality: business.address.city,
      addressRegion: business.address.region,
      postalCode: business.address.postalCode,
      addressCountry: business.address.country,
    },
    areaServed: { '@type': 'City', name: 'Indianapolis' },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}

/**
 * Single source of truth for business facts.
 *
 * `verified: false` marks a claim carried over from the old site that the owner has not confirmed.
 * Unverified claims either stay off the page or render with a "pending confirmation" marker on
 * previews (see components/Pending.tsx). Flip a flag to true once the owner confirms it.
 */

export const business = {
  name: "Mary's Automotive",
  /** Old invoice terms say "Mary's Auto Transport". Legal name needs confirmation. */
  legalNameConfirmed: false,
  tagline: 'Honest Work. Since 1994.',
  foundedYear: 1994,
  phone: {
    display: '(317) 491-3393',
    e164: '+13174913393',
  },
  /** Old site advertised texting. Confirm the number accepts SMS. */
  smsConfirmed: false,
  address: {
    street: '3249 W Washington St',
    city: 'Indianapolis',
    region: 'IN',
    postalCode: '46222',
    country: 'US',
  },
  /** Approximate pin for the map embed; the embed searches by address. */
  directionsUrl:
    'https://www.google.com/maps/dir/?api=1&destination=3249+W+Washington+St,+Indianapolis,+IN+46222',
  mapEmbedUrl:
    'https://www.google.com/maps?q=3249+W+Washington+St,+Indianapolis,+IN+46222&output=embed',
  /** Null until the owner confirms real hours. Do not publish "24/7". */
  hours: null as null | { days: string; time: string }[],
  /** Set to the shop's real Google review link once the Business Profile is confirmed. */
  googleReviewUrl: null as string | null,
} as const;

export const claims = {
  since1994: { text: 'Since 1994', verified: false },
  familyOwned: { text: 'Family owned', verified: false },
  domesticForeign: { text: 'Domestic and foreign vehicles', verified: false },
  notAFranchise: { text: 'Independent, not a franchise', verified: false },
  estimateFirst: { text: 'Estimate reviewed with you before work begins', verified: false },
  // Not used anywhere until confirmed with a source:
  rating: { text: '5.0 rating', verified: false },
  customersServed: { text: '1,000+ customers served', verified: false },
  open247: { text: 'Open 24/7', verified: false },
  sameDay: { text: 'Same day service', verified: false },
} as const;

/** Verified customer reviews only. Each entry needs a source the owner can point to. */
export const reviews: { quote: string; author: string; source: string; url?: string }[] = [];

export const telHref = `tel:${business.phone.e164}`;
export const smsHref = `sms:${business.phone.e164}`;
export const fullAddress = `${business.address.street}, ${business.address.city}, ${business.address.region} ${business.address.postalCode}`;

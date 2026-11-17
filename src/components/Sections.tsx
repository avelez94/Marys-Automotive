import Link from 'next/link';
import { business, claims, fullAddress, reviews, smsHref, telHref } from '@/content/business';
import { serviceGroups } from '@/content/services';
import { photos } from '@/content/photos';
import { faqs } from '@/content/faq';
import { Photo, PhotoSlot } from './Photo';
import { Pending, PreviewOnly } from './Pending';
import { Spec } from './Spec';
import { QuoteForm } from './QuoteForm';
import { ArrowIcon, PhoneIcon, PinIcon, PlusIcon, TextIcon } from './Icons';

/* ─────────────────────────── Hero ─────────────────────────── */
export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <Photo photo={photos.heroHands} sizes="100vw" priority className="hero__media" />
      <div className="hero__shade" aria-hidden="true" />
      <div className="container hero__inner">
        <Spec plain>Full Service Auto Repair · Indianapolis</Spec>
        <h1 id="hero-title" className="display hero__title">
          Honest Work. <em>Since 1994.</em>
        </h1>
        <p className="hero__lead">
          Full service auto repair for domestic and foreign vehicles, on West Washington Street in Indianapolis.
          Tell us what&rsquo;s going on and we&rsquo;ll take it from there.
        </p>
        <div className="btn-row">
          <Link className="btn" href="/request-a-quote">
            Request a Quote <ArrowIcon />
          </Link>
          <a className="btn btn--outline-light" href={telHref}>
            <PhoneIcon /> Call {business.phone.display}
          </a>
        </div>
        <div className="hero__meta">
          <span>
            <PinIcon width={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />
            <a href={business.directionsUrl} target="_blank" rel="noopener noreferrer">
              {fullAddress}
            </a>
          </span>
          <span>
            Hours: <a href={telHref}>call for current hours</a>
            <Pending note="Hours" />
          </span>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Trust strip ─────────────────────────── */
export function TrustStrip() {
  const items = [
    { k: 'Established', v: '1994', claim: claims.since1994 },
    { k: 'Ownership', v: 'Family owned', claim: claims.familyOwned },
    { k: 'We work on', v: 'Domestic and foreign', claim: claims.domesticForeign },
    { k: 'Find us', v: 'W Washington St', claim: null },
  ];
  return (
    <section className="trust" aria-label="About the shop at a glance">
      <div className="container">
        <ul>
          {items.map((i) => (
            <li key={i.k}>
              <span className="trust__k">{i.k}</span>
              <span className="trust__v">
                {i.v}
                {i.claim && !i.claim.verified ? <Pending note="Confirm" /> : null}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ─────────────────────────── Services ─────────────────────────── */
export function ServicesOverview({ headingLevel = 2 }: { headingLevel?: 1 | 2 }) {
  const H = headingLevel === 1 ? 'h1' : 'h2';
  return (
    <section className="section tone-ivory" aria-labelledby="services-title" id="services">
      <div className="container services__layout">
        <div className="services__head">
          <Spec code="01">Services</Spec>
          <H id="services-title" className="display h2">
            What can we help with?
          </H>
          <p className="lead">
            From routine maintenance to the problem you can&rsquo;t quite describe. Pick the closest match, or just
            tell us what the car is doing.
          </p>
          <Link className="link-arrow" href="/request-a-quote">
            Not sure? Describe the problem <ArrowIcon />
          </Link>
          <Photo photo={photos.tire} sizes="(min-width: 1000px) 40vw, 1px" className="services__photo" />
        </div>

        <div>
          {serviceGroups.map((g) => (
            <div className="ro-group" key={g.code} id={`group-${g.code}`} data-reveal>
              <div className="ro-group__head">
                <span className="ro-group__code">{g.code}</span>
                <h3 className="h3">{g.title}</h3>
                <p className="ro-group__intro">{g.intro}</p>
              </div>
              <ul className="ro-lines" role="list">
                {g.services.map((s) => (
                  <li className="ro-line" key={s.slug} id={s.slug}>
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
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Why Mary's ─────────────────────────── */
export function WhyUs() {
  const points = [
    {
      n: '01',
      t: 'Straight answers',
      d: 'We tell you what your car needs and what it costs, in plain language.',
      claim: claims.estimateFirst,
    },
    {
      n: '02',
      t: 'Estimate before the work',
      d: 'You see the estimate and decide before any repair begins.',
      claim: claims.estimateFirst,
    },
    {
      n: '03',
      t: 'A local shop, not a franchise',
      d: 'A neighborhood shop on the west side, family owned and independent.',
      claim: claims.notAFranchise,
    },
    {
      n: '04',
      t: 'Domestic and foreign',
      d: 'Domestic and foreign makes and models.',
      claim: claims.domesticForeign,
    },
  ];
  return (
    <section className="section tone-dark" aria-labelledby="why-title">
      <div className="container split split--reverse">
        <Photo
          photo={photos.underHood}
          sizes="(min-width: 960px) 50vw, 100vw"
          className="split__media"
        />
        <div data-reveal>
          <Spec code="02">Why Mary&rsquo;s</Spec>
          <h2 id="why-title" className="display h2" style={{ marginTop: '1.25rem' }}>
            No runaround. Just the work.
          </h2>
          <p className="lead" style={{ marginTop: '1.25rem' }}>
            Most people don&rsquo;t want to become car experts. They want someone they can trust to look at it,
            explain it plainly and fix it right.
          </p>
          <ul className="checklist" role="list">
            {points.map((p) => (
              <li key={p.n}>
                <span className="checklist__n">{p.n}</span>
                <h3>
                  {p.t}
                  {!p.claim.verified ? <Pending /> : null}
                </h3>
                <p>{p.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Our Story ─────────────────────────── */
export function Story() {
  return (
    <section className="section tone-ivory" aria-labelledby="story-title">
      <div className="container story">
        <div>
          <p className="story__year" aria-hidden="true">
            1994
          </p>
          <ol className="timeline" role="list">
            <li>
              <strong>1994</strong>
              Mary&rsquo;s Automotive opens in Indianapolis.
            </li>
            <li>
              <strong>Today</strong>
              Still a family shop, at {business.address.street}.
            </li>
          </ol>
          <Pending block note="Owner name, shop history and milestones for the timeline." />
        </div>
        <div className="story__body" data-reveal>
          <Spec code="03">Our Story</Spec>
          <h2 id="story-title" className="display h2">
            A west side shop, for over thirty years.
          </h2>
          <div className="lead prose">
            <p>
              Mary&rsquo;s Automotive has been fixing cars in Indianapolis since 1994. It&rsquo;s a family shop,
              not a franchise.
            </p>
            <p>The rest of this story is being written with the owner. Real photos of the shop are on the way.</p>
          </div>
          <div className="story__photos">
            <PhotoSlot label="Owner portrait" />
            <PhotoSlot label="Shop exterior" />
            <PhotoSlot label="In the bays" />
          </div>
          <div style={{ marginTop: '2rem' }}>
            <Link className="link-arrow" href="/about">
              More about the shop <ArrowIcon />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── How it works ─────────────────────────── */
export function Process() {
  const steps = [
    { t: 'Tell us what’s going on', d: 'Call, text or send a request. Describe the noise, the light or the feel. Rough is fine.' },
    { t: 'Get your vehicle evaluated', d: 'Bring the car in and we look it over to find what is actually causing the problem.' },
    { t: 'Review the estimate', d: 'We walk you through what we found and what the repair will cost.' },
    { t: 'Approve the repair', d: 'Nothing gets fixed until you say yes. Then we get to work.' },
  ];
  return (
    <section className="section tone-dark" aria-labelledby="process-title">
      <div className="container">
        <div className="section-head" data-reveal>
          <Spec code="04">How It Works</Spec>
          <h2 id="process-title" className="display h2">
            Four steps. No surprises.
          </h2>
          <Pending block note="Confirm these steps match how the shop works, including any diagnostic fee." />
        </div>
        <ol className="steps" role="list">
          {steps.map((s, i) => (
            <li className="step" key={s.t} data-reveal>
              <span className="step__n" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="h3">
                <span className="visually-hidden">Step {i + 1}: </span>
                {s.t}
              </h3>
              <p>{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ─────────────────────────── Reviews ─────────────────────────── */
export function Reviews() {
  const hasReviews = reviews.length > 0;
  if (!hasReviews && !business.googleReviewUrl) {
    // Nothing verified to show: hide in production, show the empty slot on previews.
    return (
      <PreviewOnly>
        <section className="section tone-white" aria-labelledby="reviews-title">
          <div className="container">
            <div className="section-head">
              <Spec code="05">Reviews</Spec>
              <h2 id="reviews-title" className="display h2">
                What customers say.
              </h2>
            </div>
            <div className="reviews-empty">
              <span className="reviews-empty__mark" aria-hidden="true">
                &ldquo;
              </span>
              <p className="lead" style={{ margin: 0 }}>
                Verified reviews will appear here once they are confirmed from a public source such as Google. The
                old site&rsquo;s reviews and 5.0 rating could not be traced, so they are not shown.
              </p>
              <Pending note="Reviews and Google link" />
            </div>
          </div>
        </section>
      </PreviewOnly>
    );
  }
  return (
    <section className="section tone-white" aria-labelledby="reviews-title">
      <div className="container">
        <div className="section-head">
          <Spec code="05">Reviews</Spec>
          <h2 id="reviews-title" className="display h2">
            What customers say.
          </h2>
        </div>
        {hasReviews ? (
          <ul className="checklist" role="list">
            {reviews.map((r) => (
              <li key={r.quote}>
                <span className="checklist__n">&ldquo;</span>
                <blockquote>
                  <p style={{ fontSize: 'var(--fs-lead)', color: 'var(--ink)' }}>{r.quote}</p>
                  <footer style={{ marginTop: '0.5rem', color: 'var(--ink-meta)' }}>
                    {r.author}, {r.url ? <a href={r.url}>{r.source}</a> : r.source}
                  </footer>
                </blockquote>
              </li>
            ))}
          </ul>
        ) : null}
        {business.googleReviewUrl ? (
          <div className="btn-row" style={{ marginTop: '2rem' }}>
            <a className="btn btn--outline" href={business.googleReviewUrl} target="_blank" rel="noopener noreferrer">
              Read and leave reviews on Google <ArrowIcon />
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/* ─────────────────────────── Quote ─────────────────────────── */
export function QuoteSection({ headingLevel = 2, sourcePage = '/' }: { headingLevel?: 1 | 2; sourcePage?: string }) {
  const H = headingLevel === 1 ? 'h1' : 'h2';
  return (
    <section className="section tone-dark" aria-labelledby="quote-title" id="quote">
      <div className="container quote__layout">
        <div className="quote__aside">
          <Spec code="06">Request a Quote</Spec>
          <H id="quote-title" className="display h2">
            Start a repair request.
          </H>
          <p className="lead">
            Tell us about the car and what it&rsquo;s doing. We&rsquo;ll get back to you to talk it through and set
            up a time to take a look.
          </p>
          <p className="contact-alt">
            Rather talk? Call <a href={telHref}>{business.phone.display}</a>
            {' '}or <a href={smsHref}>send a text</a>.<Pending note="Texting" />
          </p>
        </div>
        <QuoteForm sourcePage={sourcePage} />
      </div>
    </section>
  );
}

/* ─────────────────────────── FAQ ─────────────────────────── */
export function Faq() {
  return (
    <section className="section tone-ivory" aria-labelledby="faq-title">
      <div className="container faq__layout">
        <div>
          <Spec code="07">Questions</Spec>
          <h2 id="faq-title" className="display h2" style={{ marginTop: '1.25rem' }}>
            Good to know.
          </h2>
        </div>
        <div className="faq__list">
          {faqs.map((f) => (
            <details className="faq__item" key={f.q}>
              <summary>
                <span>
                  {f.q}
                  {f.pending ? <Pending /> : null}
                </span>
                <PlusIcon />
              </summary>
              <div className="faq__a">
                <p>{f.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Visit ─────────────────────────── */
export function Visit({ headingLevel = 2 }: { headingLevel?: 1 | 2 }) {
  const H = headingLevel === 1 ? 'h1' : 'h2';
  return (
    <section className="section tone-dark" aria-labelledby="visit-title" id="visit">
      <div className="container visit">
        <div>
          <Spec code="08">Visit</Spec>
          <H id="visit-title" className="display h2" style={{ marginTop: '1.25rem' }}>
            Find the shop.
          </H>
          <dl>
            <div>
              <dt>Address</dt>
              <dd>
                <a href={business.directionsUrl} target="_blank" rel="noopener noreferrer">
                  {business.address.street}
                  <br />
                  {business.address.city}, {business.address.region} {business.address.postalCode}
                </a>
              </dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>
                <a href={telHref}>{business.phone.display}</a>
              </dd>
            </div>
            <div>
              <dt>Text</dt>
              <dd>
                <a href={smsHref}>{business.phone.display}</a>
                <Pending />
              </dd>
            </div>
            <div>
              <dt>Hours</dt>
              <dd>
                {business.hours
                  ? business.hours.map((h) => (
                      <span key={h.days} style={{ display: 'block' }}>
                        {h.days}: {h.time}
                      </span>
                    ))
                  : 'Call for current hours'}
                {!business.hours ? <Pending /> : null}
              </dd>
            </div>
          </dl>
          <div className="btn-row">
            <a className="btn" href={business.directionsUrl} target="_blank" rel="noopener noreferrer">
              <PinIcon /> Get Directions
            </a>
            <a className="btn btn--outline" href={telHref}>
              <PhoneIcon /> Call
            </a>
            <a className="btn btn--outline" href={smsHref}>
              <TextIcon /> Text
            </a>
          </div>
        </div>
        <div className="map">
          <iframe
            src={business.mapEmbedUrl}
            title={`Map showing ${business.name} at ${fullAddress}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}

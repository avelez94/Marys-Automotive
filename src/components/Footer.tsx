import Link from 'next/link';
import { business, fullAddress, telHref, smsHref } from '@/content/business';
import { serviceGroups } from '@/content/services';
import { navLinks } from './nav';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer tone-dark">
      <div className="container">
        <div className="footer__grid">
          <div>
            <p className="wordmark__name" style={{ color: 'var(--white)' }}>
              Mary&rsquo;s <span>Automotive</span>
            </p>
            <p className="footer__tag">
              {business.tagline} Full service auto repair for domestic and foreign vehicles in Indianapolis.
            </p>
          </div>
          <div>
            <h2>Services</h2>
            <ul>
              {serviceGroups.map((g) => (
                <li key={g.code}>
                  <Link href={`/services#group-${g.code}`}>{g.title}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>Shop</h2>
            <ul>
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
              <li>
                <Link href="/request-a-quote">Request a Quote</Link>
              </li>
              <li>
                <Link href="/privacy">Privacy</Link>
              </li>
            </ul>
          </div>
          <div>
            <h2>Visit</h2>
            <address style={{ fontStyle: 'normal' }}>
              <ul>
                <li>
                  <a href={business.directionsUrl} target="_blank" rel="noopener noreferrer">
                    {fullAddress}
                  </a>
                </li>
                <li>
                  <a href={telHref}>Call {business.phone.display}</a>
                </li>
                <li>
                  <a href={smsHref}>Text {business.phone.display}</a>
                </li>
              </ul>
            </address>
          </div>
        </div>
        <div className="footer__base">
          <span>
            © {year} {business.name}. All rights reserved.
          </span>
          <span>Stock photography is labeled and does not show our shop.</span>
        </div>
      </div>
    </footer>
  );
}

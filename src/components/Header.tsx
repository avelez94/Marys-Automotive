'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { business, telHref } from '@/content/business';
import { navLinks } from './nav';
import { ArrowIcon, CloseIcon, MenuIcon, PhoneIcon } from './Icons';

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link href="/" className="wordmark" aria-label={`${business.name} home`}>
          <span className="wordmark__name">
            Mary&rsquo;s <span>Automotive</span>
          </span>
          <span className="wordmark__sub">Indianapolis · Est. 1994</span>
        </Link>

        <nav className="nav" aria-label="Main">
          <ul>
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} aria-current={pathname.startsWith(l.href) ? 'page' : undefined}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-actions">
          <a className="header-phone" href={telHref}>
            <PhoneIcon />
            <span>
              <span className="visually-hidden">Call now </span>
              {business.phone.display}
            </span>
          </a>
          <Link className="btn btn--sm" href="/request-a-quote">
            Request a Quote
          </Link>
        </div>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
          <span className="visually-hidden">{open ? 'Close menu' : 'Open menu'}</span>
        </button>
      </div>

      <div id="mobile-menu" className="mobile-menu" hidden={!open}>
        <nav aria-label="Mobile">
          <ul>
            <li>
              <Link href="/">
                Home <ArrowIcon width={20} />
              </Link>
            </li>
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>
                  {l.label} <ArrowIcon width={20} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="btn-row" style={{ flexDirection: 'column' }}>
          <Link className="btn" href="/request-a-quote">
            Request a Quote
          </Link>
          <a className="btn btn--outline-light" href={telHref}>
            <PhoneIcon /> Call {business.phone.display}
          </a>
        </div>
        <p className="mobile-menu__meta">
          {business.address.street}, {business.address.city}, {business.address.region}{' '}
          {business.address.postalCode}
        </p>
      </div>
    </header>
  );
}

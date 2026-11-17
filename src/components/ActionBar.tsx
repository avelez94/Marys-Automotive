import Link from 'next/link';
import { business, smsHref, telHref } from '@/content/business';
import { PhoneIcon, TextIcon } from './Icons';

/** Thumb reach contact bar on phones. Hidden on desktop where the header carries these actions. */
export function ActionBar() {
  return (
    <nav className="action-bar" aria-label="Quick contact">
      <a href={telHref} aria-label={`Call ${business.phone.display}`}>
        <PhoneIcon /> Call
      </a>
      <a href={smsHref} aria-label={`Text ${business.phone.display}`}>
        <TextIcon /> Text
      </a>
      <Link href="/request-a-quote" className="is-primary">
        Request a Quote
      </Link>
    </nav>
  );
}

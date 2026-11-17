import type { Metadata } from 'next';
import { PageHead } from '@/components/PageHead';
import { Pending } from '@/components/Pending';
import { business, telHref } from '@/content/business';

export const metadata: Metadata = {
  title: 'Privacy',
  description: "How Mary's Automotive handles information sent through this website.",
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <>
      <PageHead spec="Privacy" title="Your information." />
      <section className="section tone-ivory">
        <div className="container prose lead" style={{ maxWidth: '44rem' }}>
          <p>
            When you send a repair request, we collect what you enter: your name, phone number, optional email
            address, vehicle details and a description of the problem. We use it only to respond to your request and
            to help with your vehicle.
          </p>
          <p>
            Requests are stored securely and are visible only to the shop. We do not sell or share your information
            for marketing.
          </p>
          <p>
            This site uses a Google Ads tag to measure advertising. To ask about or remove your information, call{' '}
            <a href={telHref}>{business.phone.display}</a>.
          </p>
          <Pending block note="Owner review of this privacy notice." />
        </div>
      </section>
    </>
  );
}

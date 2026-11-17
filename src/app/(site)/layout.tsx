import Script from 'next/script';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ActionBar } from '@/components/ActionBar';
import { Reveal } from '@/components/Reveal';
import { LocalBusinessJsonLd } from '@/components/JsonLd';

const ADS_ID = 'AW-837158696';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <ActionBar />
      <Reveal />
      <LocalBusinessJsonLd />
      {/* Existing Google Ads tag, preserved from the previous site. */}
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${ADS_ID}`} strategy="afterInteractive" />
      <Script id="gtag-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ADS_ID}');`}
      </Script>
    </>
  );
}

import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/archivo/wdth.css';
import '@fontsource-variable/public-sans/wght.css';
import './globals.css';
import { business } from '@/content/business';
import { allowIndexing, siteUrl } from '@/lib/env';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${business.name} | Auto Repair in Indianapolis, IN`,
    template: `%s | ${business.name}`,
  },
  description:
    'Full service auto repair for domestic and foreign vehicles at 3249 W Washington St, Indianapolis. Request a quote or call (317) 491-3393.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: business.name,
    locale: 'en_US',
  },
  robots: allowIndexing() ? { index: true, follow: true } : { index: false, follow: false },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#17191c',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          // Enables reveal animations only when JavaScript runs, so content is never hidden without it.
          dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

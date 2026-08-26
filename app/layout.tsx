import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
export const metadata: Metadata = {
  metadataBase: new URL('https://notcaviarnine.com'),
  title: { default: 'Not CaviarNine — HyperStake', template: '%s · Not CaviarNine' },
  description:
    'CaviarNine is gone, but contracts never die. An independent, non-custodial frontend for the HyperStake LSULP/XRD pool on Radix.',
  openGraph: {
    title: 'Not CaviarNine — HyperStake',
    description:
      'CaviarNine is gone, but contracts never die. An independent, non-custodial frontend for the HyperStake LSULP/XRD pool on Radix.',
    siteName: 'Not CaviarNine',
    type: 'website',
  },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
export const metadata: Metadata = {
  metadataBase: new URL('https://notcaviarnine.com'),
  title: { default: 'NotCaviarNine', template: '%s · NotCaviarNine' },
  description:
    'CaviarNine is leaving, but contracts never die. An independent, non-custodial console for CaviarNine\'s contracts on Radix: HyperStake, Simple Pools, Shape Liquidity and the LSU Pool.',
  openGraph: {
    title: 'NotCaviarNine',
    description:
      'CaviarNine is leaving, but contracts never die. An independent, non-custodial console for CaviarNine\'s contracts on Radix: HyperStake, Simple Pools, Shape Liquidity and the LSU Pool.',
    siteName: 'NotCaviarNine',
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

import type { Metadata } from 'next';
import { Wordmark } from '@/components/wordmark';

export const metadata: Metadata = { title: 'Not available', robots: { index: false } };

export default function Restricted() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 px-6">
      <Wordmark />
      <h1 className="display text-3xl">Not available in your region</h1>
      <p className="text-ink-soft">
        This website is not offered in jurisdictions subject to comprehensive sanctions. The underlying contracts live on the Radix
        network and are not operated by this site; your assets, if any, remain accessible through your own wallet.
      </p>
    </main>
  );
}

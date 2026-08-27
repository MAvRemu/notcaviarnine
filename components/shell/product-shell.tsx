'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { RdtProvider } from '@/components/radix/rdt-provider';
import { ConnectButton } from '@/components/radix/connect-button';
import { Wordmark } from '@/components/wordmark';
import { ProductSwitcher } from './product-switcher';

/** Shared chrome for every product page: wordmark · product switcher · wallet. */
export function ProductShell({ children }: { children: ReactNode }) {
  return (
    <RdtProvider>
      <header className="hairline sticky top-0 z-20 border-b bg-bg/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 sm:py-3">
          <div className="flex min-w-0 items-center gap-3 sm:gap-6">
            <Wordmark />
            <div className="hidden md:block"><ProductSwitcher /></div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/#status" className="hidden text-sm text-muted hover:text-ink lg:inline">Status</Link>
            <ConnectButton />
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-2 md:hidden"><ProductSwitcher /></div>
      </header>
      {children}
      <footer className="mx-auto max-w-6xl px-6 pb-10 text-xs text-muted">
        Non-custodial: every action is a transaction you review and sign in your Radix Wallet. Contracts by CaviarNine; this site is independent.{' '}
        <Link href="/disclaimer" className="underline underline-offset-2">Disclaimer</Link> · <Link href="/terms" className="underline underline-offset-2">Terms</Link>
      </footer>
    </RdtProvider>
  );
}

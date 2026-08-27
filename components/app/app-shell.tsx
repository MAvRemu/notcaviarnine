'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { PoolSnapshot } from '@/lib/pool-data';
import { RdtProvider } from '@/components/radix/rdt-provider';
import { ConnectButton } from '@/components/radix/connect-button';
import { Wordmark } from '@/components/wordmark';
import { PoolProvider } from './pool-context';
import { SwapPanel } from './swap-panel';
import { AddLiquidityPanel } from './add-liquidity-panel';
import { RemoveLiquidityPanel } from './remove-liquidity-panel';
import { Balances } from './balances';
import { HealthPanel } from './health-panel';
import { History } from './history';
import { LINKS } from '@/lib/radix/config';

type Tab = 'swap' | 'add' | 'remove';

export function AppShell({ initial }: { initial: PoolSnapshot | null }) {
  const [tab, setTab] = useState<Tab>('swap');
  return (
    <RdtProvider>
      <PoolProvider initial={initial}>
        <header className="hairline sticky top-0 z-20 border-b bg-bg/85 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 sm:py-3">
            <div className="flex items-center gap-3 sm:gap-6">
              <Wordmark />
              <span className="pill hidden sm:inline-flex">HyperStake</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/#status" className="hidden text-sm text-muted hover:text-ink md:inline">Status</Link>
              <a href={LINKS.c9LsuPool} target="_blank" rel="noreferrer" className="hidden text-sm text-muted hover:text-ink md:inline" title="Deposit validator LSUs to mint LSULP (CaviarNine LSU Pool)">Get LSULP ↗</a>
              <ConnectButton />
            </div>
          </div>
        </header>

        <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <section className="space-y-6">
            <div className="card p-5">
              <div className="mb-4 flex items-center gap-1">
                <button className="tab" data-active={tab === 'swap'} onClick={() => setTab('swap')}>Swap</button>
                <button className="tab" data-active={tab === 'add'} onClick={() => setTab('add')}>Add liquidity</button>
                <button className="tab" data-active={tab === 'remove'} onClick={() => setTab('remove')}>Remove</button>
              </div>
              {tab === 'swap' && <SwapPanel />}
              {tab === 'add' && <AddLiquidityPanel />}
              {tab === 'remove' && <RemoveLiquidityPanel />}
            </div>
            <Balances />
          </section>
          <section className="space-y-6">
            <HealthPanel />
            <History />
          </section>
        </main>

        <footer className="mx-auto max-w-6xl px-6 pb-10 text-xs text-muted">
          Non-custodial: every action is a transaction you review and sign in your Radix Wallet. Contracts by CaviarNine; this site is independent.{' '}
          <Link href="/disclaimer" className="underline underline-offset-2">Disclaimer</Link> · <Link href="/terms" className="underline underline-offset-2">Terms</Link>
        </footer>
      </PoolProvider>
    </RdtProvider>
  );
}

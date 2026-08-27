'use client';

import { useState } from 'react';
import type { PoolSnapshot } from '@/lib/pool-data';
import { ProductShell } from '@/components/shell/product-shell';
import { PageHeader } from '@/components/ui';
import { PoolProvider } from './pool-context';
import { SwapPanel } from './swap-panel';
import { AddLiquidityPanel } from './add-liquidity-panel';
import { RemoveLiquidityPanel } from './remove-liquidity-panel';
import { Balances } from './balances';
import { HealthPanel } from './health-panel';
import { History } from './history';
import { LINKS } from '@/lib/radix/config';
import { trackEvent } from '@/lib/analytics';

type Tab = 'swap' | 'add' | 'remove';

export function AppShell({ initial }: { initial: PoolSnapshot | null }) {
  const [tab, setTabState] = useState<Tab>('swap');
  const setTab = (t: Tab) => { setTabState(t); trackEvent('tab_selected', { product: 'hyperstake', action: t }); };
  return (
    <ProductShell>
      <PoolProvider initial={initial}>
        <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
          <PageHeader eyebrow="HyperStake · LSULP / XRD" title="Instant stake & unstake" aside={<a href={LINKS.c9LsuPool} target="_blank" rel="noreferrer" className="hidden text-sm text-muted hover:text-ink sm:inline" title="Deposit validator LSUs to mint LSULP (CaviarNine LSU Pool)">Get LSULP ↗</a>} />
        </div>
        <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <section className="min-w-0 space-y-6">
            <div className="card p-5">
              <div className="mb-4 flex items-center gap-1">
                <button className="tab" data-active={tab === 'swap'} onClick={() => setTab('swap')}>Swap</button>
                <button className="tab whitespace-nowrap" data-active={tab === 'add'} onClick={() => setTab('add')}><span className="sm:hidden">Add</span><span className="hidden sm:inline">Add liquidity</span></button>
                <button className="tab whitespace-nowrap" data-active={tab === 'remove'} onClick={() => setTab('remove')}><span className="sm:hidden">Remove</span><span className="hidden sm:inline">Remove liquidity</span></button>
              </div>
              {tab === 'swap' && <SwapPanel />}
              {tab === 'add' && <AddLiquidityPanel />}
              {tab === 'remove' && <RemoveLiquidityPanel />}
            </div>
            <Balances />
          </section>
          <section className="min-w-0 space-y-6">
            <HealthPanel />
            <History />
          </section>
        </main>
      </PoolProvider>
    </ProductShell>
  );
}

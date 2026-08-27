'use client';

import { useState } from 'react';
import type { PoolSnapshot } from '@/lib/pool-data';
import { ProductShell } from '@/components/shell/product-shell';
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
    <ProductShell>
      <PoolProvider initial={initial}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 pt-6 sm:px-6">
          <div>
            <div className="label">HyperStake · LSULP / XRD</div>
            <h1 className="display mt-1 text-2xl">Instant stake & unstake</h1>
          </div>
          <a href={LINKS.c9LsuPool} target="_blank" rel="noreferrer" className="hidden text-sm text-muted hover:text-ink sm:inline" title="Deposit validator LSUs to mint LSULP (CaviarNine LSU Pool)">Get LSULP ↗</a>
        </div>
        <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <section className="min-w-0 space-y-6">
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
          <section className="min-w-0 space-y-6">
            <HealthPanel />
            <History />
          </section>
        </main>
      </PoolProvider>
    </ProductShell>
  );
}

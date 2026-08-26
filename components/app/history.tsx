'use client';

import { useCallback, useEffect, useState } from 'react';
import type { HyperStakeEvent } from '@/lib/indexer/events';
import { useWallet } from '@/components/radix/rdt-provider';
import { RESOURCES, dashboardUrl } from '@/lib/radix/config';
import { fmt, timeAgo } from '@/lib/format';

type Scope = 'pool' | 'mine';

export function History() {
  const { account } = useWallet();
  const [scope, setScope] = useState<Scope>('pool');
  const [items, setItems] = useState<HyperStakeEvent[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    const q = scope === 'mine' && account ? `?account=${account.address}` : '';
    try {
      const r = await fetch(`/api/history${q}`, { cache: 'no-store' });
      if (!r.ok) throw new Error(`history ${r.status}`);
      setItems(((await r.json()) as { items: HyperStakeEvent[] }).items);
      setErr(null);
    } catch (e) { setErr(e instanceof Error ? e.message : 'failed'); }
  }, [scope, account]);

  useEffect(() => {
    // Initial load runs in a microtask so the effect body itself never sets state synchronously.
    queueMicrotask(load);
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, [load]);

  return (
    <div className="card p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="label">Activity</div>
        <div className="flex gap-1">
          <button className="tab !py-1 !text-xs" data-active={scope === 'pool'} onClick={() => { setScope('pool'); setItems(null); }}>Pool</button>
          <button className="tab !py-1 !text-xs" data-active={scope === 'mine'} onClick={() => { setScope('mine'); setItems(null); }} disabled={!account} title={account ? '' : 'Connect a wallet'}>Mine</button>
        </div>
      </div>
      {err && <div className="text-xs text-danger">{err}</div>}
      {items === null && !err && <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-6" />)}</div>}
      {items && items.length === 0 && <div className="text-sm text-muted">{scope === 'mine' ? 'No HyperStake transactions from this account yet.' : 'No recent activity.'}</div>}
      {items && items.length > 0 && (
        <ul className="divide-y divide-line text-sm">
          {items.slice(0, 40).map((e) => (
            <li key={`${e.intentHash}-${e.eventIndex}`} className="flex items-center justify-between gap-3 py-2">
              <div className="min-w-0">
                <div className="truncate">{describe(e)}</div>
                <div className="text-[11px] text-muted">{timeAgo(e.timestamp)}{e.kind === 'swap' && e.liquidityFeeXrd ? ` · LP fee ${fmt(e.liquidityFeeXrd, { dp: 3 })} XRD` : ''}</div>
              </div>
              <a className="shrink-0 text-xs text-muted hover:text-ink" href={dashboardUrl(e.intentHash)} target="_blank" rel="noreferrer">tx ↗</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function sym(a?: string) { return a === RESOURCES.XRD ? 'XRD' : a === RESOURCES.LSULP ? 'LSULP' : a === RESOURCES.HLP ? 'HLP' : '?'; }

function describe(e: HyperStakeEvent) {
  if (e.kind === 'swap') {
    const inS = sym(e.inputResource);
    return (
      <>
        <span className={`pill mr-2 ${inS === 'XRD' ? 'border-ok/40 text-ok' : 'border-warn/40 text-warn'}`}>{inS === 'XRD' ? 'stake' : 'unstake'}</span>
        <span className="num">{fmt(e.inputAmount, { dp: 2 })}</span> {inS} → <span className="num">{fmt(e.outputAmount, { dp: 2 })}</span> {sym(e.outputResource)}
      </>
    );
  }
  const add = e.kind === 'add';
  return (
    <>
      <span className={`pill mr-2 ${add ? 'border-ink/30' : 'border-line text-muted'}`}>{add ? 'add LP' : 'remove LP'}</span>
      <span className="num">{fmt(e.amountLp?.replace('-', ''), { dp: 2 })}</span> HLP · <span className="num">{fmt(e.amountLsulp?.replace('-', ''), { dp: 1 })}</span> LSULP + <span className="num">{fmt(e.amountXrd?.replace('-', ''), { dp: 1 })}</span> XRD
    </>
  );
}

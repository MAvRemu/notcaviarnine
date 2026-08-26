'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { HyperStakeEvent } from '@/lib/indexer/events';
import { useWallet } from '@/components/radix/rdt-provider';
import { RESOURCES, dashboardUrl } from '@/lib/radix/config';
import { fmt, timeAgo } from '@/lib/format';

type Scope = 'pool' | 'mine';
type Page = { items: HyperStakeEvent[]; nextCursor: string | null };
const key = (e: HyperStakeEvent) => `${e.intentHash}-${e.eventIndex}`;

export function History() {
  const { account } = useWallet();
  const [scope, setScope] = useState<Scope>('pool');
  const [items, setItems] = useState<HyperStakeEvent[] | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const sentinel = useRef<HTMLDivElement | null>(null);
  const scrollBox = useRef<HTMLDivElement | null>(null);

  const url = useCallback(
    (c?: string | null) => {
      const p = new URLSearchParams();
      if (scope === 'mine' && account) p.set('account', account.address);
      if (c) p.set('cursor', c);
      return `/api/history${p.toString() ? `?${p}` : ''}`;
    },
    [scope, account],
  );

  // First page: also used for polling — merges new events on top, keeps what's loaded below.
  const loadHead = useCallback(async () => {
    try {
      const r = await fetch(url(), { cache: 'no-store' });
      if (!r.ok) throw new Error(`history ${r.status}`);
      const page = (await r.json()) as Page;
      setItems((prev) => {
        if (!prev) return page.items;
        const seen = new Set(prev.map(key));
        const fresh = page.items.filter((e) => !seen.has(key(e)));
        return fresh.length ? [...fresh, ...prev] : prev;
      });
      setCursor((c) => c ?? page.nextCursor);
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'failed');
    }
  }, [url]);

  const loadMore = useCallback(async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const r = await fetch(url(cursor), { cache: 'no-store' });
      if (!r.ok) throw new Error(`history ${r.status}`);
      const page = (await r.json()) as Page;
      setItems((prev) => {
        const seen = new Set((prev ?? []).map(key));
        return [...(prev ?? []), ...page.items.filter((e) => !seen.has(key(e)))];
      });
      setCursor(page.nextCursor);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'failed');
    } finally {
      setLoadingMore(false);
    }
  }, [cursor, loadingMore, url]);

  useEffect(() => {
    queueMicrotask(loadHead);
    const id = setInterval(loadHead, 30_000);
    return () => clearInterval(id);
  }, [loadHead]);

  // Infinite scroll inside the panel.
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => entries[0]?.isIntersecting && loadMore(), {
      root: scrollBox.current,
      rootMargin: '200px',
    });
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore]);

  const switchScope = (s: Scope) => {
    setScope(s);
    setItems(null);
    setCursor(null);
  };

  return (
    <div className="card flex flex-col p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="label">Activity</div>
        <div className="flex gap-1">
          <button className="tab !py-1 !text-xs" data-active={scope === 'pool'} onClick={() => switchScope('pool')}>Pool</button>
          <button className="tab !py-1 !text-xs" data-active={scope === 'mine'} onClick={() => switchScope('mine')} disabled={!account} title={account ? '' : 'Connect a wallet'}>Mine</button>
        </div>
      </div>
      {err && <div className="text-xs text-danger">{err}</div>}
      <div ref={scrollBox} className="-mx-2 max-h-[560px] overflow-y-auto px-2">
        {items === null && !err && <div className="space-y-2">{[...Array(8)].map((_, i) => <div key={i} className="skeleton h-9" />)}</div>}
        {items && items.length === 0 && <div className="py-6 text-sm text-muted">{scope === 'mine' ? 'No HyperStake transactions from this account yet.' : 'No recent activity.'}</div>}
        {items && items.length > 0 && (
          <ul className="divide-y divide-line text-sm">
            {items.map((e) => (
              <li key={key(e)} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <div className="truncate">{describe(e)}</div>
                  <div className="num mt-0.5 text-[11px] text-muted">{timeAgo(e.timestamp)}{e.kind === 'swap' && e.liquidityFeeXrd ? ` · LP fee ${fmt(e.liquidityFeeXrd, { dp: 3 })} XRD` : ''}</div>
                </div>
                <a className="shrink-0 text-xs text-muted hover:text-accent" href={dashboardUrl(e.intentHash)} target="_blank" rel="noreferrer">tx ↗</a>
              </li>
            ))}
          </ul>
        )}
        <div ref={sentinel} className="py-3 text-center text-[11px] text-muted">
          {loadingMore ? 'Loading…' : cursor ? '' : items && items.length ? 'End of history' : ''}
        </div>
      </div>
    </div>
  );
}

function sym(a?: string) { return a === RESOURCES.XRD ? 'XRD' : a === RESOURCES.LSULP ? 'LSULP' : a === RESOURCES.HLP ? 'HLP' : '?'; }

function describe(e: HyperStakeEvent) {
  if (e.kind === 'swap') {
    const inS = sym(e.inputResource);
    return (
      <>
        <span className={`pill mr-2 ${inS === 'XRD' ? 'border-ok/40 text-ok' : 'border-accent/40 text-accent'}`}>{inS === 'XRD' ? 'stake' : 'unstake'}</span>
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

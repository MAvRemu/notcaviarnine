'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import type { SimplePoolSummary } from '@/lib/simplepool/registry';
import { RESOURCES } from '@/lib/radix/config';
import { fmtNum } from '@/lib/format';

const STABLES = new Set(['xUSDC', 'xUSDT', 'hUSDC', 'hUSDT']);
const nfc = (n: number) => fmtNum(n, { compact: true });

export function PoolTable({ pools, xrdUsd }: { pools: SimplePoolSummary[]; xrdUsd: number | null }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [showEmpty, setShowEmpty] = useState(false);
  const [xrdOnly, setXrdOnly] = useState(false);
  const [stables, setStables] = useState(false);
  const [usd, setUsd] = useState(false);
  const [sort, setSort] = useState<'tvl' | 'fee' | 'created'>('tvl');

  const pairCount = useMemo(() => {
    const c = new Map<string, number>();
    for (const p of pools) { const k = [p.resourceX, p.resourceY].sort().join('|'); c.set(k, (c.get(k) ?? 0) + 1); }
    return c;
  }, [pools]);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return pools
      .filter((p) => showEmpty || p.hasLiquidity)
      .filter((p) => !xrdOnly || p.resourceX === RESOURCES.XRD || p.resourceY === RESOURCES.XRD)
      .filter((p) => !stables || STABLES.has(p.symbolX) || STABLES.has(p.symbolY))
      .filter((p) => !s || [p.symbolX, p.symbolY, p.swapComponent, p.poolComponent, p.lpResource, p.resourceX, p.resourceY].some((v) => v.toLowerCase().includes(s)))
      .sort((a, b) => sort === 'tvl' ? (b.tvlXrd ?? -1) - (a.tvlXrd ?? -1) : sort === 'fee' ? a.fee - b.fee : b.createdAt.localeCompare(a.createdAt));
  }, [pools, q, showEmpty, xrdOnly, stables, sort]);

  const val = (p: SimplePoolSummary) => {
    if (p.tvlXrd === null) { const v = nfc(p.reserveX); return <span className="text-muted">{v === 'n/a' ? 'no price' : `${v} ${p.symbolX}`}</span>; }
    if (usd && xrdUsd) return <>${nfc(p.tvlXrd * xrdUsd)}</>;
    return <>{nfc(p.tvlXrd)} <span className="text-muted">XRD</span></>;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input className="field h-11 flex-1 min-w-[220px] px-4 text-sm outline-none" placeholder="Search token, pool or address…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search pools" />
        <Chip on={xrdOnly} onClick={() => setXrdOnly(!xrdOnly)}>XRD pairs</Chip>
        <Chip on={stables} onClick={() => setStables(!stables)}>Stablecoins</Chip>
        <Chip on={showEmpty} onClick={() => setShowEmpty(!showEmpty)}>Show empty pools</Chip>
        <div className="ml-auto flex items-center gap-1">
          <button className="tab tab-sm" data-active={!usd} onClick={() => setUsd(false)}>XRD</button>
          <button className="tab tab-sm" data-active={usd} onClick={() => setUsd(true)} disabled={!xrdUsd} title={xrdUsd ? '' : 'USD rate unavailable'}>USD</button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="hidden w-full text-sm md:table">
          <thead className="text-left">
            <tr className="label border-b border-line [&>th]:px-4 [&>th]:py-3 [&>th]:font-semibold">
              <th>Pool</th><th>Weights</th>
              <th><button onClick={() => setSort('fee')} className={`uppercase tracking-[0.16em] ${sort === 'fee' ? 'text-ink' : ''}`}>Fee</button></th>
              <th className="text-right"><button onClick={() => setSort('tvl')} className={`uppercase tracking-[0.16em] ${sort === 'tvl' ? 'text-ink' : ''}`}>TVL {sort === 'tvl' && '↓'}</button></th>
              <th className="text-right">7d volume</th><th className="text-right">Fee APR 7d</th>
              <th className="text-right"><button onClick={() => setSort('created')} className={`uppercase tracking-[0.16em] ${sort === 'created' ? 'text-ink' : ''}`}>Created</button></th>
              <th />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((p) => {
              const dup = pairCount.get([p.resourceX, p.resourceY].sort().join('|')) ?? 1;
              return (
                <tr key={p.swapComponent} onClick={() => router.push(`/pools/${p.swapComponent}`)} className="cursor-pointer hover:bg-bg-deep/60 [&>td]:px-4 [&>td]:py-3">
                  <td>
                    <Link href={`/pools/${p.swapComponent}`} className="flex items-center gap-2">
                      <Pair a={p.iconX} b={p.iconY} />
                      <span className="font-semibold">{p.symbolX} / {p.symbolY}</span>
                      {dup > 1 && <span className="chip !h-5 !px-1.5 !text-[11px]">×{dup}</span>}
                      {p.divergence !== null && Math.abs(p.divergence) > 0.05 && <span className="dot dot-warn" title={`Pool price is ${(p.divergence * 100).toFixed(0)}% away from market`} />}
                      {(!p.iconX || !p.iconY) && <span className="dot dot-warn" title="A token in this pool has no metadata — verify the address" />}
                    </Link>
                  </td>
                  <td className="num text-muted">{Math.round(p.weightX * 100)} / {Math.round(p.weightY * 100)}</td>
                  <td className="num">{(p.fee * 100).toFixed(2)}%</td>
                  <td className="num text-right">{p.hasLiquidity ? val(p) : <span className="text-muted">no liquidity</span>}</td>
                  <td className="num text-right" title="Swaps in the last 7 days, from any frontend or aggregator">
                    {p.volume7dXrd == null ? <span className="text-muted">—</span> : p.volume7dXrd === 0 ? <span className="text-muted">0</span> : <>{usd && xrdUsd ? `$${nfc(p.volume7dXrd * xrdUsd)}` : <>{nfc(p.volume7dXrd)} <span className="text-muted">XRD</span></>}{p.volumeCapped && '+'}</>}
                  </td>
                  <td className="num text-right" title="Annualized from 7-day fees vs pool value">
                    {p.feeApr7d == null ? <span className="text-muted">—</span> : p.feeApr7d === 0 ? <span className="text-muted">0.00%</span> : `${(p.feeApr7d * 100).toFixed(2)}%`}
                  </td>
                  <td className="num text-right text-muted">{p.createdAt.slice(0, 10)}</td>
                  <td className="text-right text-muted">→</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <ul className="divide-y divide-line md:hidden">
          {rows.map((p) => (
            <li key={p.swapComponent}>
              <Link href={`/pools/${p.swapComponent}`} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-2"><Pair a={p.iconX} b={p.iconY} /><div><div className="font-semibold">{p.symbolX} / {p.symbolY}</div><div className="num text-xs text-muted">{(p.fee * 100).toFixed(2)}% · {Math.round(p.weightX * 100)}/{Math.round(p.weightY * 100)}</div></div></div>
                <div className="num text-right text-sm">{p.hasLiquidity ? val(p) : <span className="text-muted">empty</span>}</div>
              </Link>
            </li>
          ))}
        </ul>
        {rows.length === 0 && <div className="p-6 text-sm text-muted">No pools match.</div>}
      </div>
      <div className="flex flex-wrap justify-between gap-2 text-xs text-muted">
        <span>{rows.length} of {pools.length} pools shown</span>
        <span>Prices by Astrolescent · reserves live from the Radix Gateway</span>
      </div>
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className="chip" data-selected={on}>{children}</button>;
}

function Pair({ a, b }: { a?: string; b?: string }) {
  return (
    <span className="flex -space-x-2">
      {[a, b].map((src, i) => <TokenIcon key={i} src={src} />)}
    </span>
  );
}

/** Token icon with a neutral fallback — many issuer-hosted icons are dead links. */
function TokenIcon({ src }: { src?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <span className="inline-block h-[22px] w-[22px] rounded-full border border-bg bg-bg-deep" />;
  return <Image src={src} alt="" width={22} height={22} className="rounded-full border border-bg bg-bg-deep" unoptimized onError={() => setFailed(true)} />;
}

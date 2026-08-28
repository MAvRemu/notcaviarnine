'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import type { ShapePoolRow } from '@/lib/shape/registry';
import { fmtNum } from '@/lib/format';

export function ShapeTable({ pools }: { pools: ShapePoolRow[] }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [showEmpty, setShowEmpty] = useState(false);
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return pools
      .filter((p) => showEmpty || p.hasLiquidity)
      .filter((p) => !s || [p.symbolX, p.symbolY, p.component, p.tokenX, p.tokenY].some((v) => v.toLowerCase().includes(s)));
  }, [pools, q, showEmpty]);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input className="field h-11 min-w-[220px] flex-1 px-4 text-sm outline-none" placeholder="Search token, pool or address…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search pools" />
        <button className="chip" data-selected={showEmpty} onClick={() => setShowEmpty(!showEmpty)}>Show empty pools</button>
      </div>
      <div className="card overflow-hidden">
        <table className="hidden w-full text-sm md:table">
          <thead className="text-left">
            <tr className="label border-b border-line [&>th]:px-4 [&>th]:py-3 [&>th]:font-semibold">
              <th>Pool</th><th>Bin width</th><th className="text-right">TVL</th><th className="text-right">Created</th><th />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((p) => (
              <tr key={p.component} onClick={() => router.push(`/shape/${p.component}`)} className="cursor-pointer hover:bg-bg-deep/60 [&>td]:px-4 [&>td]:py-3">
                <td>
                  <Link href={`/shape/${p.component}`} className="flex items-center gap-2">
                    <Pair a={p.iconX} b={p.iconY} />
                    <span className="font-semibold">{p.symbolX} / {p.symbolY}</span>
                  </Link>
                </td>
                <td className="num text-muted">≈ {(p.binSpan / 10).toFixed(1)}%</td>
                <td className="num text-right">{p.tvlXrd !== null ? <>{fmtNum(p.tvlXrd, { compact: true })} <span className="text-muted">XRD</span></> : <span className="text-muted">{p.hasLiquidity ? 'no price' : 'no liquidity'}</span>}</td>
                <td className="num text-right text-muted">{p.createdAt.slice(0, 10)}</td>
                <td className="text-right text-muted">→</td>
              </tr>
            ))}
          </tbody>
        </table>
        <ul className="divide-y divide-line md:hidden">
          {rows.map((p) => (
            <li key={p.component}>
              <Link href={`/shape/${p.component}`} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-2"><Pair a={p.iconX} b={p.iconY} /><div><div className="font-semibold">{p.symbolX} / {p.symbolY}</div><div className="num text-xs text-muted">bins ≈ {(p.binSpan / 10).toFixed(1)}%</div></div></div>
                <div className="num text-sm">{p.tvlXrd !== null ? `${fmtNum(p.tvlXrd, { compact: true })} XRD` : '—'}</div>
              </Link>
            </li>
          ))}
        </ul>
        {rows.length === 0 && <div className="p-6 text-sm text-muted">No pools match.</div>}
      </div>
      <div className="text-xs text-muted">{rows.length} of {pools.length} pools shown · prices by Astrolescent</div>
    </div>
  );
}

function Pair({ a, b }: { a?: string; b?: string }) {
  return (
    <span className="flex -space-x-2">
      {[a, b].map((src, i) => <Icon key={i} src={src} />)}
    </span>
  );
}
function Icon({ src }: { src?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <span className="inline-block h-[22px] w-[22px] rounded-full border border-bg bg-bg-deep" />;
  return <Image src={src} alt="" width={22} height={22} className="rounded-full border border-bg bg-bg-deep" unoptimized onError={() => setFailed(true)} />;
}

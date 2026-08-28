'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { SimplePoolSummary } from '@/lib/simplepool/registry';
import { gatewayPost } from '@/lib/radix/gateway';
import { toAtto, fromAtto } from '@/lib/hyperstake/math';
import { fmtNum } from '@/lib/format';
import { useWallet } from '@/components/radix/rdt-provider';

type Position = { pool: SimplePoolSummary; lp: bigint; valueXrd: number | null };

/** The connected wallet's Simple Pool positions — found by intersecting account fungibles with known LP resources. */
export function YourPools({ pools }: { pools: SimplePoolSummary[] }) {
  const { account } = useWallet();
  const [positions, setPositions] = useState<Position[] | null>(null);

  useEffect(() => {
    let gone = false;
    (async () => {
      if (!account) { setPositions(null); return; }
      try {
        const res = await gatewayPost<{ items: { resource_address: string; amount: string }[] }>('/state/entity/page/fungibles/', {
          address: account.address, aggregation_level: 'Global', limit_per_page: 100,
        });
        const byLp = new Map(pools.map((p) => [p.lpResource, p]));
        const found: Position[] = [];
        for (const i of res.items) {
          const pool = byLp.get(i.resource_address);
          if (!pool) continue;
          const lp = toAtto(i.amount);
          if (lp === 0n) continue;
          // LP value ≈ share of TVL; supply comes from the summary's reserves via redemption ratio when priced
          const valueXrd = pool.tvlXrd; // refined on the detail page; here show pool TVL context
          found.push({ pool, lp, valueXrd });
        }
        if (!gone) setPositions(found);
      } catch { if (!gone) setPositions([]); }
    })();
    return () => { gone = true; };
  }, [account, pools]);

  if (!account || positions === null || positions.length === 0) return null;
  return (
    <div className="card p-5">
      <div className="label mb-3">Your positions</div>
      <ul className="divide-y divide-line text-sm">
        {positions.map(({ pool, lp }) => (
          <li key={pool.swapComponent}>
            <Link href={`/pools/${pool.swapComponent}`} className="flex items-center justify-between gap-3 py-2 hover:text-accent-text">
              <span className="font-semibold">{pool.symbolX} / {pool.symbolY} <span className="num text-xs text-muted">{(pool.fee * 100).toFixed(2)}%</span></span>
              <span className="num">{fmtNum(Number(fromAtto(lp)), { compact: true })} LP →</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

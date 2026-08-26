import type { PoolSnapshot } from '@/lib/pool-data';
import { fmt, pct } from '@/lib/format';

export function StatsStrip({ snap }: { snap: PoolSnapshot | null }) {
  const s = snap?.state;
  const st = snap?.stats;
  const items: { k: string; v: string; sub?: string }[] = [
    { k: 'LSULP NAV', v: s ? `${fmt(s.nav, { dp: 4 })} XRD` : '—' },
    { k: 'Pool price', v: s ? `${fmt(s.price, { dp: 4 })} XRD` : '—', sub: s ? `${pct(s.premiumToNav)} vs NAV` : undefined },
    { k: 'TVL', v: s ? `${fmt(s.tvlXrd, { dp: 0, compact: true })} XRD` : '—', sub: s ? `${fmt(s.reserveXrd, { dp: 0, compact: true })} XRD · ${fmt(s.reserveLsulp, { dp: 0, compact: true })} LSULP` : undefined },
    { k: 'LP fee APR (7d)', v: st?.aprLp ? pct(st.aprLp, 2, false) : '—', sub: st ? `${st.swaps} swaps · realised` : undefined },
    { k: '7d volume', v: st ? `${fmt(st.volumeXrd, { dp: 0, compact: true })} XRD` : '—' },
    { k: 'HLP supply', v: s ? fmt(s.hlpSupply, { dp: 0, compact: true }) : '—' },
  ];
  return (
    <section className="hairline border-y">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-6 px-6 py-8 md:grid-cols-3 lg:grid-cols-6">
        {items.map((i) => (
          <div key={i.k}>
            <div className="label">{i.k}</div>
            <div className="num mt-1 text-xl">{i.v}</div>
            {i.sub && <div className="text-[11px] text-muted">{i.sub}</div>}
          </div>
        ))}
      </div>
      {s && <div className="mx-auto max-w-6xl px-6 pb-3 text-[11px] text-muted">Live from the Radix Gateway · ledger state {s.ledgerStateVersion.toLocaleString()}</div>}
    </section>
  );
}

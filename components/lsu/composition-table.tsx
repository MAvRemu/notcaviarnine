import type { LsuRow } from '@/lib/lsupool/composition';
import { fmtNum } from '@/lib/format';

/** Pool composition: every validator's share of the basket, with approval status. */
export function CompositionTable({ rows, requireActive, totalXrd }: { rows: LsuRow[]; requireActive: boolean; totalXrd: number }) {
  const held = rows.filter((r) => r.balance > 0);
  return (
    <section className="card p-5">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div className="label">Pool composition · {held.length} validators</div>
        {requireActive && <span className="text-xs text-muted"><span className="dot dot-warn mr-1" />only approved validators accept new stake</span>}
      </div>
      <div className="-mx-2 max-h-[560px] overflow-y-auto px-2">
        <ul className="divide-y divide-line text-sm">
          {held.map((r) => (
            <li key={r.lsuResource} className="flex items-center justify-between gap-3 py-2">
              <span className="flex min-w-0 items-center gap-2">
                <span className={`dot shrink-0 ${r.approved ? 'dot-ok' : 'dot-warn'}`} title={r.approved ? 'approved for new stake' : 'not on the approved list — existing stake unaffected'} />
                <span className="truncate">{r.validatorName}</span>
              </span>
              <span className="num shrink-0 text-right">
                {fmtNum(r.valueXrd, { compact: true })} XRD
                <span className="ml-2 text-xs text-muted">{totalXrd > 0 ? ((r.valueXrd / totalXrd) * 100).toFixed(1) : '0'}%</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

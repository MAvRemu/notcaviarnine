'use client';

import { tickToPrice } from '@/lib/shape/tick';
import { fmtNum } from '@/lib/format';

export type ChartBin = { tick: number; x?: number; y?: number; planned?: number };

/**
 * Liquidity by price bin. Y-side bins (below the price) in blue, X-side above in cream, the active bin brighter;
 * a dashed line marks the current price. Optionally overlays a planned deposit distribution in outline.
 */
export function BinsChart({ bins, currentTick, priceOfX, height = 180 }: { bins: ChartBin[]; currentTick: number | null; priceOfX?: (amountX: number, tick: number) => number; height?: number }) {
  if (!bins.length) return <div className="flex h-[180px] items-center justify-center text-sm text-muted">No liquidity in this pool yet.</div>;
  const sorted = [...bins].sort((a, b) => a.tick - b.tick);
  const val = (b: ChartBin) => (b.y ?? 0) + (priceOfX ? priceOfX(b.x ?? 0, b.tick) : (b.x ?? 0) * tickToPrice(b.tick));
  const maxV = Math.max(...sorted.map(val), ...sorted.map((b) => b.planned ?? 0), 1e-12);
  const W = 720, H = height, bw = Math.max(3, Math.min(22, Math.floor(W / sorted.length) - 2));
  const step = W / sorted.length;
  return (
    <svg viewBox={`0 0 ${W} ${H + 34}`} className="w-full" role="img" aria-label="Liquidity per price bin">
      {sorted.map((b, i) => {
        const h = Math.max(val(b) > 0 ? 2 : 0, (val(b) / maxV) * H);
        const active = b.tick === currentTick;
        const fill = active ? '#f6f2e8' : b.tick > (currentTick ?? -1) ? '#8d887c' : '#2f6fef';
        return <rect key={b.tick} x={i * step + (step - bw) / 2} y={H - h} width={bw} height={h} rx={2} fill={fill} opacity={active ? 1 : 0.8} />;
      })}
      {sorted.map((b, i) =>
        b.planned ? (
          <rect key={`p${b.tick}`} x={i * step + (step - bw) / 2} y={H - (b.planned / maxV) * H} width={bw} height={(b.planned / maxV) * H} rx={2} fill="none" stroke="#4d84f7" strokeWidth={1.5} strokeDasharray="3 2" />
        ) : null,
      )}
      {currentTick !== null && (() => {
        const i = sorted.findIndex((b) => b.tick >= currentTick);
        const xPos = (i === -1 ? sorted.length - 0.5 : i + 0.5) * step;
        return <line x1={xPos} y1={0} x2={xPos} y2={H} stroke="#f6f2e8" strokeDasharray="4 4" strokeOpacity={0.7} />;
      })()}
      {sorted.filter((_, i) => i % Math.ceil(sorted.length / 8) === 0).map((b) => (
        <text key={`t${b.tick}`} x={(sorted.indexOf(b) + 0.5) * step} y={H + 24} textAnchor="middle" fontSize={11} fill="#8d887c" fontFamily="monospace">
          {fmtNum(tickToPrice(b.tick))}
        </text>
      ))}
    </svg>
  );
}

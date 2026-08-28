/**
 * QuantaSwap tick math (see docs/SHAPE_LIQUIDITY.md): price(tick) = 1.001^(tick − 27000), ticks in [0, 54000],
 * bins are `binSpan` ticks wide and aligned to multiples of binSpan. Floats are fine here — ticks are integers and
 * amounts are only *distributed*; the contract enforces exact semantics and returns any excess.
 */
export const TICK_ONE = 27000;
export const TICK_MAX = 54000;
const LN_1001 = Math.log(1.001);

export const tickToPrice = (tick: number) => Math.pow(1.001, tick - TICK_ONE);
export const priceToTick = (price: number) => Math.round(TICK_ONE + Math.log(price) / LN_1001);
export const alignTick = (tick: number, span: number) => Math.min(TICK_MAX - span, Math.max(0, Math.floor(tick / span) * span));

export type ShapeKind = 'spot' | 'curve' | 'bidask';

export type PlannedBin = { tick: number; weight: number; side: 'x' | 'y' | 'both' };

/**
 * Plan the bins for a shape centred on `midTick`, `binsCount` bins wide, relative to the pool's `currentTick`.
 * Sides follow the contract's rule: bins above the current tick take X, below take Y, the current bin takes both.
 */
export function planBins(o: { shape: ShapeKind; midTick: number; binsCount: number; span: number; currentTick: number }): PlannedBin[] {
  const half = Math.floor(o.binsCount / 2);
  const start = alignTick(o.midTick, o.span) - half * o.span;
  const bins: PlannedBin[] = [];
  for (let i = 0; i < o.binsCount; i++) {
    const tick = start + i * o.span;
    if (tick < 0 || tick > TICK_MAX - o.span) continue;
    const d = Math.abs(i - half); // distance from centre in bins
    const weight = o.shape === 'spot' ? 1 : o.shape === 'curve' ? Math.max(0.15, 1 - d / (half + 1)) : 0.35 + (0.65 * d) / Math.max(1, half); // bidask: heavier at the edges
    const side: PlannedBin['side'] = tick > o.currentTick ? 'x' : tick < o.currentTick ? 'y' : 'both';
    bins.push({ tick, weight, side });
  }
  return bins;
}

/**
 * Split the user's X and Y budgets over the planned bins → positions `(tick, amountX, amountY)`.
 * The active bin gets a slice of both budgets; the contract uses the in-bin ratio and returns any excess.
 */
export function allocate(bins: PlannedBin[], amountX: number, amountY: number): { tick: number; x: number; y: number }[] {
  const wx = bins.filter((b) => b.side !== 'y').reduce((a, b) => a + b.weight, 0);
  const wy = bins.filter((b) => b.side !== 'x').reduce((a, b) => a + b.weight, 0);
  return bins
    .map((b) => ({
      tick: b.tick,
      x: b.side !== 'y' && wx > 0 ? (amountX * b.weight) / wx : 0,
      y: b.side !== 'x' && wy > 0 ? (amountY * b.weight) / wy : 0,
    }))
    .filter((p) => p.x > 0 || p.y > 0)
    .filter((p) => !(p.x > 0 && p.y > 0) || (p.x > 0 && p.y > 0)); // keep as-is; contract skips invalid combos
}

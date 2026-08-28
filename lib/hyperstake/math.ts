/**
 * Exact BigInt port of CaviarNine's HyperStake swap math.
 *
 * Source of truth (read 2026-08-26):
 *   hyper_stake/hyper_stake/src/hyper_stake/swap_math.rs
 *   hyper_stake/hyper_stake/src/hyper_stake.rs (_swap_x_for_y / _swap_y_for_x)
 *
 * Radix `Decimal` is an I192 with 18 implied decimals; all products are
 * truncated toward zero. We model Decimal as a BigInt of 1e-18 units ("atto")
 * and mirror every intermediate base (e18 / e36) so results match on-ledger
 * to the last digit. Verified against live `get_info` (see scripts/verify-math.ts).
 *
 * x = LSULP (resource_x), y = XRD (resource_y).
 */

export const E18 = 10n ** 18n;
export const E36 = 10n ** 36n;

export type Atto = bigint; // Decimal as integer atto-units

// ------------------------------------------------------------ conversions

/** Parse a decimal string (≤18 dp) to atto BigInt. Extra dp are truncated. */
export function toAtto(s: string | number): Atto {
  const str = typeof s === 'number' ? s.toString() : s.trim();
  if (!/^-?\d*(\.\d*)?$/.test(str) || str === '' || str === '-' || str === '.')
    throw new Error(`Invalid decimal: "${s}"`);
  const neg = str.startsWith('-');
  const [i = '0', f = ''] = str.replace('-', '').split('.');
  const v = BigInt(i || '0') * E18 + BigInt((f + '0'.repeat(18)).slice(0, 18));
  return neg ? -v : v;
}

/** Format atto BigInt to a full-precision decimal string (no trailing zeros). */
export function fromAtto(a: Atto): string {
  const neg = a < 0n;
  const abs = neg ? -a : a;
  const i = abs / E18;
  const f = (abs % E18).toString().padStart(18, '0').replace(/0+$/, '');
  return `${neg ? '-' : ''}${i}${f ? '.' + f : ''}`;
}

// --------------------------------------------------- Decimal primitives

/** Decimal * Decimal (truncating). */
export const dMul = (a: Atto, b: Atto): Atto => (a * b) / E18;
/** Decimal / Decimal (truncating). */
export const dDiv = (a: Atto, b: Atto): Atto => {
  if (b === 0n) throw new Error('Division by zero');
  return (a * E18) / b;
};

/** Floor integer square root (Newton from an upper bound), for non-negative BigInt. */
export function isqrt(n: bigint): bigint {
  if (n < 0n) throw new Error('isqrt of negative');
  if (n < 2n) return n;
  // Seed strictly above the root: 2^(ceil(bits/2)) ≥ sqrt(n).
  const bits = n.toString(2).length;
  let x = 1n << BigInt((bits >> 1) + 1);
  for (;;) {
    const y = (x + n / x) >> 1n;
    if (y >= x) return x;
    x = y;
  }
}

/** Decimal::checked_sqrt — sqrt(a * 1e18) as integer. */
export const dSqrt = (a: Atto): Atto => isqrt(a * E18);

// ----------------------------------------------------------- swap_math.rs

/**
 * calculate_virtual_amounts: real reserves → virtual reserves (base e36),
 * such that real x is exhausted at `upper` and real y at `lower` price-sqrt.
 */
export function calculateVirtualAmounts(
  realX: Atto,
  realY: Atto,
  upperLimit: Atto,
  lowerLimit: Atto,
): { virtualX: bigint; virtualY: bigint } {
  if (!(realX > 0n || realY > 0n)) throw new Error('Real x or y must be positive');
  const x = realX,
    y = realY,
    ll = lowerLimit,
    ul = upperLimit;

  const a = (ll * E36) / ul - E36; // e36 (negative)
  const b = x * ll + (y * E36) / ul; // e36
  const c = x * y; // e36

  const d = b * b - 4n * a * c; // e72
  const dSq = isqrt(d); // e36
  const liq = ((-b - dSq) * E36) / (2n * a); // e36

  const virtualX = x * E18 + (liq * E18) / ul; // e36
  const virtualY = y * E18 + (liq * ll) / E18; // e36
  return { virtualX, virtualY };
}

/** calculate_swap: output for a given input against virtual reserves (e36). */
export function calculateSwap(inputA: Atto, reserveA: bigint, reserveB: bigint): Atto {
  const inp = inputA * E18;
  return (inp * reserveB) / (reserveA + inp) / E18;
}

/** calculate_swap_inverse: input needed for a given output. */
export function calculateSwapInverse(outputB: Atto, reserveA: bigint, reserveB: bigint): Atto {
  const out = outputB * E18;
  return (reserveA * out) / (reserveB - out) / E18;
}

/**
 * calculate_price: virtual_y / virtual_x as a Decimal (e18). Despite the Rust
 * docstring calling it "price sqrt", this is the plain XRD-per-LSULP price and
 * is what get_info().price returns.
 */
export function calculatePrice(virtualX: bigint, virtualY: bigint): Atto {
  return (virtualY * E18) / virtualX;
}

// ------------------------------------------------------------ pool model

export type PoolParams = {
  reserveX: Atto; // LSULP
  reserveY: Atto; // XRD
  oraclePrice: Atto; // XRD per LSULP (NAV)
  upperOffset: Atto;
  lowerOffset: Atto;
  fee: Atto;
  protocolFeeShare: Atto;
  treasuryFeeShare: Atto;
};

export function limits(p: PoolParams) {
  return {
    upperLimit: dSqrt(dMul(p.oraclePrice, p.upperOffset)),
    lowerLimit: dSqrt(dMul(p.oraclePrice, p.lowerOffset)),
  };
}

export function virtualReserves(p: PoolParams) {
  const { upperLimit, lowerLimit } = limits(p);
  return calculateVirtualAmounts(p.reserveX, p.reserveY, upperLimit, lowerLimit);
}

/** Mirrors get_info().price: XRD per LSULP the pool currently quotes (mid). */
export function poolPrice(p: PoolParams): Atto {
  if (p.reserveX === 0n && p.reserveY === 0n) return 0n;
  const { virtualX, virtualY } = virtualReserves(p);
  return calculatePrice(virtualX, virtualY);
}

export type SwapQuote = {
  direction: 'x_for_y' | 'y_for_x';
  inputAmount: Atto; // what the user sends
  usedInput: Atto; // consumed by the pool (≤ inputAmount)
  remainder: Atto; // returned to user untouched
  output: Atto;
  fee: Atto;
  protocolFee: Atto;
  treasuryFee: Atto;
  liquidityFee: Atto;
  partial: boolean; // opposite reserve exhausted
  /** effective XRD-per-LSULP price of this trade (output/input or input/output). */
  effectivePrice: Atto;
};

/**
 * Mirrors _swap_x_for_y / _swap_y_for_x exactly, including the
 * fee-before-swap and the exhaustion (partial fill) branch.
 */
export function quoteSwap(p: PoolParams, direction: SwapQuote['direction'], inputAmount: Atto): SwapQuote {
  const xForY = direction === 'x_for_y';
  const reserveIn = xForY ? p.reserveX : p.reserveY;
  const reserveOut = xForY ? p.reserveY : p.reserveX;
  void reserveIn;

  const empty: SwapQuote = {
    direction,
    inputAmount,
    usedInput: 0n,
    remainder: inputAmount,
    output: 0n,
    fee: 0n,
    protocolFee: 0n,
    treasuryFee: 0n,
    liquidityFee: 0n,
    partial: true,
    effectivePrice: 0n,
  };
  if (inputAmount <= 0n) return { ...empty, partial: false };
  if (reserveOut === 0n) return empty;

  const { virtualX, virtualY } = virtualReserves(p);
  const vIn = xForY ? virtualX : virtualY;
  const vOut = xForY ? virtualY : virtualX;
  const oneMinusFee = E18 - p.fee;

  const swapOut = calculateSwap(dMul(inputAmount, oneMinusFee), vIn, vOut);
  let usedInput: Atto;
  let output: Atto;
  let partial = false;
  if (swapOut <= reserveOut) {
    usedInput = inputAmount;
    output = swapOut;
  } else {
    let swapIn = calculateSwapInverse(reserveOut, vIn, vOut);
    if (swapIn <= 0n) swapIn = 1n;
    usedInput = dDiv(swapIn, oneMinusFee);
    output = reserveOut;
    partial = true;
  }

  const fee = dMul(usedInput, p.fee);
  const protocolFee = dMul(fee, p.protocolFeeShare);
  const treasuryFee = dMul(fee, p.treasuryFeeShare);
  const liquidityFee = fee - protocolFee - treasuryFee;

  // On ledger, take_advanced(..., OUTGOING) rounds the fee buckets *down*
  // and the deposit takes `used - protocol - treasury`; the remainder is
  // whatever is left in the input bucket.
  const remainder = inputAmount - usedInput;
  const effectivePrice =
    output === 0n || usedInput === 0n
      ? 0n
      : xForY
        ? dDiv(output, usedInput) // XRD per LSULP
        : dDiv(usedInput, output);

  return {
    direction,
    inputAmount,
    usedInput,
    remainder: remainder < 0n ? 0n : remainder,
    output,
    fee,
    protocolFee,
    treasuryFee,
    liquidityFee,
    partial,
    effectivePrice,
  };
}

// --------------------------------------------- TwoResourcePool LP maths

/**
 * Native TwoResourcePool `contribute` with both reserves > 0: the pool takes
 * the largest amounts matching the current ratio and returns the excess.
 * Pool units minted = supply × min(ax/rx, ay/ry).
 */
export function quoteAddLiquidity(
  reserveX: Atto,
  reserveY: Atto,
  lpSupply: Atto,
  amountX: Atto,
  amountY: Atto,
): { lpOut: Atto; usedX: Atto; usedY: Atto; remainderX: Atto; remainderY: Atto } {
  if (amountX <= 0n && amountY <= 0n)
    return { lpOut: 0n, usedX: 0n, usedY: 0n, remainderX: 0n, remainderY: 0n };
  if (reserveX === 0n || reserveY === 0n || lpSupply === 0n) {
    // Degenerate; native pool has special cases. Treat as full contribution.
    return { lpOut: 0n, usedX: amountX, usedY: amountY, remainderX: 0n, remainderY: 0n };
  }
  // Compare ratios ax/rx vs ay/ry via cross-multiplication (exact).
  const xLimited = amountX * reserveY <= amountY * reserveX;
  if (xLimited) {
    const usedY = (amountX * reserveY) / reserveX;
    const lpOut = (amountX * lpSupply) / reserveX;
    return { lpOut, usedX: amountX, usedY, remainderX: 0n, remainderY: amountY - usedY };
  }
  const usedX = (amountY * reserveX) / reserveY;
  const lpOut = (amountY * lpSupply) / reserveY;
  return { lpOut, usedX, usedY: amountY, remainderX: amountX - usedX, remainderY: 0n };
}

/** Amount of the other side that matches the pool ratio. */
export const matchRatio = (amount: Atto, reserveFrom: Atto, reserveTo: Atto): Atto =>
  reserveFrom === 0n ? 0n : (amount * reserveTo) / reserveFrom;

/** Native TwoResourcePool `redeem`: pro-rata share of both reserves. */
export function quoteRemoveLiquidity(
  reserveX: Atto,
  reserveY: Atto,
  lpSupply: Atto,
  lpAmount: Atto,
): { outX: Atto; outY: Atto } {
  if (lpSupply === 0n || lpAmount <= 0n) return { outX: 0n, outY: 0n };
  return { outX: (reserveX * lpAmount) / lpSupply, outY: (reserveY * lpAmount) / lpSupply };
}

/** Apply a tolerance (basis points) downward: floor(a × (1 − bps/10000)). */
export const applySlippage = (a: Atto, bps: number): Atto =>
  (a * BigInt(10000 - Math.round(bps))) / 10000n;

/** Truncate an atto amount to a token's divisibility (floor), so withdraws/deposits respect the resource's decimals. */
export function truncToDivisibility(a: Atto, divisibility: number): Atto {
  const drop = BigInt(10) ** BigInt(18 - Math.min(18, Math.max(0, divisibility)));
  return (a / drop) * drop;
}

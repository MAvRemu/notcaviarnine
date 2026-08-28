'use client';

import Image from 'next/image';
import { useState } from 'react';
import { TOKENS, type ResourceSymbol } from '@/lib/radix/config';
import { fmt, sanitizeDecimalInput } from '@/lib/format';
import { fromAtto } from '@/lib/hyperstake/math';

export function TokenInput({
  symbol,
  icon,
  value,
  onChange,
  balance,
  readOnly,
  label,
  hint,
  maxDp,
}: {
  /** a known symbol from config, or any symbol string when `icon` is provided explicitly */
  symbol: ResourceSymbol | string;
  icon?: string;
  value: string;
  onChange?: (v: string) => void;
  balance?: bigint | null;
  readOnly?: boolean;
  label: string;
  hint?: string;
  /** token divisibility — inputs are trimmed to this many decimals (default 18) */
  maxDp?: number;
}) {
  const t = { symbol, icon: icon ?? (symbol in TOKENS ? TOKENS[symbol as ResourceSymbol].icon : undefined) };
  return (
    <div className="field px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="label">{label}</span>
        {balance !== undefined && balance !== null && (
          <button
            type="button"
            className="text-xs text-muted hover:text-ink disabled:cursor-default"
            disabled={readOnly || !onChange}
            onClick={() => onChange?.(fromAtto(balance))}
            title="Use full balance"
          >
            Balance <span className="num">{fmt(balance, { dp: 4 })}</span>
            {!readOnly && onChange && <span className="ml-1 font-semibold text-accent-text">MAX</span>}
          </button>
        )}
      </div>
      <div className="mt-1 flex min-w-0 items-center gap-3">
        <input
          className="input min-w-0"
          inputMode="decimal"
          placeholder="0"
          value={value}
          readOnly={readOnly}
          onChange={(e) => onChange?.(sanitizeDecimalInput(e.target.value, maxDp))}
          aria-label={`${label} amount in ${symbol}`}
        />
        <div className="flex shrink-0 items-center gap-2 rounded-full border border-line bg-card py-1 pl-1 pr-3">
          <TokenIcon src={t.icon} />
          <span className="text-sm font-semibold">{symbol}</span>
        </div>
      </div>
      {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
    </div>
  );
}

function TokenIcon({ src }: { src?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <span className="inline-block h-6 w-6 rounded-full border border-line bg-bg-deep" />;
  return <Image src={src} alt="" width={24} height={24} className="rounded-full" unoptimized onError={() => setFailed(true)} />;
}

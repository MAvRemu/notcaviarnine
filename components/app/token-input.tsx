'use client';

import Image from 'next/image';
import { TOKENS, type ResourceSymbol } from '@/lib/radix/config';
import { fmt, sanitizeDecimalInput } from '@/lib/format';
import { fromAtto } from '@/lib/hyperstake/math';

export function TokenInput({
  symbol,
  value,
  onChange,
  balance,
  readOnly,
  label,
  hint,
}: {
  symbol: ResourceSymbol;
  value: string;
  onChange?: (v: string) => void;
  balance?: bigint | null;
  readOnly?: boolean;
  label: string;
  hint?: string;
}) {
  const t = TOKENS[symbol];
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
            {!readOnly && onChange && <span className="ml-1 font-semibold text-accent">MAX</span>}
          </button>
        )}
      </div>
      <div className="mt-1 flex items-center gap-3">
        <input
          className="input"
          inputMode="decimal"
          placeholder="0"
          value={value}
          readOnly={readOnly}
          onChange={(e) => onChange?.(sanitizeDecimalInput(e.target.value))}
          aria-label={`${label} amount in ${symbol}`}
        />
        <div className="flex shrink-0 items-center gap-2 rounded-full border border-line bg-card py-1 pl-1 pr-3">
          <Image src={t.icon} alt="" width={24} height={24} className="rounded-full" />
          <span className="text-sm font-semibold">{symbol}</span>
        </div>
      </div>
      {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
    </div>
  );
}

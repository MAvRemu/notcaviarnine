'use client';

import { usePool } from './pool-context';

const PRESETS = [10, 50, 100];

export function SlippageControl() {
  const { slippageBps, setSlippageBps } = usePool();
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="label">Min-receive tolerance</span>
      <div className="flex items-center gap-1">
        {PRESETS.map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => setSlippageBps(b)}
            className="chip"
            data-selected={slippageBps === b}
          >
            {(b / 100).toFixed(b % 100 ? 1 : 0)}%
          </button>
        ))}
        <label className="chip ml-1 gap-1">
          <input
            className="num w-10 bg-transparent text-right outline-none"
            inputMode="decimal"
            value={PRESETS.includes(slippageBps) ? '' : (slippageBps / 100).toString()}
            placeholder="…"
            onChange={(e) => {
              const n = Number(e.target.value);
              if (!Number.isNaN(n) && n >= 0 && n <= 50) setSlippageBps(Math.round(n * 100));
            }}
            aria-label="Custom tolerance percent"
          />
          %
        </label>
      </div>
    </div>
  );
}

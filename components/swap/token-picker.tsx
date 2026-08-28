'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { SwapToken } from '@/lib/swap/astrolescent';
import { fmtNum } from '@/lib/format';

/** Curated majors, pinned by exact address so symbol imposters can't slip in. */
export const CURATED: { address: string; symbol: string }[] = [
  { address: 'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd', symbol: 'XRD' },
  { address: 'resource_rdx1thksg5ng70g9mmy9ne7wz0sc7auzrrwy7fmgcxzel2gvp8pj0xxfmf', symbol: 'LSULP' },
  { address: 'resource_rdx1t4upr78guuapv5ept7d7ptekk9mqhy605zgms33mcszen8l9fac8vf', symbol: 'xUSDC' },
  { address: 'resource_rdx1thrvr3xfs2tarm2dl9emvs26vjqxu6mqvfgvqjne940jv0lnrrg7rw', symbol: 'xUSDT' },
  { address: 'resource_rdx1t580qxc7upat7lww4l2c4jckacafjeudxj5wpjrrct0p3e82sq4y75', symbol: 'xwBTC' },
  { address: 'resource_rdx1th88qcj5syl9ghka2g9l7tw497vy5x6zaatyvgfkwcfe8n9jt2npww', symbol: 'xETH' },
  { address: 'resource_rdx1t4tjx4g3qzd98nayqxm7qdpj0a0u8ns6a0jrchq49dyfevgh6u0gj3', symbol: 'ASTRL' },
];
export const XRD_ADDRESS = CURATED[0].address;
const CURATED_ADDR = new Set(CURATED.map((c) => c.address));
const CURATED_SYM = new Set(CURATED.map((c) => c.symbol));

/** A token whose symbol matches a curated major but whose address doesn't is treated as an imposter. */
export function filterImposters(tokens: SwapToken[]): SwapToken[] {
  return tokens.filter((t) => !CURATED_SYM.has(t.symbol) || CURATED_ADDR.has(t.address));
}

export function TokenSelect({
  tokens,
  balances,
  value,
  excluded,
  onSelect,
  label,
}: {
  tokens: SwapToken[];
  balances: Record<string, string>;
  value: SwapToken | null;
  /** address that may not be picked (the other side of the pair) */
  excluded?: string;
  onSelect: (t: SwapToken) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="chip shrink-0 gap-1.5 bg-card !px-2.5"
        aria-label={`${label}: choose token`}
      >
        <Icon src={value?.iconUrl} />
        <span className="font-semibold">{value?.symbol ?? 'Select'}</span>
        <span aria-hidden className="text-muted">▾</span>
      </button>
      {open && (
        <PickerModal
          tokens={tokens}
          balances={balances}
          excluded={excluded}
          onClose={() => setOpen(false)}
          onSelect={(t) => { onSelect(t); setOpen(false); }}
        />
      )}
    </>
  );
}

function PickerModal({
  tokens,
  balances,
  excluded,
  onSelect,
  onClose,
}: {
  tokens: SwapToken[];
  balances: Record<string, string>;
  excluded?: string;
  onSelect: (t: SwapToken) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    const held = (a: string) => Number(balances[a] ?? 0) > 0;
    const list = tokens
      .filter((t) => t.address !== excluded)
      .filter((t) => !s || t.symbol.toLowerCase().includes(s) || t.name.toLowerCase().includes(s) || t.address.toLowerCase().includes(s));
    // held tokens first, then curated majors, then alphabetical
    return list.sort((a, b) => {
      const ha = held(a.address) ? 1 : 0, hb = held(b.address) ? 1 : 0;
      if (ha !== hb) return hb - ha;
      const ca = CURATED_ADDR.has(a.address) ? 1 : 0, cb = CURATED_ADDR.has(b.address) ? 1 : 0;
      if (ca !== cb) return cb - ca;
      return a.symbol.localeCompare(b.symbol);
    });
  }, [tokens, q, excluded, balances]);

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center bg-black/60 p-4 pt-[12vh]" onClick={onClose} role="dialog" aria-modal="true" aria-label="Choose token">
      <div className="card w-full max-w-md p-0" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-3 border-b border-line p-4">
          <input
            ref={inputRef}
            className="field h-11 w-full px-4 text-sm outline-none"
            placeholder={`Search ${tokens.length} tokens by name or address…`}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search tokens"
          />
          <div className="flex flex-wrap gap-1.5">
            {CURATED.map((c) => {
              const t = tokens.find((x) => x.address === c.address);
              if (!t || t.address === excluded) return null;
              return (
                <button key={c.address} type="button" className="chip gap-1.5" onClick={() => onSelect(t)}>
                  <Icon src={t.iconUrl} size={16} />{c.symbol}
                </button>
              );
            })}
          </div>
        </div>
        <ul className="max-h-[46vh] overflow-y-auto">
          {rows.slice(0, 80).map((t) => (
            <li key={t.address}>
              <button type="button" onClick={() => onSelect(t)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-bg-deep/60">
                <Icon src={t.iconUrl} size={26} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-2"><span className="font-semibold">{t.symbol}</span><span className="truncate text-xs text-muted">{t.name}</span></span>
                  <span className="num block text-[11px] text-muted">{t.address.slice(0, 18)}…{t.address.slice(-6)}</span>
                </span>
                {Number(balances[t.address] ?? 0) > 0 && <span className="num text-sm">{fmtNum(Number(balances[t.address]), { compact: true })}</span>}
              </button>
            </li>
          ))}
          {rows.length === 0 && <li className="p-6 text-sm text-muted">No token matches.</li>}
          {rows.length > 80 && <li className="px-4 py-3 text-xs text-muted">{rows.length - 80} more — refine your search.</li>}
        </ul>
      </div>
    </div>
  );
}

function Icon({ src, size = 20 }: { src?: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <span style={{ width: size, height: size }} className="inline-block shrink-0 rounded-full border border-bg bg-bg-deep" />;
  return <Image src={src} alt="" width={size} height={size} className="shrink-0 rounded-full border border-bg bg-bg-deep" unoptimized onError={() => setFailed(true)} />;
}

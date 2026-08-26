'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { PoolSnapshot } from '@/lib/pool-data';
import { toPoolParams } from '@/lib/hyperstake/state';
import { type PoolParams, toAtto } from '@/lib/hyperstake/math';
import { RESOURCES } from '@/lib/radix/config';
import { getAccountFungibles } from '@/lib/radix/gateway';
import { useWallet } from '@/components/radix/rdt-provider';

export type Balances = { XRD: bigint; LSULP: bigint; HLP: bigint };

type Ctx = {
  snapshot: PoolSnapshot | null;
  params: PoolParams | null;
  hlpSupply: bigint;
  error: string | null;
  refresh: () => Promise<void>;
  balances: Balances | null;
  refreshBalances: () => Promise<void>;
  slippageBps: number;
  setSlippageBps: (bps: number) => void;
};

const PoolContext = createContext<Ctx | null>(null);
const POLL_MS = 20_000;

export function PoolProvider({ initial, children }: { initial: PoolSnapshot | null; children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<PoolSnapshot | null>(initial);
  const [error, setError] = useState<string | null>(null);
  const [balances, setBalances] = useState<Balances | null>(null);
  const [slippageBps, setSlippageBpsState] = useState(50);
  const { account } = useWallet();
  const inflight = useRef<Promise<void> | null>(null);

  useEffect(() => {
    try {
      const v = localStorage.getItem('n9.slippageBps');
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe: localStorage is client-only, read once after mount
      if (v) setSlippageBpsState(Number(v));
    } catch {}
  }, []);
  const setSlippageBps = useCallback((bps: number) => {
    setSlippageBpsState(bps);
    try { localStorage.setItem('n9.slippageBps', String(bps)); } catch {}
  }, []);

  const refresh = useCallback(async () => {
    if (inflight.current) return inflight.current;
    inflight.current = (async () => {
      try {
        const res = await fetch('/api/pool', { cache: 'no-store' });
        if (!res.ok) throw new Error(`pool ${res.status}`);
        setSnapshot((await res.json()) as PoolSnapshot);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'failed to load pool');
      } finally {
        inflight.current = null;
      }
    })();
    return inflight.current;
  }, []);

  const loadBalances = useCallback(async (): Promise<Balances | null> => {
    if (!account) return null;
    const b = await getAccountFungibles(account.address);
    return {
      XRD: toAtto(b[RESOURCES.XRD] ?? '0'),
      LSULP: toAtto(b[RESOURCES.LSULP] ?? '0'),
      HLP: toAtto(b[RESOURCES.HLP] ?? '0'),
    };
  }, [account]);

  const refreshBalances = useCallback(async () => {
    try {
      const b = await loadBalances();
      setBalances(b);
    } catch {
      /* keep previous */
    }
  }, [loadBalances]);

  useEffect(() => {
    if (!initial) refresh();
    const id = setInterval(refresh, POLL_MS);
    const onVis = () => document.visibilityState === 'visible' && refresh();
    document.addEventListener('visibilitychange', onVis);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', onVis); };
  }, [refresh, initial]);

  useEffect(() => {
    let cancelled = false;
    loadBalances()
      .then((b) => { if (!cancelled) setBalances(b); })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [loadBalances]);

  const params = useMemo(() => (snapshot ? toPoolParams(snapshot.state) : null), [snapshot]);
  const hlpSupply = useMemo(() => (snapshot ? toAtto(snapshot.state.hlpSupply) : 0n), [snapshot]);

  return (
    <PoolContext.Provider value={{ snapshot, params, hlpSupply, error, refresh, balances, refreshBalances, slippageBps, setSlippageBps }}>
      {children}
    </PoolContext.Provider>
  );
}

export function usePool() {
  const c = useContext(PoolContext);
  if (!c) throw new Error('usePool outside PoolProvider');
  return c;
}

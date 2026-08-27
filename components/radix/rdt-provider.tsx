'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getRdt, type Rdt } from '@/lib/radix/rdt';
import { trackEvent } from '@/lib/analytics';

export type WalletAccount = { address: string; label: string; appearanceId: number };

type Ctx = {
  ready: boolean;
  accounts: WalletAccount[];
  account: WalletAccount | null;
  selectAccount: (address: string) => void;
  sendTransaction: (manifest: string, message?: string) => Promise<{ ok: true; txId: string } | { ok: false; error: string }>;
};

const RdtContext = createContext<Ctx | null>(null);

export function RdtProvider({ children }: { children: ReactNode }) {
  const [rdt, setRdt] = useState<Rdt | null>(null);
  const [accounts, setAccounts] = useState<WalletAccount[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    let sub: { unsubscribe(): void } | undefined;
    let cancelled = false;
    getRdt().then((r) => {
      if (cancelled) return;
      setRdt(r);
      let had = false;
      sub = r.walletApi.walletData$.subscribe((d) => {
        setAccounts(d.accounts.map((a) => ({ address: a.address, label: a.label, appearanceId: a.appearanceId })));
        if (d.accounts.length && !had) { had = true; trackEvent('wallet_connected'); }
      });
    });
    return () => {
      cancelled = true;
      sub?.unsubscribe();
    };
  }, []);

  const account = useMemo(() => {
    if (!accounts.length) return null;
    return accounts.find((a) => a.address === selected) ?? accounts[0];
  }, [accounts, selected]);

  const value = useMemo<Ctx>(
    () => ({
      ready: Boolean(rdt),
      accounts,
      account,
      selectAccount: setSelected,
      sendTransaction: async (transactionManifest, message) => {
        if (!rdt) return { ok: false, error: 'Wallet toolkit not ready' };
        const res = await rdt.walletApi.sendTransaction({ transactionManifest, version: 1, message });
        if (res.isErr()) {
          const e = res.error as { message?: string; error?: string };
          return { ok: false, error: e.message ?? e.error ?? 'Transaction rejected' };
        }
        return { ok: true, txId: res.value.transactionIntentHash };
      },
    }),
    [rdt, accounts, account],
  );

  return <RdtContext.Provider value={value}>{children}</RdtContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(RdtContext);
  if (!ctx) throw new Error('useWallet outside RdtProvider');
  return ctx;
}

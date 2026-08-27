'use client';

import { dashboardUrl } from '@/lib/radix/config';

export type TxState =
  | { phase: 'idle' }
  | { phase: 'previewing' }
  | { phase: 'signing' }
  | { phase: 'done'; txId: string }
  | { phase: 'error'; error: string };

export function TxStatus({ state, onDismiss }: { state: TxState; onDismiss: () => void }) {
  if (state.phase === 'idle') return null;
  const tone =
    state.phase === 'done' ? 'border-ok/40 bg-ok/10' : state.phase === 'error' ? 'border-danger/40 bg-danger/10' : 'border-accent/40 bg-accent/10';
  return (
    <div className={`flex items-start justify-between gap-3 rounded-lg border px-3 py-2 text-sm ${tone}`} role="status">
      <div>
        {state.phase === 'previewing' && 'Simulating transaction on the Gateway…'}
        {state.phase === 'signing' && 'Review and sign in your Radix Wallet…'}
        {state.phase === 'done' && (
          <>
            Committed.{' '}
            <a className="underline underline-offset-2" href={dashboardUrl(state.txId)} target="_blank" rel="noreferrer">
              View on Radix Dashboard ↗
            </a>
          </>
        )}
        {state.phase === 'error' && <span className="text-danger">{state.error}</span>}
      </div>
      {(state.phase === 'done' || state.phase === 'error') && (
        <button className="text-xs text-muted hover:text-ink" onClick={onDismiss} aria-label="Dismiss">✕</button>
      )}
    </div>
  );
}

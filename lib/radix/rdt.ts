'use client';

import type { RadixDappToolkit as RdtType } from '@radixdlt/radix-dapp-toolkit';
import { DAPP_DEFINITION_ADDRESS, NETWORK_ID } from './config';

export type Rdt = ReturnType<typeof RdtType>;

let instance: Rdt | null = null;
let loading: Promise<Rdt> | null = null;

/**
 * Lazily instantiate the official Radix dApp Toolkit on the client. The
 * package touches `window` at import time, so it is dynamically imported
 * from a client component only.
 */
export function getRdt(): Promise<Rdt> {
  if (instance) return Promise.resolve(instance);
  if (loading) return loading;
  loading = import('@radixdlt/radix-dapp-toolkit').then(({ RadixDappToolkit, DataRequestBuilder }) => {
    const rdt = RadixDappToolkit({
      dAppDefinitionAddress: DAPP_DEFINITION_ADDRESS,
      networkId: NETWORK_ID,
      applicationName: 'Not CaviarNine',
      applicationVersion: '0.1.0',
    });
    rdt.walletApi.setRequestData(DataRequestBuilder.accounts().atLeast(1));
    rdt.buttonApi.setTheme('white-with-outline');
    rdt.buttonApi.setMode('dark');
    instance = rdt;
    return rdt;
  });
  return loading;
}

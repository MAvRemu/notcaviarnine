import { GATEWAY_URL } from './config';

/**
 * Minimal, dependency-free Radix Gateway client (server + client safe).
 * Only the endpoints this app needs; shapes are narrowed to what we read.
 */

export class GatewayError extends Error {
  constructor(
    public path: string,
    public status: number,
    body: string,
  ) {
    super(`Gateway ${path} → ${status}: ${body.slice(0, 300)}`);
  }
}

export async function gatewayPost<T>(
  path: string,
  body: unknown,
  init?: { revalidate?: number },
): Promise<T> {
  const res = await fetch(`${GATEWAY_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    ...(init?.revalidate === undefined
      ? { cache: 'no-store' as const }
      : { next: { revalidate: init.revalidate } }),
  });
  if (!res.ok) throw new GatewayError(path, res.status, await res.text());
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------- types

export type MetadataItem = {
  key: string;
  value: { typed: { type: string; value?: string; values?: string[] } };
};

export type ProgrammaticField = {
  kind: string;
  field_name?: string;
  type_name?: string;
  /** string for most kinds; JSON boolean for Bool */
  value?: string | boolean;
  variant_id?: string;
  fields?: ProgrammaticField[];
};

export type EntityDetailsItem = {
  address: string;
  metadata?: { items: MetadataItem[] };
  details?: {
    type: 'Component' | 'FungibleResource' | 'NonFungibleResource' | string;
    blueprint_name?: string;
    total_supply?: string;
    state?: { fields?: ProgrammaticField[] };
  };
  fungible_resources?: {
    items: {
      resource_address: string;
      amount?: string; // aggregation_level: Global
      vaults?: { items: { amount: string }[] }; // aggregation_level: Vault
    }[];
  };
};

export type LedgerState = {
  network: string;
  state_version: number;
  proposer_round_timestamp: string;
  epoch: number;
  round: number;
};

export type StreamTransaction = {
  state_version: number;
  intent_hash: string;
  round_timestamp: string;
  confirmed_at?: string;
  transaction_status: 'CommittedSuccess' | 'CommittedFailure' | string;
  fee_paid?: string;
  receipt?: {
    events?: {
      name: string;
      emitter: { type: string; entity?: { entity_address: string } };
      data: { fields?: ProgrammaticField[] };
    }[];
  };
  balance_changes?: {
    fungible_balance_changes?: {
      entity_address: string;
      resource_address: string;
      balance_change: string;
    }[];
  };
};

export const meta = (items: MetadataItem[] | undefined, key: string) =>
  items?.find((i) => i.key === key)?.value.typed.value;

export const field = (fields: ProgrammaticField[] | undefined, name: string): string | undefined => {
  const v = fields?.find((f) => f.field_name === name)?.value;
  return v === undefined ? undefined : String(v);
};

// ------------------------------------------------------------- endpoints

export async function getEntityDetails(
  addresses: string[],
  opts: { explicitMetadata?: string[]; revalidate?: number } = {},
): Promise<{ ledger_state: LedgerState; items: EntityDetailsItem[] }> {
  return gatewayPost(
    '/state/entity/details',
    {
      addresses,
      aggregation_level: 'Global',
      opt_ins: { explicit_metadata: opts.explicitMetadata ?? ['name', 'symbol'] },
    },
    { revalidate: opts.revalidate },
  );
}

export async function getGatewayStatus(): Promise<{ ledger_state: LedgerState }> {
  return gatewayPost('/status/gateway-status', {});
}

export type StreamOpts = {
  affected?: string[];
  emitters?: string[];
  /** transactions in which one of these badge resources was presented (e.g. an admin badge) */
  badges?: string[];
  cursor?: string;
  limit?: number;
  order?: 'Asc' | 'Desc';
  fromStateVersion?: number;
  receiptEvents?: boolean;
  balanceChanges?: boolean;
};

export async function streamTransactions(o: StreamOpts): Promise<{
  ledger_state: LedgerState;
  next_cursor?: string;
  items: StreamTransaction[];
}> {
  return gatewayPost('/stream/transactions', {
    ...(o.affected ? { affected_global_entities_filter: o.affected } : {}),
    ...(o.emitters ? { event_global_emitters_filter: o.emitters } : {}),
    ...(o.badges ? { manifest_badges_presented_filter: o.badges } : {}),
    ...(o.cursor ? { cursor: o.cursor } : {}),
    ...(o.fromStateVersion
      ? { from_ledger_state: { state_version: o.fromStateVersion } }
      : {}),
    limit_per_page: o.limit ?? 100,
    order: o.order ?? 'Desc',
    kind_filter: 'User',
    opt_ins: {
      receipt_events: o.receiptEvents ?? false,
      balance_changes: o.balanceChanges ?? false,
    },
  });
}

/** Preview a manifest without signing. Uses free credit so no fee lock needed. */
export async function previewManifest(manifest: string): Promise<{
  receipt: {
    status: 'Succeeded' | 'Failed' | 'Rejected';
    error_message?: string;
    output?: { programmatic_json: ProgrammaticField }[];
    fee_summary?: {
      xrd_total_execution_cost: string;
      xrd_total_finalization_cost: string;
      xrd_total_storage_cost: string;
      xrd_total_royalty_cost: string;
    };
  };
}> {
  const { ledger_state } = await getGatewayStatus();
  return gatewayPost('/transaction/preview', {
    manifest,
    start_epoch_inclusive: ledger_state.epoch,
    end_epoch_exclusive: ledger_state.epoch + 2,
    tip_percentage: 0,
    nonce: Math.floor(Math.random() * 2 ** 31),
    signer_public_keys: [],
    flags: {
      use_free_credit: true,
      assume_all_signature_proofs: true,
      skip_epoch_check: true,
    },
  });
}

/** Fungible balances of one account (Global aggregation, first page). */
export async function getAccountFungibles(
  account: string,
): Promise<Record<string, string>> {
  const res = await gatewayPost<{
    items: { resource_address: string; amount: string }[];
  }>('/state/entity/page/fungibles/', {
    address: account,
    aggregation_level: 'Global',
    limit_per_page: 100,
  });
  return Object.fromEntries(res.items.map((i) => [i.resource_address, i.amount]));
}

/** All keys of a KeyValueStore (drains cursor pages). Returns string keys + newest update state version. */
export async function getKeyValueStoreKeys(
  address: string,
): Promise<{ keys: string[]; lastUpdatedStateVersion: number | null }> {
  const keys: string[] = [];
  let last: number | null = null;
  let cursor: string | undefined;
  for (let i = 0; i < 20; i++) {
    const res = await gatewayPost<{
      next_cursor?: string;
      items: { key: { programmatic_json: ProgrammaticField }; last_updated_at_state_version: number }[];
    }>('/state/key-value-store/keys', {
      key_value_store_address: address,
      limit_per_page: 100,
      ...(cursor ? { cursor } : {}),
    });
    for (const it of res.items) {
      keys.push(String(it.key.programmatic_json.value));
      last = Math.max(last ?? 0, it.last_updated_at_state_version);
    }
    if (!res.next_cursor) break;
    cursor = res.next_cursor;
  }
  return { keys, lastUpdatedStateVersion: last };
}

/** Approximate wall-clock time of a state version (first tx at/after it). */
export async function stateVersionToTime(stateVersion: number): Promise<string | null> {
  const res = await streamTransactions({ fromStateVersion: stateVersion, order: 'Asc', limit: 1 });
  return res.items[0]?.round_timestamp ?? null;
}

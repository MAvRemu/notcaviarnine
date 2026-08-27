import { ADDRESSES, RESOURCES } from '@/lib/radix/config';
import { field, streamTransactions, type StreamTransaction } from '@/lib/radix/gateway';
import { SIMPLE_POOL_FEE_VAULTS, SIMPLE_POOL_PACKAGE } from '@/lib/simplepool/registry';
import { SHAPE_FACTORY } from '@/lib/shape/registry';

/**
 * Governance watchtower. Every owner action on a CaviarNine contract must present the C9 Admin Badge, and the
 * Gateway can filter transactions by badge presented — so one query enumerates all admin actions across all products.
 * We decode the events those transactions emitted into plain-language entries.
 */

const KNOWN: Record<string, string> = {
  [ADDRESSES.hyperStake]: 'HyperStake',
  [ADDRESSES.hyperStakePool]: 'HyperStake pool',
  [ADDRESSES.lsuPool]: 'LSU Pool',
  [ADDRESSES.lsuTokenValidator]: 'LSU approved-validator list',
  [ADDRESSES.feeVaults]: 'HyperStake fee vaults (CAVIAR)',
  [SIMPLE_POOL_FEE_VAULTS]: 'FLOOP fee vaults',
  'component_rdx1cqvfnpl0ld49rhwyhu4v3r05962yeplmasggtzlu9r2dmh7amx6vpn': 'FLOOP fee vaults (LSU Pool)',
  'component_rdx1cq02u55jpx685eejm0lj25rk5qcc002dahc37lmghlrh8cc0kre5cr': 'Shape fee controller',
  'component_rdx1cqp2xu6cwryg5n2k4xsuzk57qvj2zy4z53mg53587jaszxdv3kxv8t': 'Shape token list',
  [SHAPE_FACTORY]: 'Shape factory',
  [RESOURCES.LSULP]: 'LSULP token',
  [RESOURCES.HLP]: 'HLP token',
  [RESOURCES.XRD]: 'XRD',
};
void SIMPLE_POOL_PACKAGE;

export type GovernanceAction = {
  kind: 'fee' | 'role' | 'list' | 'treasury' | 'metadata' | 'other';
  severity: 'info' | 'watch';
  text: string;
  target: string;
  targetAddress: string;
  /** how many identical actions were folded into this one (e.g. 9 pairs set to the same fee) */
  count: number;
};

export type GovernanceEntry = {
  intentHash: string;
  timestamp: string;
  stateVersion: number;
  actions: GovernanceAction[];
};

const name = (a: string) => KNOWN[a] ?? (a.startsWith('component_') ? `contract ${a.slice(0, 18)}…` : a.startsWith('resource_') ? `token ${a.slice(0, 16)}…` : a);
const pctFromHundredths = (v: string) => `${(Number(v) / 10_000).toFixed(v.length > 3 ? 3 : 2)}%`;
const pct = (v: string) => `${(Number(v) * 100).toFixed(2)}%`;

function decode(tx: StreamTransaction): GovernanceAction[] {
  const out: GovernanceAction[] = [];
  for (const e of tx.receipt?.events ?? []) {
    const em = e.emitter.entity?.entity_address ?? '';
    if (!em || em.startsWith('account_') || em.startsWith('internal_')) continue;
    const g = (k: string) => field(e.data.fields, k);
    const t = name(em);
    const push = (a: Omit<GovernanceAction, 'count'>) => {
      const same = out.find((x) => x.text === a.text && x.targetAddress === a.targetAddress);
      if (same) same.count += 1; else out.push({ ...a, count: 1 });
    };
    switch (e.name) {
      case 'SetLiquidityFeeEvent': {
        const fee = g('fee') ?? '';
        const isController = em === 'component_rdx1cq02u55jpx685eejm0lj25rk5qcc002dahc37lmghlrh8cc0kre5cr';
        push({ kind: 'fee', severity: 'watch', target: t, targetAddress: em, text: isController ? `Liquidity fee set to ${pctFromHundredths(fee)} for a Shape pair` : `Liquidity fee set to ${pct(fee)}` });
        break;
      }
      case 'SetProtocolFeeEvent': push({ kind: 'fee', severity: 'watch', target: t, targetAddress: em, text: `Protocol fee set to ${em.includes('cq02u55') ? pctFromHundredths(g('fee') ?? '') : pct(g('protocol_fee') ?? g('fee') ?? '')}` }); break;
      case 'SetReserveFeeEvent': push({ kind: 'fee', severity: 'watch', target: t, targetAddress: em, text: `Reserve fee set to ${pct(g('reserve_fee') ?? '')}` }); break;
      case 'SetTreasuryPercentageEvent': push({ kind: 'fee', severity: 'watch', target: t, targetAddress: em, text: `Treasury share set to ${pct(g('treasury_percentage') ?? '')}` }); break;
      case 'SetBurnPercentageEvent': push({ kind: 'fee', severity: 'watch', target: t, targetAddress: em, text: `Burn share set to ${pct(g('burn_percentage') ?? '')}` }); break;
      case 'SetSwapAmountEvent': push({ kind: 'fee', severity: 'info', target: t, targetAddress: em, text: `Fee-vault auction start price set to ${g('swap_amount')}` }); break;
      case 'SetMaxEpochsEvent': push({ kind: 'fee', severity: 'info', target: t, targetAddress: em, text: `Fee-vault auction length set to ${g('max_epochs')} epochs` }); break;
      case 'TreasuryWithdrawEvent': push({ kind: 'treasury', severity: 'watch', target: t, targetAddress: em, text: `Treasury withdrawal: ${Number(g('amount')).toLocaleString('en-US', { maximumFractionDigits: 0 })} ${name(g('resource_address') ?? '')}` }); break;
      case 'ReserveWithdrawEvent': push({ kind: 'treasury', severity: 'watch', target: t, targetAddress: em, text: `Reserve withdrawal: ${g('amount')}` }); break;
      case 'UpdateActiveSetEvent': push({ kind: 'list', severity: 'info', target: t, targetAddress: em, text: `${g('contain') === 'true' ? 'Validator approved' : 'Validator removed from the approved list'} (${(g('resource_address') ?? '').slice(0, 16)}…)` }); break;
      case 'SetRequireActiveEvent': push({ kind: 'list', severity: 'watch', target: t, targetAddress: em, text: `Approved-list requirement ${g('require_active') === 'true' ? 'enabled' : 'disabled'}` }); break;
      case 'SetTokenValidatorEvent': push({ kind: 'list', severity: 'watch', target: t, targetAddress: em, text: 'Token/validator list contract replaced' }); break;
      case 'SetRestrictFreezableEvent': case 'SetRestrictRecallableEvent': push({ kind: 'list', severity: 'info', target: t, targetAddress: em, text: `${e.name.replace('SetRestrict', 'Restriction on ').replace('Event', '').toLowerCase()} tokens: ${g('restrict')}` }); break;
      case 'SetRoleEvent': { const rk = g('role_key') ?? ''; push({ kind: 'role', severity: rk === 'user' || rk.includes('user') ? 'watch' : 'info', target: t, targetAddress: em, text: `Access rule changed for role "${rk}"` }); break; }
      case 'SetOwnerRoleEvent': push({ kind: 'role', severity: 'watch', target: t, targetAddress: em, text: 'Owner rule changed' }); break;
      case 'SetMetadataEvent': push({ kind: 'metadata', severity: 'info', target: t, targetAddress: em, text: `Metadata "${g('key')}" updated` }); break;
      case 'BurnFungibleResourceEvent': case 'MintFungibleResourceEvent': case 'VaultCreationEvent': case 'DepositEvent': case 'WithdrawEvent': case 'PayFeeEvent': case 'LockFeeEvent':
        break; // fee payment / plumbing
      default:
        if (/Set|Update|Withdraw|Pause|Rule/.test(e.name)) push({ kind: 'other', severity: 'info', target: t, targetAddress: em, text: e.name.replace(/Event$/, '').replace(/([a-z])([A-Z])/g, '$1 $2') });
    }
  }
  return out.map((a) => (a.count > 1 && a.kind === 'fee' ? { ...a, text: a.text.replace('for a Shape pair', `for ${a.count} Shape pairs`) } : a));
}

const TTL = 10 * 60_000;
let memo: { at: number; p: Promise<GovernanceEntry[]> } | null = null;

/** Most recent admin-badge transactions (up to `limit`) decoded into entries; empty `actions` entries are dropped. */
export function getGovernanceLog(limit = 60): Promise<GovernanceEntry[]> {
  if (memo && Date.now() - memo.at < TTL) return memo.p;
  const p = (async () => {
    const entries: GovernanceEntry[] = [];
    let cursor: string | undefined;
    while (entries.length < limit) {
      const res = await streamTransactions({ badges: [ADDRESSES.c9AdminBadge], limit: 100, cursor, receiptEvents: true });
      for (const tx of res.items) {
        const actions = decode(tx);
        if (actions.length) entries.push({ intentHash: tx.intent_hash, timestamp: tx.round_timestamp, stateVersion: tx.state_version, actions });
      }
      if (!res.next_cursor) break;
      cursor = res.next_cursor;
    }
    return entries.slice(0, limit);
  })();
  memo = { at: Date.now(), p };
  p.catch(() => (memo = null));
  return p;
}

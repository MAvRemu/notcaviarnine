/**
 * One-off: turn the admin account into a Radix dApp Definition for notcaviarnine.com.
 *
 *   npx tsx scripts/setup-dapp-definition.mts --dry-run   # preview only (no funds needed)
 *   npx tsx scripts/setup-dapp-definition.mts             # sign + submit (account needs ~10 XRD)
 *
 * Reads the key from .env.admin.local (never on Vercel). Two-way verification is
 * completed by public/.well-known/radix.json listing this address.
 * MetadataValue discriminators: String=0, Url=13, OriginArray=142 (radix-engine-interface metadata models).
 */
import { readFileSync } from 'node:fs';
import {
  Convert,
  NetworkId,
  PrivateKey,
  RadixEngineToolkit,
  TransactionBuilder,
  type TransactionHeader,
  type TransactionManifest,
} from '@radixdlt/radix-engine-toolkit';

const env = Object.fromEntries(
  readFileSync('.env.admin.local', 'utf8')
    .split('\n')
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]),
);
const GATEWAY = 'https://mainnet.radixdlt.com';
const ACCOUNT = env.DAPP_DEFINITION_ADDRESS;
const SITE = process.env.SITE_ORIGIN ?? 'https://notcaviarnine.com';
const dryRun = process.argv.includes('--dry-run');

const pk = new PrivateKey.Ed25519(env.DAPP_DEFINITION_ADMIN_PRIVATE_KEY_HEX);
const derived = await RadixEngineToolkit.Derive.virtualAccountAddressFromPublicKey(pk.publicKey(), NetworkId.Mainnet);
if (derived !== ACCOUNT) throw new Error(`Key does not match ${ACCOUNT} (derives ${derived})`);

const str = (s: string) => `Enum<0u8>("${s.replace(/"/g, '\\"')}")`;
const url = (s: string) => `Enum<13u8>("${s}")`;
const origins = (xs: string[]) => `Enum<142u8>(Array<String>(${xs.map((x) => `"${x}"`).join(', ')}))`;

const manifestBody = `
SET_METADATA Address("${ACCOUNT}") "account_type" ${str('dapp definition')};
SET_METADATA Address("${ACCOUNT}") "name" ${str('NotCaviarNine')};
SET_METADATA Address("${ACCOUNT}") "description" ${str('Independent, non-custodial console for CaviarNine's contracts on Radix — HyperStake, Simple Pools, Shape Liquidity and the LSU Pool. CaviarNine is leaving, but contracts never die. Not affiliated with CaviarNine.')};
SET_METADATA Address("${ACCOUNT}") "icon_url" ${url(`${SITE}/dapp-icon.png`)};
SET_METADATA Address("${ACCOUNT}") "claimed_websites" ${origins([SITE])};
SET_METADATA Address("${ACCOUNT}") "tags" Enum<128u8>(Array<String>("dapp", "defi", "hyperstake"));
`.trim();
// Dry-run uses Gateway free credit, so no lock_fee (the empty account has no XRD vault yet).
const rtm = dryRun ? `${manifestBody}\n` : `CALL_METHOD Address("${ACCOUNT}") "lock_fee" Decimal("5");\n${manifestBody}\n`;

const status = await (await fetch(`${GATEWAY}/status/gateway-status`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' })).json();
const epoch: number = status.ledger_state.epoch;

// Always preview first.
const preview = await (
  await fetch(`${GATEWAY}/transaction/preview`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      manifest: rtm,
      start_epoch_inclusive: epoch,
      end_epoch_exclusive: epoch + 5,
      tip_percentage: 0,
      nonce: Math.floor(Math.random() * 1e9),
      signer_public_keys: [{ key_type: 'EddsaEd25519', key_hex: env.DAPP_DEFINITION_ADMIN_PUBLIC_KEY_HEX }],
      flags: { use_free_credit: dryRun, assume_all_signature_proofs: false, skip_epoch_check: false },
    }),
  })
).json();
console.log('preview:', preview.receipt?.status, preview.receipt?.error_message ?? '');
console.log('fee (XRD):', preview.receipt?.fee_summary?.xrd_total_execution_cost, '+ storage', preview.receipt?.fee_summary?.xrd_total_storage_cost);
if (preview.receipt?.status !== 'Succeeded') process.exit(1);
if (dryRun) { console.log(rtm); process.exit(0); }

const header: TransactionHeader = {
  networkId: NetworkId.Mainnet,
  startEpochInclusive: epoch,
  endEpochExclusive: epoch + 5,
  nonce: Math.floor(Math.random() * 2 ** 31),
  notaryPublicKey: pk.publicKey(),
  notaryIsSignatory: true,
  tipPercentage: 0,
};
const manifest: TransactionManifest = { instructions: { kind: 'String', value: rtm }, blobs: [] };
const builder = await TransactionBuilder.new();
const notarized = await builder.header(header).manifest(manifest).notarize(pk);
const txId = await RadixEngineToolkit.NotarizedTransaction.intentHash(notarized);
const compiled = await RadixEngineToolkit.NotarizedTransaction.compile(notarized);
const submit = await (
  await fetch(`${GATEWAY}/transaction/submit`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ notarized_transaction_hex: Convert.Uint8Array.toHexString(compiled) }),
  })
).json();
console.log('submitted:', submit, '\ntx:', txId.id, `\nhttps://dashboard.radixdlt.com/transaction/${txId.id}`);
for (let i = 0; i < 20; i++) {
  await new Promise((r) => setTimeout(r, 3000));
  const st = await (await fetch(`${GATEWAY}/transaction/status`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ intent_hash: txId.id }) })).json();
  console.log('status:', st.status, st.error_message ?? '');
  if (st.status !== 'Pending' && st.status !== 'Unknown') break;
}

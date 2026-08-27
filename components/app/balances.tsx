'use client';

import Image from 'next/image';
import { usePool } from './pool-context';
import { useWallet } from '@/components/radix/rdt-provider';
import { TOKENS } from '@/lib/radix/config';
import { fmt, shortAddr } from '@/lib/format';
import { dMul, quoteRemoveLiquidity, toAtto } from '@/lib/hyperstake/math';

export function Balances() {
  const { balances, params, hlpSupply, snapshot } = usePool();
  const { account, accounts, selectAccount } = useWallet();

  if (!account) {
    return (
      <div className="card p-5">
        <div className="label mb-2">Your position</div>
        <p className="text-sm text-muted">Connect your Radix Wallet to see balances and your HLP position.</p>
      </div>
    );
  }
  const hlp = balances?.HLP ?? 0n;
  const redemption = params ? quoteRemoveLiquidity(params.reserveX, params.reserveY, hlpSupply, hlp) : null;
  const hlpXrd = redemption && params ? redemption.outY + dMul(redemption.outX, params.oraclePrice) : 0n;
  const lsulpXrd = params && balances ? dMul(balances.LSULP, params.oraclePrice) : 0n;
  const share = hlpSupply > 0n && hlp > 0n ? Number(hlp * 1_000_000n / hlpSupply) / 10_000 : 0;

  return (
    <div className="card p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="label">Your position</div>
        {accounts.length > 1 ? (
          <select className="rounded-full border border-line bg-bg px-2 py-1 text-xs" value={account.address} onChange={(e) => selectAccount(e.target.value)} aria-label="Account">
            {accounts.map((a) => <option key={a.address} value={a.address}>{a.label} · {shortAddr(a.address, 4)}</option>)}
          </select>
        ) : (
          <span className="num text-xs text-muted" title={account.address}>{account.label} · {shortAddr(account.address, 4)}</span>
        )}
      </div>
      <div className="divide-y divide-line">
        <Line icon={TOKENS.XRD.icon} sym="XRD" amount={balances?.XRD} sub={null} />
        <Line icon={TOKENS.LSULP.icon} sym="LSULP" amount={balances?.LSULP} sub={balances ? `≈ ${fmt(lsulpXrd, { dp: 2 })} XRD at NAV` : null} />
        <Line icon={TOKENS.HLP.icon} sym="HLP" amount={balances?.HLP} sub={redemption && balances ? `= ${fmt(redemption.outX, { dp: 2 })} LSULP + ${fmt(redemption.outY, { dp: 2 })} XRD ≈ ${fmt(hlpXrd, { dp: 2 })} XRD · ${share.toFixed(3)}% of pool` : null} />
      </div>
      {snapshot && (
        <div className="mt-3 text-xs text-muted">1 HLP ≈ <span className="num">{fmt(snapshot.state.hlpValueXrd, { dp: 4 })}</span> XRD · 1 LSULP = <span className="num">{fmt(toAtto(snapshot.state.nav), { dp: 4 })}</span> XRD (NAV)</div>
      )}
    </div>
  );
}

function Line({ icon, sym, amount, sub }: { icon: string; sym: string; amount: bigint | undefined; sub: string | null }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="flex items-center gap-2">
        <Image src={icon} alt="" width={22} height={22} className="rounded-full" />
        <span className="text-sm font-semibold">{sym}</span>
      </div>
      <div className="text-right">
        <div className={`num text-sm ${amount === undefined ? 'skeleton inline-block w-24' : ''}`}>{amount === undefined ? '0.00' : fmt(amount, { dp: 4 })}</div>
        {sub && <div className="num text-[11px] text-muted">{sub}</div>}
      </div>
    </div>
  );
}

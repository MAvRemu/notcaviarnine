import Link from 'next/link';
import { ADDRESSES, LINKS, dashboardUrl } from '@/lib/radix/config';
import { Wordmark } from './wordmark';

export function SiteFooter() {
  return (
    <footer className="hairline mt-24 border-t">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-4">
          <Wordmark />
          <p className="max-w-sm text-sm text-muted">
            An independent, non-custodial frontend for the HyperStake LSULP/XRD pool on Radix. Not affiliated with,
            endorsed by, or operated by CaviarNine. The smart contracts were built and deployed by CaviarNine and remain
            under their on-ledger ownership.
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <div className="label mb-3">On ledger</div>
          <a className="block hover:underline" href={dashboardUrl(ADDRESSES.hyperStake)} target="_blank" rel="noreferrer">HyperStake component ↗</a>
          <a className="block hover:underline" href={dashboardUrl(ADDRESSES.hyperStakePool)} target="_blank" rel="noreferrer">LSULP/XRD pool ↗</a>
          <a className="block hover:underline" href={dashboardUrl(ADDRESSES.lsuPool)} target="_blank" rel="noreferrer">LSU Pool (oracle) ↗</a>
          <a className="block hover:underline" href={LINKS.hyperStakeSource} target="_blank" rel="noreferrer">Contract source ↗</a>
        </div>
        <div className="space-y-2 text-sm">
          <div className="label mb-3">Site</div>
          <Link className="block hover:underline" href="/hyperstake">Launch app</Link>
          <Link className="block hover:underline" href="/#status">Status</Link>
          <Link className="block hover:underline" href="/disclaimer">Disclaimer</Link>
          <Link className="block hover:underline" href="/terms">Terms of Use</Link>
          <a className="block hover:underline" href={LINKS.frontendRepo} target="_blank" rel="noreferrer">Frontend source ↗</a>
          <a className="block hover:underline" href="mailto:info@notcaviarnine.com">info@notcaviarnine.com</a>
        </div>
      </div>
      <div className="mx-auto max-w-6xl space-y-1 px-6 pb-10 text-xs text-muted">
        <p>CaviarNine is leaving, but contracts never die. · Use at your own risk · notcaviarnine.com</p>
        <p>CaviarNine, HyperStake, Shape Liquidity and the token names are trademarks of their respective owners, used only to identify the contracts this site interacts with. Not available in sanctioned jurisdictions.</p>
      </div>
    </footer>
  );
}

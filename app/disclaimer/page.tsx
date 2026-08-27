import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteFooter } from '@/components/site-footer';
import { Wordmark } from '@/components/wordmark';
import { LINKS } from '@/lib/radix/config';

export const metadata: Metadata = { title: 'Disclaimer' };

export default function Disclaimer() {
  return (
    <>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Wordmark />
        <Link href="/hyperstake" className="btn btn-sm">Launch App</Link>
      </header>
      <main className="prose mx-auto max-w-3xl px-6 py-12">
        <h1 className="display text-5xl">Disclaimer</h1>
        <p className="mt-6 text-muted">Last updated 26 August 2026</p>

        <h2>Not affiliated with CaviarNine</h2>
        <p>
          notcaviarnine.com (&ldquo;NotCaviarNine&rdquo;, &ldquo;we&rdquo;) is an independent project. We are not affiliated with, endorsed by,
          or operated by CaviarNine or its team. &ldquo;CaviarNine&rdquo;, &ldquo;HyperStake&rdquo; and related names refer to the protocol and
          smart contracts that CaviarNine built and deployed on the Radix network; we use them descriptively.
        </p>

        <h2>What this site is</h2>
        <p>
          A non-custodial web interface. It reads public ledger data from the Radix Gateway and helps you construct transaction
          manifests that interact with the existing HyperStake smart contracts. We never hold your keys or funds, never take custody,
          and cannot move your assets. Every transaction is reviewed and signed by you, in your own Radix Wallet, and executed by the
          Radix network — not by us.
        </p>

        <h2>What we do not control</h2>
        <ul>
          <li>The smart contracts, their parameters, fee shares and roles. These are owned on-ledger by CaviarNine&apos;s admin badge.</li>
          <li>The LSU Pool oracle that HyperStake prices against, or the LSU active-set allowlist it enforces.</li>
          <li>The Radix network, its Gateway, or the Radix Wallet.</li>
        </ul>
        <p>
          We show the current state of these dependencies on the <Link href="/#status">status section</Link> to the best of our knowledge,
          but it may be incomplete or outdated.
        </p>

        <h2>Risks</h2>
        <p>
          Using DeFi protocols involves risk, including but not limited to: smart-contract bugs, oracle staleness or manipulation,
          governance actions by the contract owner, loss of liquidity, and price movements between LSULP and XRD. Liquidity providers
          may receive back a different mix of LSULP and XRD than they deposited. Displayed prices, quotes, APRs and other figures are
          estimates derived from public ledger data and may be wrong. You could lose all funds you commit.
        </p>

        <h2>No advice, no warranty</h2>
        <p>
          Nothing on this site is financial, investment, legal or tax advice. The site and its source code are provided &ldquo;as is&rdquo;,
          without warranty of any kind. To the maximum extent permitted by law, we are not liable for any loss or damage arising
          from your use of this site or the underlying protocol.
        </p>

        <h2>Your responsibility</h2>
        <p>
          You are responsible for verifying every transaction in your wallet before signing, for the legality of your use of this site
          in your jurisdiction, and for your own tax obligations. Do not use this site if you do not understand these risks.
        </p>

        <h2>Availability</h2>
        <p>
          The site may be unavailable, delayed or discontinued at any time. Because the protocol lives on the Radix network, you can always
          reach your assets without this site — through your wallet, the Radix Dashboard, or any other interface.
        </p>

        <h2>Privacy</h2>
        <p>
          We do not require accounts and do not store personal data. Your wallet address is used in your browser to read balances from the
          public Radix Gateway. We use Vercel Analytics for aggregated, cookie-less page statistics. Third-party services you connect to
          (Radix Wallet, Radix Gateway, Radix Dashboard) have their own policies.
        </p>

        <h2>Links to third parties</h2>
        <p>
          We link to CaviarNine documentation and other external sites for reference. We do not control them and are not responsible for
          their content or availability.
        </p>

        <h2>Open source</h2>
        <p>
          The frontend source is public at <a href={LINKS.frontendRepo} target="_blank" rel="noreferrer">github.com/MAvRemu/notcaviarnine</a>.
          The contract source is public at <a href={LINKS.scryptoRepo} target="_blank" rel="noreferrer">github.com/caviarnine/caviarnine-scrypto</a>.
          Verify, don&apos;t trust.
        </p>

        <p className="text-muted">
          See also our <Link href="/terms">Terms of Use</Link>. Contact: <a href="mailto:info@notcaviarnine.com">info@notcaviarnine.com</a>.
          We may update this disclaimer; the date above shows the current version.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}

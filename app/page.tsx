import Link from 'next/link';
import { SiteFooter } from '@/components/site-footer';
import { Wordmark } from '@/components/wordmark';
import { StatsStrip } from '@/components/landing/stats-strip';
import { StatusSection } from '@/components/landing/status-section';
import { getPoolSnapshot } from '@/lib/pool-data';
import { LINKS } from '@/lib/radix/config';

export const revalidate = 60;

export default async function Home() {
  const snap = await getPoolSnapshot().catch(() => null);
  return (
    <>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Wordmark />
        <nav className="flex items-center gap-5 text-sm">
          <a href="#how" className="hidden text-muted hover:text-ink sm:inline">How it works</a>
          <a href="#status" className="hidden text-muted hover:text-ink sm:inline">Status</a>
          <a href={LINKS.frontendRepo} target="_blank" rel="noreferrer" className="hidden text-muted hover:text-ink sm:inline">Source ↗</a>
          <Link href="/app" className="btn h-10">Launch App</Link>
        </nav>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 pb-16 pt-14 md:pt-24">
          <p className="label mb-5">HyperStake · LSULP / XRD · Radix mainnet</p>
          <h1 className="display max-w-4xl text-[clamp(2.5rem,7vw,5.75rem)]">
            CaviarNine is gone.<br />
            <span className="hl">But contracts never die.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-ink-soft">
            CaviarNine is leaving Radix and its website is going withdraw-only. The HyperStake contracts stay live on ledger.
            This independent frontend keeps them usable: instant stake and unstake XRD, or provide LSULP/XRD liquidity and earn the fees.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/app" className="btn btn-accent h-12 px-6 text-base">Launch App</Link>
            <a href="#how" className="btn btn-ghost h-12">How it works</a>
          </div>
        </section>

        <StatsStrip snap={snap} />

        <section id="how" className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="display text-4xl md:text-5xl">How HyperStake works</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            <Step n="01" title="One pool, two tokens">
              A native Radix pool holds LSULP (a basket of validator stake) and XRD. LPs hold HLP, a pro-rata claim on both.
            </Step>
            <Step n="02" title="A curve that follows NAV">
              Every swap reads the live LSULP value and rebuilds a concentrated curve between 98.5% and 100% of NAV. Nothing to rebalance.
            </Step>
            <Step n="03" title="Fees from impatience">
              Unstakers who won&apos;t wait 7 days sell LSULP below NAV; stakers buy the discount. Each swap pays 0.1%: 80% to LPs, 20% to
              CaviarNine&apos;s vaults — set on-ledger.
            </Step>
          </div>
        </section>

        <StatusSection snap={snap} />

        <section className="inverted">
          <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-8 md:grid-cols-[1fr_1.2fr]">
            <div>
              <div className="label mb-3">In their words</div>
              <h2 className="display text-3xl md:text-4xl">&ldquo;Anyone can build and run their own front end.&rdquo;</h2>
              <p className="mt-4 text-sm text-muted">
                — Tronn, CaviarNine,{' '}
                <a className="underline underline-offset-2" href={LINKS.c9Announcement} target="_blank" rel="noreferrer">Telegram, 21 Aug 2026 ↗</a>
              </p>
            </div>
            <blockquote className="space-y-3 border-l-2 border-accent pl-5 text-base text-ink-soft">
              <p>&ldquo;We are not switching the DEX off. The smart contracts stay live on ledger. What changes is our website.&rdquo;</p>
              <p>&ldquo;Anyone can build and run their own front end to any of the components, today or in a year. That&apos;s the point of self-custodial DeFi and it&apos;s why we built it this way.&rdquo;</p>
            </blockquote>
          </div>
          <p className="mt-6 text-sm text-muted">
            Thank you, Oliver, Chris and the CaviarNine team, for five years of building on Radix and for open-sourcing the contracts.
          </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="num text-sm text-accent-deep">{n}</div>
      <h3 className="mt-2 text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-ink-soft">{children}</p>
    </div>
  );
}

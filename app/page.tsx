import Link from 'next/link';
import { Suspense } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { Wordmark } from '@/components/wordmark';
import { ConsoleStrip } from '@/components/landing/console-strip';
import { ProductsSection } from '@/components/landing/products-section';
import { StatusSection } from '@/components/landing/status-section';
import { getPoolSnapshot } from '@/lib/pool-data';
import { getSimplePoolSummaries } from '@/lib/simplepool/registry';
import { getShapeSummary } from '@/lib/shape/registry';
import { getGovernanceLog } from '@/lib/governance/watch';
import { LINKS } from '@/lib/radix/config';


/** Live data is streamed in behind skeletons so the page shell (hero, products, quote) renders instantly. */
async function LiveConsole() {
  const [snap, pools, shape] = await Promise.all([
    getPoolSnapshot().catch(() => null),
    getSimplePoolSummaries().catch(() => null),
    getShapeSummary().catch(() => null),
  ]);
  return <ConsoleStrip snap={snap} pools={pools} shape={shape} />;
}

async function LiveStatus() {
  const [snap, pools, shape, governance] = await Promise.all([
    getPoolSnapshot().catch(() => null),
    getSimplePoolSummaries().catch(() => null),
    getShapeSummary().catch(() => null),
    getGovernanceLog(12).catch(() => null),
  ]);
  return <StatusSection snap={snap} pools={pools} shape={shape} governance={governance} />;
}

function ConsoleSkeleton() {
  return (
    <section className="hairline border-y">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-7 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-2"><div className="skeleton h-3 w-24" /><div className="skeleton h-7 w-36" /><div className="skeleton h-3 w-40" /></div>
        ))}
      </div>
    </section>
  );
}

function StatusSkeleton() {
  return (
    <section id="status" className="hairline border-y bg-bg-deep/60">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="label mb-3">Status · who keeps what running</div>
        <h2 className="display text-4xl md:text-5xl">What still depends on CaviarNine</h2>
        <div className="mt-12 space-y-4">{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-14" />)}</div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Wordmark />
        <nav className="flex items-center gap-5 text-sm">
          <a href="#products" className="hidden text-muted hover:text-ink sm:inline">Products</a>
          <a href="#status" className="hidden text-muted hover:text-ink sm:inline">Status</a>
          <a href={`${LINKS.frontendRepo}/tree/main/docs`} target="_blank" rel="noreferrer" className="hidden text-muted hover:text-ink sm:inline">Docs ↗</a>
          <Link href="/hyperstake" className="btn h-10">Open app</Link>
        </nav>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 pb-16 pt-14 md:pt-24">
          <p className="label mb-5">Independent frontend · Radix mainnet</p>
          <h1 className="display max-w-4xl text-[clamp(2.5rem,7vw,5.75rem)]">
            CaviarNine is gone.<br />
            <span className="hl">But contracts never die.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-ink-soft">
            CaviarNine is leaving Radix and its website is going withdraw-only. The contracts stay live on ledger — HyperStake,
            Simple Pools, Shape Liquidity and the LSU Pool. This independent console keeps them usable, starting with HyperStake.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/hyperstake" className="btn btn-accent h-12 px-6 text-base">Open the app</Link>
            <a href="#products" className="btn btn-ghost h-12">See all products</a>
          </div>
        </section>

        <Suspense fallback={<ConsoleSkeleton />}>
          <LiveConsole />
        </Suspense>

        <ProductsSection />

        <Suspense fallback={<StatusSkeleton />}>
          <LiveStatus />
        </Suspense>

        <section>
          <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="card grid gap-8 p-8 md:grid-cols-[1fr_1.2fr] md:p-12">
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

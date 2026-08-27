import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteFooter } from '@/components/site-footer';
import { Wordmark } from '@/components/wordmark';
import { LINKS } from '@/lib/radix/config';

export const metadata: Metadata = { title: 'Terms of Use' };

export default function Terms() {
  return (
    <>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Wordmark />
        <Link href="/hyperstake" className="btn btn-sm">Launch App</Link>
      </header>
      <main className="prose mx-auto max-w-3xl px-6 py-12">
        <h1 className="display text-5xl">Terms of Use</h1>
        <p className="mt-6 text-muted">Last updated 26 August 2026</p>
        <p>
          These terms govern your use of notcaviarnine.com and its app (the &ldquo;Site&rdquo;). By using the Site you agree to them.
          If you do not agree, do not use the Site. Please also read the <Link href="/disclaimer">Disclaimer</Link>, which forms part of these terms.
        </p>

        <h2>1. What the Site is</h2>
        <p>
          The Site is a software interface. It displays public data from the Radix network and helps you prepare transactions that
          interact with smart contracts deployed by CaviarNine (&ldquo;the Protocol&rdquo;). The Site does not hold, transfer, custody or
          control any assets, does not execute transactions, and is not a party to any transaction you make. All transactions are
          signed by you in your own wallet and executed by the Radix network.
        </p>

        <h2>2. Independence</h2>
        <p>
          We are not affiliated with CaviarNine, Radix, or any wallet provider. We do not control the Protocol, its parameters, its
          administrators, or the Radix network, and we make no representation about their behaviour, security or continued operation.
        </p>

        <h2>3. Eligibility</h2>
        <p>
          You may use the Site only if you are at least 18 years old (or the age of majority where you live), are legally permitted to
          use decentralised-finance software in your jurisdiction, and are not subject to sanctions or located in a sanctioned territory.
          The Site is not offered to persons in Cuba, Iran, North Korea, Syria, or the Crimea, Donetsk, Luhansk, Kherson and Zaporizhzhia
          regions of Ukraine, and we block access from those places. You are solely responsible for compliance with the laws that apply to
          you, including tax obligations.
        </p>

        <h2>4. Your responsibilities</h2>
        <ul>
          <li>Keep your wallet, keys and devices secure. We can never recover assets or reverse transactions.</li>
          <li>Review every transaction in your wallet before approving it. The Site&apos;s displayed quotes are estimates.</li>
          <li>Understand the risks described in the <Link href="/disclaimer">Disclaimer</Link> before committing funds.</li>
        </ul>

        <h2>5. Prohibited use</h2>
        <p>
          You may not use the Site to break any law, to launder money or evade sanctions, to interfere with the Site or the Radix
          network, to scrape or overload our services, or to misrepresent your relationship with us or with CaviarNine.
        </p>

        <h2>6. Fees</h2>
        <p>
          We charge no fee for using the Site. The Protocol charges a swap fee fixed in its contracts, part of which goes to CaviarNine,
          and the Radix network charges transaction fees. Both are shown in your wallet before you sign. We receive none of them.
        </p>

        <h2>7. Availability and changes</h2>
        <p>
          The Site is provided free of charge and may be changed, interrupted or discontinued at any time without notice. Because the
          Protocol runs on the Radix network, discontinuation of the Site does not affect your ability to access your assets through
          other means, including your wallet or other interfaces.
        </p>

        <h2>8. Intellectual property</h2>
        <p>
          The Site&apos;s source code is published at{' '}
          <a href={LINKS.frontendRepo} target="_blank" rel="noreferrer">github.com/MAvRemu/notcaviarnine</a> under the MIT licence.
          &ldquo;CaviarNine&rdquo;, &ldquo;HyperStake&rdquo;, &ldquo;Shape Liquidity&rdquo; and related names and logos are trademarks of CaviarNine
          Limited; &ldquo;Radix&rdquo; is a trademark of its owner. We use them only to identify the contracts and network the Site interacts
          with (nominative use). We claim no rights in them and are not endorsed by their owners.
        </p>

        <h2>9. No warranty</h2>
        <p>
          The Site is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, without warranties of any kind, express or implied, including
          accuracy of data, fitness for a particular purpose, or non-infringement.
        </p>

        <h2>10. Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, consequential or special damages,
          or for any loss of assets, profits or data, arising out of or in connection with your use of the Site or the Protocol,
          including losses caused by smart-contract behaviour, oracle data, network conditions, wallet software, or actions of the
          Protocol&apos;s administrators. Where liability cannot be excluded, it is limited to the amount you paid us to use the Site, which is zero.
        </p>

        <h2>11. Indemnity</h2>
        <p>
          You agree to indemnify us against claims, damages and costs arising from your breach of these terms or your unlawful use of the Site.
        </p>

        <h2>12. Governing law</h2>
        <p>
          These terms are governed by the laws of the Netherlands. Disputes shall be brought before the competent court in the Netherlands,
          without prejudice to mandatory consumer-protection rules that apply where you live.
        </p>

        <h2>13. Changes to these terms</h2>
        <p>
          We may update these terms; the date above shows the current version. Continued use of the Site after a change means you accept it.
        </p>

        <h2>14. Who operates this site</h2>
        <p>
          The Site is operated by an independent developer based in the Netherlands, on a non-commercial basis and without any fee,
          and is not affiliated with CaviarNine. Contact: <a href="mailto:info@notcaviarnine.com">info@notcaviarnine.com</a>, or open an
          issue at <a href={LINKS.frontendRepo} target="_blank" rel="noreferrer">the GitHub repository</a>. Security reports:
          see our <a href="/.well-known/security.txt">security.txt</a>.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}

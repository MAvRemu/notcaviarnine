import Link from 'next/link';

export function Wordmark({ href = '/', size = 'md' }: { href?: string; size?: 'md' | 'lg' }) {
  const text = size === 'lg' ? 'text-3xl' : 'text-xl';
  return (
    <Link href={href} className={`display inline-flex items-baseline gap-1.5 ${text} leading-none`} aria-label="Not CaviarNine">
      <span className="rounded-sm bg-accent px-1.5 py-0.5 font-sans text-[0.55em] font-bold uppercase tracking-[0.18em] text-ink">
        not
      </span>
      <span>CaviarNine</span>
    </Link>
  );
}

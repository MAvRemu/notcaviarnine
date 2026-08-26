import Link from 'next/link';

export function Wordmark({ href = '/', size = 'md' }: { href?: string; size?: 'md' | 'lg' }) {
  const text = size === 'lg' ? 'text-3xl' : 'text-xl';
  return (
    <Link
      href={href}
      className={`inline-flex items-baseline gap-2 ${text} font-bold leading-none tracking-tight`}
      aria-label="Not CaviarNine"
    >
      <span className="text-accent-deep">NOT</span>
      <span>CaviarNine</span>
    </Link>
  );
}

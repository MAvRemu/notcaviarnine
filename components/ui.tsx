/** Shared primitives so loading / empty / error states look identical everywhere. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}

export function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    <div className="card space-y-3 p-5">
      <Skeleton className="h-3 w-24" />
      {[...Array(rows)].map((_, i) => <Skeleton key={i} className="h-7" />)}
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-6 text-center text-sm text-muted">{children}</p>;
}

export function ErrorNote({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-danger">{children}</p>;
}

/** Eyebrow + title used at the top of every product page. */
export function PageHeader({ eyebrow, title, lede, aside }: { eyebrow: string; title: string; lede?: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <div className="label">{eyebrow}</div>
        <h1 className="display mt-1 text-2xl">{title}</h1>
        {lede && <p className="mt-2 max-w-2xl text-sm text-muted">{lede}</p>}
      </div>
      {aside}
    </div>
  );
}

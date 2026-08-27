export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="skeleton h-3 w-32" />
      <div className="skeleton mt-2 h-7 w-64" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="card h-[520px]" /><div className="card h-[520px]" />
      </div>
    </div>
  );
}

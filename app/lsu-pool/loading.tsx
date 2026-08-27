import { Skeleton, SkeletonCard } from '@/components/ui';

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="mt-2 h-7 w-64" />
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SkeletonCard rows={6} />
        <SkeletonCard rows={6} />
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import { AppShell } from '@/components/app/app-shell';
import { cachedPoolSnapshot } from '@/lib/cached';

export const metadata: Metadata = { title: 'HyperStake' };
export const dynamic = 'force-dynamic';

export default async function AppPage() {
  const initial = await cachedPoolSnapshot().catch(() => null);
  return <AppShell initial={initial} />;
}

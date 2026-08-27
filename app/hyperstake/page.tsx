import type { Metadata } from 'next';
import { AppShell } from '@/components/app/app-shell';
import { getPoolSnapshot } from '@/lib/pool-data';

export const metadata: Metadata = { title: 'HyperStake' };
export const dynamic = 'force-dynamic';

export default async function AppPage() {
  const initial = await getPoolSnapshot().catch(() => null);
  return <AppShell initial={initial} />;
}

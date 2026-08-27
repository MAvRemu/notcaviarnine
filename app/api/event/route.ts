import { db } from '@/lib/db/client';
import { analyticsEvents } from '@/lib/db/schema';

export const dynamic = 'force-dynamic';

const ALLOWED = new Set(['wallet_connected', 'tab_selected', 'tx_started', 'tx_preview_failed', 'tx_wallet_opened', 'tx_rejected', 'tx_committed']);

/** Anonymous event sink. Validates the shape, stores no IP, no address, no exact amounts. */
export async function POST(req: Request) {
  const d = db();
  if (!d) return new Response(null, { status: 204 });
  try {
    const body = (await req.json()) as { name?: string; props?: Record<string, string> };
    if (!body.name || !ALLOWED.has(body.name)) return new Response(null, { status: 204 });
    const props = Object.fromEntries(Object.entries(body.props ?? {}).filter(([k, v]) => typeof v === 'string' && v.length <= 80 && ['product', 'action', 'direction', 'size', 'reason'].includes(k)));
    await d.insert(analyticsEvents).values({ name: body.name, product: props.product ?? null, action: props.action ?? null, props: JSON.stringify(props).slice(0, 500) });
  } catch {
    /* never fail the client */
  }
  return new Response(null, { status: 204 });
}

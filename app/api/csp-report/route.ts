/** Receives CSP violation reports from the report-only policy; logged to Vercel function logs only. */
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const text = (await req.text()).slice(0, 4000);
    console.warn('[csp-report]', text);
  } catch {
    /* ignore */
  }
  return new Response(null, { status: 204 });
}

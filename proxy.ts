import { NextResponse, type NextRequest } from 'next/server';

/**
 * Sanctions geoblock (edge). Blocks page access from jurisdictions under comprehensive
 * OFAC / EU sanctions. Uses Vercel's geo headers; if they are absent (local dev), nothing is blocked.
 * The contracts themselves are permissionless — this only concerns *this* website.
 * See docs/LEGAL.md (private) for the reasoning; keep the list in sync with OFAC's comprehensive programs.
 */
const BLOCKED_COUNTRIES = new Set(['CU', 'IR', 'KP', 'SY']);
// Ukrainian regions under comprehensive sanctions: Crimea (43), Donetsk (14), Luhansk (09), Kherson (65), Zaporizhzhia (23).
const BLOCKED_UA_REGIONS = new Set(['43', '14', '09', '65', '23']);

export function proxy(request: NextRequest) {
  const country = request.headers.get('x-vercel-ip-country') ?? '';
  const region = request.headers.get('x-vercel-ip-country-region') ?? '';
  const blocked = BLOCKED_COUNTRIES.has(country) || (country === 'UA' && BLOCKED_UA_REGIONS.has(region));
  if (blocked && request.nextUrl.pathname !== '/restricted') {
    const url = request.nextUrl.clone();
    url.pathname = '/restricted';
    url.search = '';
    return NextResponse.rewrite(url, { status: 451 });
  }
  return NextResponse.next();
}

export const config = {
  // Pages only — skip API routes, Next internals, static files and the well-known dApp file.
  matcher: ['/((?!api|_next/static|_next/image|\\.well-known|favicon\\.ico|icon\\.png|apple-icon\\.png|dapp-icon\\.png|icons/).*)'],
};

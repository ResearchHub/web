import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';
import { withAuth, type NextRequestWithAuth } from 'next-auth/middleware';

import { SHARE_TOKEN_HEADER, SHARE_TOKEN_PARAM } from '@/lib/shareToken/constants';

// Gate protected routes on a valid session token.
// This is only an optimistic redirect — real authorization is enforced server-side
// (see services/client.ts).
const requireAuth = withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

// Moves `?st=` onto a header so the proposal layout can read it; layouts never
// receive `searchParams`. Cleared when absent so the URL stays the only source.
function forwardShareToken(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const shareToken = request.nextUrl.searchParams.get(SHARE_TOKEN_PARAM);

  if (shareToken) {
    requestHeaders.set(SHARE_TOKEN_HEADER, shareToken);
  } else {
    requestHeaders.delete(SHARE_TOKEN_HEADER);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

const isProposalRoute = (pathname: string) =>
  pathname === '/proposal' || pathname.startsWith('/proposal/');

export function proxy(request: NextRequest, event: NextFetchEvent) {
  // Proposal pages are public and matched only to forward the share token. Every
  // other route in the matcher is auth-gated, so a new public route needs a
  // branch here too.
  if (isProposalRoute(request.nextUrl.pathname)) {
    return forwardShareToken(request);
  }

  return requireAuth(request as NextRequestWithAuth, event);
}

export const config = {
  matcher: [
    '/notebook/:path*',
    '/notebook/api/:path*',
    '/referral',
    '/lists',
    '/list/:path*',
    '/proposal/:path*',
  ],
};

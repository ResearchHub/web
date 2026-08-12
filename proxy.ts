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

// Copies `?st=` onto a request header because layouts are never given
// `searchParams` — only pages are. The proposal layout is what fetches the work
// and calls `notFound()`, so it has to read the token from somewhere other than
// the query string. Cleared when absent so the URL stays the only source of
// truth and the header cannot be spoofed.
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

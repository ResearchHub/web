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

/**
 * Lifts a proposal share token off the query string and onto a request header.
 *
 * Next.js layouts never receive `searchParams`, and the proposal layout is the
 * thing that decides whether the page 404s, so `?st=` has to reach it some
 * other way. See lib/shareToken/server.ts for the read side.
 */
function forwardShareToken(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const shareToken = request.nextUrl.searchParams.get(SHARE_TOKEN_PARAM);

  // Set or clear unconditionally so the URL stays the only source of truth. A
  // spoofed header is not an escalation — the backend validates the token — but
  // letting one through would make the value non-deterministic.
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
  // Proposal pages are public and must never be auth-gated; they are matched
  // only so the share token can be forwarded. Everything else in the matcher
  // below is auth-gated, so adding another public route needs a branch here
  // too. Note this runs ahead of `requireAuth` deliberately: withAuth decrypts
  // the session cookie before consulting its `authorized` callback, so wrapping
  // proposal traffic in it would cost a JWE decrypt on every anonymous view.
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

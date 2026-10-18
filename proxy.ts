import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';
import { withAuth, type NextRequestWithAuth } from 'next-auth/middleware';

import { SHARE_TOKEN_HEADER, SHARE_TOKEN_PARAM } from '@/lib/shareToken/constants';
import { SITE_CONFIG } from '@/lib/metadata';

const HOMEPAGE_MARKDOWN = `# ResearchHub

${SITE_CONFIG.description}

The homepage shows public funding, peer-review and discussion activity. This is a platform overview; use the linked HTML pages for the current activity feed and research records.

## Explore ResearchHub

- [Activity feed](${SITE_CONFIG.url}/): Follow public research activity.
- [Requests for Proposals](${SITE_CONFIG.url}/fund): Browse research funding opportunities.
- [Research proposals](${SITE_CONFIG.url}/fund/proposals): Find proposals seeking funding.
- [ResearchHub Journal](${SITE_CONFIG.url}/journal): Learn about registered reports and publishing.
- [Peer review](${SITE_CONFIG.url}/peer-review): Learn about the peer-review process.
- [Documentation](https://docs.researchhub.com): Read platform guidance.

## Access and reuse

This overview contains no private account data or peer-review text. Use the linked pages for sign-in and account actions. Content reuse remains subject to the [Terms of Service](${SITE_CONFIG.url}/tos) and [AI policy](${SITE_CONFIG.url}/ai.txt); peer-review content has separate restrictions.
`;

function prefersMarkdown(accept: string | null): boolean {
  const ranges = (accept || '')
    .split(',')
    .map((range) => {
      const [media, ...parameters] = range.trim().toLowerCase().split(';');
      const quality = parameters.find((parameter) => parameter.trim().startsWith('q='));
      const q = quality ? Number(quality.trim().slice(2)) : 1;
      return { media: media.trim(), q: Number.isFinite(q) && q >= 0 && q <= 1 ? q : 0 };
    })
    .sort((first, second) => second.q - first.q);
  const markdown = ranges.find(({ media }) => media === 'text/markdown');
  if (!markdown || markdown.q === 0) return false;
  const html =
    ranges.find(({ media }) => media === 'text/html') ??
    ranges.find(({ media }) => media === 'text/*') ??
    ranges.find(({ media }) => media === '*/*');
  return markdown.q > (html?.q ?? 0);
}

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

// The workspace's start screen is public: a signed-out visitor can see it and
// type, and signs in when they send. A document open in it is someone's own,
// so that stays gated.
const isWorkspaceStart = (request: NextRequest) =>
  request.nextUrl.pathname === '/workspace' && !request.nextUrl.searchParams.has('note');

export function proxy(request: NextRequest, event: NextFetchEvent) {
  if (request.nextUrl.pathname === '/') {
    const isNavigation =
      [
        'rsc',
        'next-router-prefetch',
        'next-router-state-tree',
        'next-router-segment-prefetch',
      ].some((header) => request.headers.has(header)) ||
      request.headers.get('purpose') === 'prefetch' ||
      request.headers.get('sec-purpose')?.includes('prefetch');
    const response =
      (request.method === 'GET' || request.method === 'HEAD') &&
      !isNavigation &&
      prefersMarkdown(request.headers.get('accept'))
      ? new NextResponse(request.method === 'HEAD' ? null : HOMEPAGE_MARKDOWN, {
          headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'Cache-Control': 'no-store',
          },
        })
      : NextResponse.next();
    response.headers.append('Vary', 'Accept');
    return response;
  }
  // Proposal pages are public; the remaining routes retain their auth gates.
  if (isProposalRoute(request.nextUrl.pathname)) {
    return forwardShareToken(request);
  }
  if (isWorkspaceStart(request)) return NextResponse.next();

  return requireAuth(request as NextRequestWithAuth, event);
}

export const config = {
  matcher: [
    '/',
    '/notebook/:path*',
    '/notebook/api/:path*',
    '/workspace',
    '/referral',
    '/lists',
    '/list/:path*',
    '/proposal/:path*',
  ],
};

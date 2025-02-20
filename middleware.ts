import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { NextRequestWithAuth } from 'next-auth/middleware';

// Auth middleware for protected routes
const authMiddleware = withAuth(
  function middleware(request: NextRequest) {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return !!token && !!token.authToken;
      },
    },
    pages: {
      signIn: '/auth/signin',
    },
  }
);

// Export the middleware handler
export default async function middleware(request: NextRequest) {
  const response = await authMiddleware(
    request as NextRequestWithAuth,
    request.nextUrl.pathname as any
  );
  if (response instanceof Response) {
    response.headers.set('Cache-Control', 'no-store, max-age=0');
  }
  return response;
}

export const config = {
  matcher: ['/notebook/:path*', '/notebook/api/:path*'],
};

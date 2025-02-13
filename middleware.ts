import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { NextRequestWithAuth } from 'next-auth/middleware';

// Auth middleware for protected routes
const authMiddleware = withAuth(
  function middleware(request: NextRequest) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/auth/signin',
    },
  }
);

// Export the middleware handler
export default function middleware(request: NextRequest) {
  return authMiddleware(request as NextRequestWithAuth, request.nextUrl.pathname as any);
}

export const config = {
  matcher: ['/notebook/:path*', '/notebook/api/:path*'],
};

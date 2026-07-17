import { NextRequestWithAuth, withAuth } from 'next-auth/middleware';
import { NextRequest, NextResponse } from 'next/server';

// Main middleware function
export function middleware(request: NextRequest) {
  // For protected routes, use auth middleware
  return withAuth(request as NextRequestWithAuth, {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  });
}

export const config = {
  matcher: ['/notebook/:path*', '/notebook/api/:path*', '/referral', '/lists', '/list/:path*'],
};

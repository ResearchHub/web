import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // If there's no token but we're in the process of signing in, allow the request
        if (!token && req.cookies.get('next-auth.session-token')) {
          return true;
        }
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/notebook/:path*', '/notebook/api/:path*'],
};

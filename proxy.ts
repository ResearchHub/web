import { withAuth } from 'next-auth/middleware';

// Gate protected routes on a valid session token.
// This is only an optimistic redirect — real authorization is enforced server-side
// (see services/client.ts).
export const proxy = withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  matcher: ['/notebook/:path*', '/notebook/api/:path*', '/referral', '/lists', '/list/:path*'],
};

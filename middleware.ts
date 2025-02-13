import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { NextRequestWithAuth } from 'next-auth/middleware';
import { RecentPageView } from '@/types/search';

const MAX_RECENT_VIEWS = 10;
const RECENT_VIEWS_KEY = 'recent_views';

// Handle paper views in a separate middleware
function handlePaperViews(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/paper/')) {
    // Extract work ID and slug from URL
    const matches = request.nextUrl.pathname.match(/^\/paper\/(\d+)(?:\/([^\/]+))?$/);
    if (!matches) {
      return NextResponse.next();
    }

    const [, id, slug] = matches;
    if (!id || !slug) {
      return NextResponse.next();
    }

    // Get existing recent views
    const recentViewsStr = request.cookies.get(RECENT_VIEWS_KEY)?.value;
    const recentViews: RecentPageView[] = recentViewsStr ? JSON.parse(recentViewsStr) : [];

    // Update recent views
    const existingIndex = recentViews.findIndex((view) => view.id === parseInt(id));
    if (existingIndex !== -1) {
      // Update last visited time for existing view
      recentViews[existingIndex].lastVisited = new Date().toISOString();
    } else {
      // Add new view
      // Note: We'll need to get the work title and authors from the page component
      // and update this cookie there since we don't have access to that data here
      const newView: RecentPageView = {
        id: parseInt(id),
        title: '', // This will be updated by the page component
        authors: [], // This will be updated by the page component
        lastVisited: new Date().toISOString(),
        slug,
      };
      recentViews.unshift(newView);

      // Keep only the most recent views
      if (recentViews.length > MAX_RECENT_VIEWS) {
        recentViews.pop();
      }
    }

    // Update cookie
    const response = NextResponse.next();
    response.cookies.set(RECENT_VIEWS_KEY, JSON.stringify(recentViews), {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  }

  return NextResponse.next();
}

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
  // First check if it's a paper route
  if (request.nextUrl.pathname.startsWith('/paper/')) {
    return handlePaperViews(request);
  }
  // Otherwise, apply auth middleware
  return authMiddleware(request as NextRequestWithAuth, request.nextUrl.pathname as any);
}

export const config = {
  matcher: ['/notebook/:path*', '/notebook/api/:path*', '/paper/:path*'],
};

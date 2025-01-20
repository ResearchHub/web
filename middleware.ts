import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { RecentPageView } from '@/types/search';
const MAX_RECENT_VIEWS = 10;
const RECENT_VIEWS_KEY = 'recent_views';

export function middleware(request: NextRequest) {
  // Only track work page views
  if (!request.nextUrl.pathname.startsWith('/work/')) {
    return NextResponse.next();
  }

  // Extract work ID and slug from URL
  const matches = request.nextUrl.pathname.match(/^\/work\/(\d+)(?:\/([^\/]+))?$/);
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

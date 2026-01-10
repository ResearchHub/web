import { NextRequestWithAuth, withAuth } from 'next-auth/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { Experiment, ExperimentVariant } from './utils/experiment';

function getExperimentVariant(request: NextRequest): string {
  // Check if user already has an experiment assignment
  const existingVariant = request.cookies.get(Experiment.HomepageExperiment);

  if (existingVariant?.value) {
    return existingVariant.value;
  }

  // Assign new variant (50/50 split)
  const variant = Math.random() < 0.5 ? ExperimentVariant.A : ExperimentVariant.B;

  return variant;
}

function setExperimentCookie(response: NextResponse, variant: string): void {
  const expirationDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000); // 1 day in milliseconds

  response.cookies.set(Experiment.HomepageExperiment, variant, {
    expires: expirationDate,
    secure: process.env.NEXT_PUBLIC_VERCEL_ENV !== undefined,
    sameSite: 'lax',
    path: '/',
  });
}

// Main middleware function
export function middleware(request: NextRequest) {
  // Only apply A/B testing to the homepage for logged-out users
  if (request.nextUrl.pathname === '/') {
    const variant = getExperimentVariant(request);
    const response = NextResponse.next();

    // Set experiment cookie
    setExperimentCookie(response, variant);

    // Add experiment variant to headers for client-side access
    response.headers.set('x-homepage-experiment', variant);

    return response;
  }

  // For protected routes, use auth middleware
  return withAuth(request as NextRequestWithAuth, {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  });
}

export const config = {
  matcher: ['/', '/notebook/:path*', '/notebook/api/:path*', '/referral', '/lists', '/list/:path*'],
};

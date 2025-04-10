import { NextResponse } from 'next/server';
import { AuthSharingService } from '@/services/auth-sharing.service';

/**
 * Gets the cookie prefix based on the environment
 * @returns The next-auth cookie prefix
 */
function getCookiePrefix(): string {
  const env = process.env.NEXT_PUBLIC_VERCEL_ENV;
  if (env === 'production' || env === 'preview') {
    return '__Secure-';
  }
  return '';
}

/**
 * Handles the shared logout process by clearing the authentication cookies
 * and redirecting to the callback URL or the origin.
 *
 * @param request - The HTTP request object
 * @returns A redirect response to the callback URL or origin
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const callbackUrl = searchParams.get('callbackUrl') || origin;

  try {
    const expiredDate = new Date(0).toUTCString();
    const prefix = getCookiePrefix();

    return new Response(null, {
      status: 307,
      headers: {
        Location: callbackUrl,
        'Set-Cookie': [
          `${prefix}next-auth.session-token=; Expires=${expiredDate}; Path=/; HttpOnly; Secure`,
          `${prefix}next-auth.csrf-token=; Expires=${expiredDate}; Path=/; HttpOnly; Secure`,
          `${AuthSharingService.getAuthCookieName()}=; Expires=${expiredDate}; Path=/; Domain=${AuthSharingService.getParentDomain()}; HttpOnly; Secure`,
        ].join(', '),
      },
    });
  } catch (error) {
    return NextResponse.redirect(callbackUrl, 307);
  }
}

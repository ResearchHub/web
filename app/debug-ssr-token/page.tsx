// TEMPORARY debug route — remove before merge.
// Runs the same server-side token resolution as ApiClient in a real RSC/SSR
// context and reports booleans + cookie NAMES only (never secrets or token
// values), so we can see why SSR can't authenticate private documents.
import { cookies } from 'next/headers';
import { getToken } from 'next-auth/jwt';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';

export const dynamic = 'force-dynamic';

export default async function DebugSsrToken() {
  const result: Record<string, unknown> = {};

  try {
    const cookieStore = await cookies();
    const names = cookieStore.getAll().map((c) => c.name);
    result.allCookieNames = names;
    result.authCookieNames = names.filter(
      (n) => n.includes('next-auth') || n.includes('researchhub')
    );
  } catch (e) {
    result.cookiesError = String(e);
  }

  result.env = {
    hasNextauthUrl: !!process.env.NEXTAUTH_URL,
    nextauthUrl: process.env.NEXTAUTH_URL ?? null,
    hasNextauthSecret: !!process.env.NEXTAUTH_SECRET,
    hasAuthSecret: !!process.env.AUTH_SECRET,
    isVercel: !!process.env.VERCEL,
    vercelEnv: process.env.VERCEL_ENV ?? null,
    apiUrl: process.env.NEXT_PUBLIC_API_URL ?? null,
  };

  for (const secureCookie of [true, false]) {
    try {
      const cookieStore = await cookies();
      const token = await getToken({ req: { cookies: cookieStore } as any, secureCookie });
      result[`getToken_secure_${secureCookie}`] = {
        gotToken: !!token,
        keys: token ? Object.keys(token) : null,
        hasAuthToken: typeof (token as Record<string, unknown> | null)?.authToken === 'string',
      };
    } catch (e) {
      result[`getToken_secure_${secureCookie}`] = { error: String(e) };
    }
  }

  try {
    const session = await getServerSession(authOptions);
    result.getServerSession = {
      gotSession: !!session,
      isLoggedIn: session?.isLoggedIn ?? null,
      hasAuthToken: typeof session?.authToken === 'string',
    };
  } catch (e) {
    result.getServerSession = { error: String(e) };
  }

  return <pre id="debug-output">{JSON.stringify(result, null, 2)}</pre>;
}

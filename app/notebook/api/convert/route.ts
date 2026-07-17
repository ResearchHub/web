import jsonwebtoken from 'jsonwebtoken';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';

const JWT_SECRET = process.env?.TIPTAP_CONVERT_SECRET;

// Tokens expire after 15 minutes. Long enough to cover any reasonable docx
// upload (Tiptap's Convert service is synchronous and usually returns in
// 2-10s), short enough that a leaked token has a narrow useful window.
const JWT_EXPIRES_IN = '15m';

export async function POST(): Promise<Response> {
  if (!JWT_SECRET) {
    return new Response(
      JSON.stringify({
        error: 'No convert token provided, please set TIPTAP_CONVERT_SECRET in your environment',
      }),
      { status: 403 }
    );
  }

  // The route is already gated by next-auth middleware (matcher
  // `/notebook/api/:path*`), so an anonymous request can't reach here. We
  // still pull the session to bind the JWT to a specific user via the `sub`
  // claim, which gives us audit attribution if Tiptap usage ever spikes.
  const session = await getServerSession(authOptions);
  if (!session?.userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const jwt = jsonwebtoken.sign({ sub: session.userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  return new Response(JSON.stringify({ token: jwt }));
}

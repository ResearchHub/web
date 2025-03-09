'use client';

import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';
import { useEffect } from 'react';
import { ApiClient } from '@/services/client';

export default function NextAuthProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  useEffect(() => {
    if (session?.authToken) {
      ApiClient.setGlobalAuthToken(session.authToken);
    }
  }, [session?.authToken]);

  return <SessionProvider session={session}>{children}</SessionProvider>;
}

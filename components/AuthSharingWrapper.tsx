'use client';

import { useSession, signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { AuthSharingService } from '@/services/auth-sharing.service';

export function AuthSharingWrapper({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const checkSharedToken = async () => {
      // Only check if we're not authenticated
      if (status === 'unauthenticated') {
        const sharedToken = AuthSharingService.getSharedAuthToken();
        if (sharedToken) {
          setIsChecking(true);
          console.log('[AuthSharing] Found shared token, signing in...');
          await signIn('credentials', {
            authToken: sharedToken,
            redirect: false,
          });
          setIsChecking(false);
        }
      }
    };

    checkSharedToken();
  }, [status]);

  useEffect(() => {
    if (session?.authToken) {
      console.log('[AuthTokenSetter] Setting auth token from session');
      AuthSharingService.setSharedAuthToken(session.authToken);
    }
  }, [session?.authToken]);

  if (isChecking) {
    return (
      <div>
        Loading shared token...(create a separate component for the scenario when we need to
        authorize a new app using the token form the cookies)
      </div>
    );
  }

  return <>{children}</>;
}

'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { AuthError, AuthService } from '@/services/auth.service';
import type { User } from '@/types/user';
import { AuthSharingService } from '@/services/auth-sharing.service';
import AnalyticsService from '@/services/analytics.service';
import { Experiment } from '@/utils/experiment';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const search = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isAnalyticsInitialized, setIsAnalyticsInitialized] = useState(false);

  const fetchUserData = async () => {
    if (!session?.authToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const userData = await AuthService.fetchUserData(session.authToken);
      const user = userData.results[0] || null;
      setUser(user);
    } catch (err) {
      if (err instanceof AuthError) {
        if (err.code === 401) {
          await AuthSharingService.signOutFromBothApps();
        }
      }
      setError(err instanceof Error ? err : new Error('Failed to load user data'));
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh function that can be called from components
  const refreshUser = async () => {
    await fetchUserData();
  };

  // Effect to load user data when session changes
  useEffect(() => {
    if (status === 'loading') return;
    fetchUserData();
  }, [session?.authToken, status]);

  useEffect(() => {
    if (!isLoading) {
      if (user && !isAnalyticsInitialized) {
        // Set user properties
        AnalyticsService.setUserProperties({
          user_id: user.id.toString(),
          full_name: user.fullName,
          email: user.email,
          auth_provider: user.authProvider,
        });

        // Track Google OAuth sign-up if applicable
        if (user.authProvider === 'google' && user.hasCompletedOnboarding === false) {
          AnalyticsService.logSignedUp('google', {});
        }

        // Clean up URL parameter
        const newUrl = new URL(window.location.href);
        window.history.replaceState({}, '', newUrl.toString());

        // Mark analytics as initialized for this user
        setIsAnalyticsInitialized(true);
      } else if (!user) {
        // Reset analytics state when user is null
        setIsAnalyticsInitialized(false);
        AnalyticsService.setUserId(null);
      }
    }
  }, [user, isLoading, isAnalyticsInitialized]);

  // Handle ORCID sync URL parameters
  useEffect(() => {
    const flag = search.get('orcid_sync');
    if (!flag) return;

    if (flag === 'ok') {
      toast.success("Sync started! We'll refresh your authorship shortly.");
    } else if (flag === 'fail') {
      // Check if there's a specific error message in the URL
      const errorMessage = search.get('error');
      if (errorMessage) {
        // Decode the URL-encoded error message
        const decodedError = decodeURIComponent(errorMessage);
        toast.error(decodedError);
      } else {
        toast.error('ORCID sync failed.');
      }
    }

    // Strip the orcid_sync and error params
    const entries = Array.from(search.entries()).filter(
      ([k]) => k !== 'orcid_sync' && k !== 'error'
    );
    const clean =
      pathname +
      (entries.length
        ? '?' + entries.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')
        : '');
    router.replace(clean || pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoading, error, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

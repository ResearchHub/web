'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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
          const urlParams = new URLSearchParams(window.location.search);
          const urlHPExperimentVariant = urlParams.get(Experiment.HomepageExperiment);

          if (urlHPExperimentVariant) {
            /**
             * Due to authentication flow limitations:
             *
             * 1. Credentials/Email flow: Track signed_up event immediately after client-side registration
             *    (cookies accessible in Signup.tsx component)
             *
             * 2. Google OAuth: Track during user context initialization by checking authProvider === 'google'
             *    (cookies accessible after redirect from Google OAuth)
             *
             * We track here instead of in SelectProvider because:
             * - Google OAuth redirects to a new page, losing the original context
             * - The experiment variant is passed via URL parameter and needs to be captured after redirect
             * - UserContext is the first place where we have both user data and access to URL parameters
             * - This ensures we capture the experiment variant before it gets cleaned up
             */
            AnalyticsService.logSignedUp('google', {
              homepage_experiment: urlHPExperimentVariant,
            });
          }
        }

        // Clean up URL parameter
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete(Experiment.HomepageExperiment);
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

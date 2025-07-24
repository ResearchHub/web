'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AuthError, AuthService } from '@/services/auth.service';
import type { User } from '@/types/user';
import { AuthSharingService } from '@/services/auth-sharing.service';
import AnalyticsService from '@/services/analytics.service';

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
    if (user) {
      const paddedUserId = user.id.toString().padStart(6, '0');

      AnalyticsService.setUserProperties({
        user_id: paddedUserId,
        full_name: user.fullName,
        email: user.email,
        auth_provider: user.authProvider,
      });
    } else if (!isLoading) {
      AnalyticsService.setUserId(null);
    }
  }, [user, isLoading]);

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

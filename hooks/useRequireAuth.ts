'use client';

import { useSession } from 'next-auth/react';
import { useAuth } from '@/contexts/AuthContext';

export const useRequireAuth = () => {
  const { data: session } = useSession();
  const { requireAuth } = useAuth();

  const withAuth = (callback: () => void) => {
    if (session) {
      callback();
    } else {
      requireAuth(callback);
    }
  };

  return {
    withAuth,
    isAuthenticated: !!session,
  };
};

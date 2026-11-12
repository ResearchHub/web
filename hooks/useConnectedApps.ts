'use client';

import { useCallback, useEffect, useState } from 'react';
import { OAuthService } from '@/services/oauth.service';
import type { ConnectedApp } from '@/types/oauth';

/**
 * Loads the apps the user has connected to their account, and revokes them.
 * `apps` stays `null` after loading if OAuth is disabled on the backend.
 */
export function useConnectedApps() {
  const [apps, setApps] = useState<ConnectedApp[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    OAuthService.getConnectedApps()
      .then((result) => {
        if (!cancelled) setApps(result);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load connected apps');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const revoke = useCallback(async (id: number) => {
    await OAuthService.revokeConnectedApp(id);
    setApps((current) => current && current.filter((app) => app.id !== id));
  }, []);

  return { apps, isLoading, error, revoke };
}

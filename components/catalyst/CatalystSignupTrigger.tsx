'use client';

import { useEffect, useRef } from 'react';
import { useAuthModalContext } from '@/contexts/AuthModalContext';
import { useUser } from '@/contexts/UserContext';

/**
 * Renders nothing; auto-opens the Catalyst-branded auth modal once for
 * logged-out visitors landing on /catalyst-nyc (e.g. from the conference QR
 * code). Logged-in users are redirected away by the page, so we skip them to
 * avoid flashing a signup modal before the redirect lands.
 */
export function CatalystSignupTrigger() {
  const { showAuthModal } = useAuthModalContext();
  const { user, isLoading } = useUser();
  const hasOpenedRef = useRef(false);

  useEffect(() => {
    if (isLoading || user || hasOpenedRef.current) return;
    hasOpenedRef.current = true;
    showAuthModal(undefined, { variant: 'catalyst' });
  }, [user, isLoading, showAuthModal]);

  return null;
}

'use client';

import { useCallback } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useVerification } from '@/contexts/VerificationContext';

export function useVerifiedAction() {
  const { user } = useUser();
  const { openVerificationModal } = useVerification();

  const withVerification = useCallback(
    (action: () => void | Promise<void>) => {
      if (user?.isVerified) {
        action();
        return;
      }
      openVerificationModal({ onVerified: () => action(), context: 'publish' });
    },
    [user?.isVerified, openVerificationModal]
  );

  return { withVerification };
}

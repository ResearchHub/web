'use client';

import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { CatalystArrivalScreen } from './CatalystArrivalScreen';
import { CatalystAuthScreen } from './CatalystAuthScreen';
import { CatalystLoggedInScreen } from './CatalystLoggedInScreen';
import { CatalystLockup } from './CatalystLockup';
import { CatalystScreenShell } from './CatalystScreenShell';

type Step = 'arrival' | 'auth';

/**
 * Catalyst NYC QR sign-up flow: violet arrival screen advances to the dark-violet
 * email-first auth screen when the attendee taps "Claim my $500". Logged-in users
 * see an email confirmation screen instead.
 */
export function CatalystFlow() {
  const { user, isLoading } = useUser();
  const [step, setStep] = useState<Step>('arrival');

  if (isLoading) {
    return (
      <CatalystScreenShell>
        <CatalystLockup variant="auth" />
        <div className="loading" aria-busy="true" aria-label="Loading" />
        <style jsx>{`
          .loading {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .loading::after {
            content: '';
            width: 28px;
            height: 28px;
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-top-color: #fff;
            border-radius: 50%;
            animation: spin 0.7s linear infinite;
          }
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
          @media (prefers-reduced-motion: reduce) {
            .loading::after {
              animation: none;
              border-top-color: rgba(255, 255, 255, 0.5);
            }
          }
        `}</style>
      </CatalystScreenShell>
    );
  }

  if (user?.email) {
    return <CatalystLoggedInScreen email={user.email} />;
  }

  if (step === 'auth') {
    return <CatalystAuthScreen />;
  }

  return <CatalystArrivalScreen onClaim={() => setStep('auth')} />;
}

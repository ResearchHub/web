'use client';

import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { CatalystArrivalScreen } from './CatalystArrivalScreen';
import { CatalystAuthModal } from './CatalystAuthModal';
import { CatalystAuthScreen } from './CatalystAuthScreen';
import { CatalystDesktopLoggedIn } from './CatalystDesktopLoggedIn';
import { CatalystDesktopOffer } from './CatalystDesktopOffer';
import { CatalystLoggedInScreen } from './CatalystLoggedInScreen';
import { useCatalystLayout } from './useCatalystLayout';

type Step = 'arrival' | 'auth';

function CatalystLoadingState() {
  return (
    <div
      className="flex min-h-screen min-h-dvh items-center justify-center bg-[#0c0720]"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
    </div>
  );
}

export function CatalystFlow() {
  const { user, isLoading } = useUser();
  const isMobile = useCatalystLayout();
  const [step, setStep] = useState<Step>('arrival');
  const [authOpen, setAuthOpen] = useState(false);

  if (isLoading) {
    return <CatalystLoadingState />;
  }

  if (user?.email) {
    return isMobile ? (
      <CatalystLoggedInScreen email={user.email} />
    ) : (
      <CatalystDesktopLoggedIn email={user.email} />
    );
  }

  if (isMobile) {
    if (step === 'auth') {
      return <CatalystAuthScreen onClose={() => setStep('arrival')} />;
    }
    return <CatalystArrivalScreen onClaim={() => setStep('auth')} />;
  }

  return (
    <>
      <CatalystDesktopOffer onClaim={() => setAuthOpen(true)} />
      <CatalystAuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => setAuthOpen(false)}
      />
    </>
  );
}

'use client';

import { useState } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { useUser } from '@/contexts/UserContext';
import { CatalystArrivalScreen } from './CatalystArrivalScreen';
import { CatalystAuthModal } from './CatalystAuthModal';
import { CatalystAuthScreen } from './CatalystAuthScreen';
import { CatalystDesktopLoggedIn } from './CatalystDesktopLoggedIn';
import { CatalystDesktopOffer } from './CatalystDesktopOffer';
import { CatalystLoggedInScreen } from './CatalystLoggedInScreen';
import { CatalystLockup } from './CatalystLockup';
import { CatalystScreenShell } from './CatalystScreenShell';
import { useCatalystLayout } from './useCatalystLayout';

type Step = 'arrival' | 'auth';

function MobileLoadingState() {
  return (
    <CatalystScreenShell>
      <CatalystLockup />
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

function DesktopLoadingState() {
  return (
    <PageLayout rightSidebar={false}>
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
      </div>
    </PageLayout>
  );
}

export function CatalystFlow() {
  const { user, isLoading } = useUser();
  const isMobile = useCatalystLayout();
  const [step, setStep] = useState<Step>('arrival');
  const [authOpen, setAuthOpen] = useState(false);

  if (isLoading) {
    return isMobile ? <MobileLoadingState /> : <DesktopLoadingState />;
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
      return <CatalystAuthScreen />;
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

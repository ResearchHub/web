'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';

// Loaded on first open so the deposit flow's QR and wallet dependencies stay
// out of the bundle for the pages that never open it.
const AddFundsModal = dynamic(
  () => import('@/components/Funding/AddFundsModal').then((mod) => mod.AddFundsModal),
  { ssr: false }
);

const HIDDEN_AMOUNT_KEY = 'rh:funding-power-hidden';

interface FundingPowerContextValue {
  isAmountHidden: boolean;
  toggleAmountHidden: () => void;
  /** False until the persisted choice is read, so a hidden amount never flashes. */
  isPrivacyReady: boolean;
  openAddFunds: () => void;
}

const FundingPowerContext = createContext<FundingPowerContextValue | null>(null);

/**
 * State that every funding power surface shares. The sidebar card and the
 * inline bar can both be mounted at once (the bar is `lg:hidden`, the card
 * still lives in the mobile sidebar drawer), so the privacy toggle and the
 * add funds modal live here instead of in each component — otherwise the copies
 * disagree about whether the amount is masked, and each mounts its own modal.
 */
export function FundingPowerProvider({ children }: { children: ReactNode }) {
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [isAmountHidden, setIsAmountHidden] = useState(false);
  const [isPrivacyReady, setIsPrivacyReady] = useState(false);

  useEffect(() => {
    try {
      setIsAmountHidden(localStorage.getItem(HIDDEN_AMOUNT_KEY) === '1');
    } catch {
      // Private mode / blocked storage — stay visible.
    }
    setIsPrivacyReady(true);
  }, []);

  const toggleAmountHidden = useCallback(() => {
    setIsAmountHidden((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(HIDDEN_AMOUNT_KEY, next ? '1' : '0');
      } catch {
        // Same as the read path — a blocked store just means the choice lasts
        // for this session.
      }
      return next;
    });
  }, []);

  // Logged-out clicks go to sign-in first; once they're in, the same click
  // replays and opens the picker. Auth-gating here means the two modals never
  // stack — AuthModal is z-[60] and this one is a z-[9999] portal.
  const openAddFunds = useCallback(
    () => executeAuthenticatedAction(() => setIsAddFundsOpen(true)),
    [executeAuthenticatedAction]
  );

  return (
    <FundingPowerContext.Provider
      value={{
        isAmountHidden,
        toggleAmountHidden,
        isPrivacyReady,
        openAddFunds,
      }}
    >
      {children}
      {isAddFundsOpen && (
        <AddFundsModal isOpen onClose={() => setIsAddFundsOpen(false)} onReopen={openAddFunds} />
      )}
    </FundingPowerContext.Provider>
  );
}

export function useFundingPowerControls() {
  const context = useContext(FundingPowerContext);
  if (!context) {
    throw new Error('useFundingPowerControls must be used within a FundingPowerProvider');
  }
  return context;
}

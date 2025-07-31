'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';

interface ReferralContextType {
  referralCode: string | null;
  setReferralCode: (code: string | null) => void;
  clearReferralCode: () => void;
}

const ReferralContext = createContext<ReferralContextType | undefined>(undefined);

export function ReferralProvider({ children }: { children: ReactNode }) {
  const [referralCode, setReferralCodeState] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // Initialize from URL params and sessionStorage
  useEffect(() => {
    const urlReferralCode = searchParams?.get('refr');
    if (urlReferralCode) {
      setReferralCodeState(urlReferralCode);
    }
  }, [searchParams]);

  const setReferralCode = (code: string | null) => {
    setReferralCodeState(code);
  };

  const clearReferralCode = () => {
    setReferralCodeState(null);
  };

  return (
    <ReferralContext.Provider value={{ referralCode, setReferralCode, clearReferralCode }}>
      {children}
    </ReferralContext.Provider>
  );
}

export function useReferral() {
  const context = useContext(ReferralContext);
  if (context === undefined) {
    throw new Error('useReferral must be used within a ReferralProvider');
  }
  return context;
}

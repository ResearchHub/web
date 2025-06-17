'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface CurrencyPreferenceContextType {
  showUSD: boolean;
  toggleCurrency: () => void;
}

const CurrencyPreferenceContext = createContext<CurrencyPreferenceContextType>({
  showUSD: false,
  toggleCurrency: () => {},
});

export function CurrencyPreferenceProvider({ children }: { children: React.ReactNode }) {
  const [showUSD, setShowUSD] = useState(false);

  // Load preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('currency-preference');
    if (saved === 'USD') {
      setShowUSD(true);
    }
  }, []);

  // Save preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('currency-preference', showUSD ? 'USD' : 'RSC');
  }, [showUSD]);

  const toggleCurrency = () => {
    setShowUSD((prev) => !prev);
  };

  return (
    <CurrencyPreferenceContext.Provider value={{ showUSD, toggleCurrency }}>
      {children}
    </CurrencyPreferenceContext.Provider>
  );
}

export function useCurrencyPreference() {
  const context = useContext(CurrencyPreferenceContext);
  if (context === undefined) {
    throw new Error('useCurrencyPreference must be used within a CurrencyPreferenceProvider');
  }
  return context;
}

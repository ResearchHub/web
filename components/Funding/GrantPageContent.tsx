'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { GrantBannerTab } from '@/components/Funding/GrantInfoBanner';

interface GrantTabContextValue {
  activeTab: GrantBannerTab;
  setActiveTab: (tab: GrantBannerTab) => void;
}

const GrantTabContext = createContext<GrantTabContextValue | null>(null);

export function useGrantTab() {
  const ctx = useContext(GrantTabContext);
  if (!ctx) throw new Error('useGrantTab must be used within GrantTabProvider');
  return ctx;
}

export function GrantTabProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<GrantBannerTab>('proposals');
  return (
    <GrantTabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </GrantTabContext.Provider>
  );
}

'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export type GrantBannerTab = 'proposals' | 'details';

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

export function GrantTabProvider({
  children,
  defaultTab = 'details',
}: {
  children: ReactNode;
  defaultTab?: GrantBannerTab;
}) {
  const [activeTab, setActiveTab] = useState<GrantBannerTab>(defaultTab);
  return (
    <GrantTabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </GrantTabContext.Provider>
  );
}

'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { TabType } from '@/components/work/WorkTabs';

interface WorkTabContextValue {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const WorkTabContext = createContext<WorkTabContextValue | null>(null);

export function useWorkTab() {
  const ctx = useContext(WorkTabContext);
  if (!ctx) throw new Error('useWorkTab must be used within WorkTabProvider');
  return ctx;
}

export function WorkTabProvider({
  children,
  defaultTab = 'paper',
}: {
  children: ReactNode;
  defaultTab?: TabType;
}) {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  return (
    <WorkTabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </WorkTabContext.Provider>
  );
}

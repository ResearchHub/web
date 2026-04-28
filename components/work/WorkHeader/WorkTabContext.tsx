'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import type { TabType } from '@/components/work/WorkTabs';

interface WorkTabContextValue {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
}

const NOOP_TAB_CONTEXT: WorkTabContextValue = {
  activeTab: 'paper',
  setActiveTab: () => {},
  mobileSidebarOpen: false,
  setMobileSidebarOpen: () => {},
};

const WorkTabContext = createContext<WorkTabContextValue | null>(null);

export function useWorkTab() {
  const ctx = useContext(WorkTabContext);
  return ctx ?? NOOP_TAB_CONTEXT;
}

function getTabFromPath(path: string): TabType {
  if (path.includes('/updates')) return 'updates';
  if (path.includes('/conversation')) return 'conversation';
  if (path.includes('/applications')) return 'applications';
  if (path.includes('/reviews')) return 'reviews';
  if (path.includes('/bounties')) return 'bounties';
  if (path.includes('/history')) return 'history';
  return 'paper';
}

export function WorkTabProvider({
  children,
  defaultTab,
}: {
  children: ReactNode;
  defaultTab?: TabType;
}) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<TabType>(() => defaultTab ?? getTabFromPath(pathname));
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  return (
    <WorkTabContext.Provider
      value={{ activeTab, setActiveTab, mobileSidebarOpen, setMobileSidebarOpen }}
    >
      {children}
    </WorkTabContext.Provider>
  );
}

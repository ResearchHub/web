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

/** Which tab a work's route opens on: its own route for each, the work's page for the paper. */
export function getTabFromPath(path: string): TabType {
  if (path.includes('/updates')) return 'updates';
  if (path.includes('/conversation')) return 'conversation';
  if (path.includes('/applications')) return 'applications';
  if (path.includes('/reviews')) return 'reviews';
  if (path.includes('/bounties')) return 'bounties';
  return 'paper';
}

export function WorkTabProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<TabType>(() => getTabFromPath(pathname));
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // A link to another of the work's tabs keeps this layout mounted: follow it.
  const [tabPath, setTabPath] = useState(pathname);
  if (pathname !== tabPath) {
    setTabPath(pathname);
    setActiveTab(getTabFromPath(pathname));
  }

  return (
    <WorkTabContext.Provider
      value={{ activeTab, setActiveTab, mobileSidebarOpen, setMobileSidebarOpen }}
    >
      {children}
    </WorkTabContext.Provider>
  );
}

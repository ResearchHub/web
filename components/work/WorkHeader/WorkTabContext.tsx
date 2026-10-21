'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

export type TabType = 'paper' | 'updates' | 'reviews' | 'bounties' | 'conversation';

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

const ROUTED_TABS: TabType[] = ['updates', 'conversation', 'reviews', 'bounties'];

/**
 * Which tab a work's route opens on: `/<type>/<id>/<slug>/<tab>` for each
 * tab, the work's own page for the paper. Only the segment after the slug
 * counts, so a slug like `updates-on-crispr` still opens the paper.
 */
function getTabFromPath(path: string): TabType {
  const segment = path.split('/')[4] as TabType | undefined;
  return segment && ROUTED_TABS.includes(segment) ? segment : 'paper';
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

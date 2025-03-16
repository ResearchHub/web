'use client';

import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';

interface SidebarContextType {
  isLeftSidebarOpen: boolean;
  isRightSidebarOpen: boolean;
  openLeftSidebar: () => void;
  closeLeftSidebar: () => void;
  toggleLeftSidebar: () => void;
  openRightSidebar: () => void;
  closeRightSidebar: () => void;
  toggleRightSidebar: () => void;
  closeBothSidebars: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  const openLeftSidebar = useCallback(() => setIsLeftSidebarOpen(true), []);
  const closeLeftSidebar = useCallback(() => setIsLeftSidebarOpen(false), []);
  const toggleLeftSidebar = useCallback(() => setIsLeftSidebarOpen((prev) => !prev), []);

  const openRightSidebar = useCallback(() => setIsRightSidebarOpen(true), []);
  const closeRightSidebar = useCallback(() => setIsRightSidebarOpen(false), []);
  const toggleRightSidebar = useCallback(() => setIsRightSidebarOpen((prev) => !prev), []);

  const closeBothSidebars = useCallback(() => {
    setIsLeftSidebarOpen(false);
    setIsRightSidebarOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      isLeftSidebarOpen,
      isRightSidebarOpen,
      openLeftSidebar,
      closeLeftSidebar,
      toggleLeftSidebar,
      openRightSidebar,
      closeRightSidebar,
      toggleRightSidebar,
      closeBothSidebars,
    }),
    [
      isLeftSidebarOpen,
      isRightSidebarOpen,
      openLeftSidebar,
      closeLeftSidebar,
      toggleLeftSidebar,
      openRightSidebar,
      closeRightSidebar,
      toggleRightSidebar,
      closeBothSidebars,
    ]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

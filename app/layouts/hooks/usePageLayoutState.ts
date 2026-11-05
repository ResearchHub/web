'use client';

import { useState, useRef, useCallback } from 'react';

export function usePageLayoutState() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);

  const toggleLeftSidebar = useCallback(() => {
    setIsLeftSidebarOpen((prev) => !prev);
  }, []);

  const closeLeftSidebar = useCallback(() => {
    setIsLeftSidebarOpen(false);
  }, []);

  return {
    scrollContainerRef,
    shellRef,
    isLeftSidebarOpen,
    toggleLeftSidebar,
    closeLeftSidebar,
  };
}

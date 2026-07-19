'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const OVERLAY_TRANSITION_MS = 300;

export function usePageLayoutState() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);

  // Overlay animation: two-phase show/hide for CSS transition
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);

  useEffect(() => {
    if (isLeftSidebarOpen) {
      setShowOverlay(true);
      // RAF ensures the DOM has the overlay element before we transition opacity
      requestAnimationFrame(() => setOverlayVisible(true));
    } else {
      setOverlayVisible(false);
      const timeout = setTimeout(() => setShowOverlay(false), OVERLAY_TRANSITION_MS);
      return () => clearTimeout(timeout);
    }
  }, [isLeftSidebarOpen]);

  const toggleLeftSidebar = useCallback(() => {
    setIsLeftSidebarOpen((prev) => !prev);
  }, []);

  const closeLeftSidebar = useCallback(() => {
    setIsLeftSidebarOpen(false);
  }, []);

  return {
    scrollContainerRef,
    isLeftSidebarOpen,
    showOverlay,
    overlayVisible,
    toggleLeftSidebar,
    closeLeftSidebar,
  };
}

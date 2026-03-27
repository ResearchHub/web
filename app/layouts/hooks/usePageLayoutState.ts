'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const COMPACT_SCROLL_THRESHOLD = 100;
const OVERLAY_TRANSITION_MS = 300;

export function usePageLayoutState() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  // Overlay animation: two-phase show/hide for CSS transition
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setIsCompact(container.scrollTop > COMPACT_SCROLL_THRESHOLD);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

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
    isCompact,
    showOverlay,
    overlayVisible,
    toggleLeftSidebar,
    closeLeftSidebar,
  };
}

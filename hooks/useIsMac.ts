'use client';

import { useState, useEffect } from 'react';

/**
 * Detects if the user is on a Mac operating system
 * Used for displaying platform-specific keyboard shortcuts (⌘ vs Ctrl)
 *
 * @returns {boolean} true if user is on Mac, false otherwise
 */
export function useIsMac(): boolean {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    if (globalThis.window === undefined) {
      return;
    }

    // Modern approach: use userAgentData if available, fallback to userAgent
    const nav = navigator as Navigator & {
      userAgentData?: { platform?: string };
    };

    const detectMac =
      nav.userAgentData?.platform?.toUpperCase().includes('MAC') ||
      navigator.userAgent.toUpperCase().includes('MAC');

    setIsMac(detectMac);
  }, []);

  return isMac;
}

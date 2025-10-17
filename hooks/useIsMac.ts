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
    const detectMac =
      typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    setIsMac(detectMac);
  }, []);

  return isMac;
}

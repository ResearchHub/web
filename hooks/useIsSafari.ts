'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect if the browser is Safari (supports Apple Pay).
 * Works for both mobile and desktop Safari.
 *
 * @returns true if the browser is Safari, false otherwise
 */
export function useIsSafari(): boolean {
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    // Safari but not Chrome (Chrome also includes Safari in UA)
    const isSafariBrowser = /Safari/.test(ua) && !/Chrome/.test(ua) && !/CriOS/.test(ua);
    setIsSafari(isSafariBrowser);
  }, []);

  return isSafari;
}

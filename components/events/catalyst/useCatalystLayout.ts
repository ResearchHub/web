'use client';

import { useEffect, useState } from 'react';

const MOBILE_BREAKPOINT = 640;

/**
 * Mobile-first layout for the Catalyst QR route. Defaults to mobile until the
 * viewport is measured so phone users never flash the desktop PageLayout.
 */
export function useCatalystLayout(): boolean {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

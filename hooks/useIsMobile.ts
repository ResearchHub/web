import { useState, useEffect } from 'react';

/**
 * Hook to detect if the viewport is in mobile size (single column layout)
 * @param breakpoint - The breakpoint in pixels (default: 640px for Tailwind's sm)
 * @returns boolean indicating if viewport is mobile size
 */
export function useIsMobile(breakpoint: number = 640): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Check on mount
    checkMobile();

    // Add resize listener
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return isMobile;
}

import { useState, useEffect, useRef } from 'react';

/**
 * Hook to manage filter transitions - shows skeletons during filter changes but not during load-more.
 * Tracks the loading cycle (true→false) before clearing transition state.
 */
export function useFilterTransition(isLoading: boolean) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const hasSeenLoadingRef = useRef(false);

  useEffect(() => {
    if (isTransitioning) {
      if (isLoading) hasSeenLoadingRef.current = true;
      else if (hasSeenLoadingRef.current) {
        setIsTransitioning(false);
        hasSeenLoadingRef.current = false;
      }
    }
  }, [isLoading, isTransitioning]);

  const startTransition = () => {
    hasSeenLoadingRef.current = false;
    setIsTransitioning(true);
  };

  return { isTransitioning, startTransition };
}

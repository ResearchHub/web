'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface NavigationContextType {
  isBackNavigation: boolean;
  resetBackNavigation: () => void;
}

const NavigationContext = createContext<NavigationContextType>({
  isBackNavigation: false,
  resetBackNavigation: () => {},
});

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [isBackNavigation, setIsBackNavigation] = useState(false);

  useEffect(() => {
    console.log('🔍 NavigationProvider: Setting up back navigation detection');

    // Check performance API immediately
    const checkPerformanceAPI = () => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      if (navigation?.type === 'back_forward') {
        console.log('🔍 Performance API detected back navigation');
        setIsBackNavigation(true);
      }
    };

    // Listen for popstate (browser back/forward button)
    const handlePopState = (event: PopStateEvent) => {
      setIsBackNavigation(true);
    };

    // Listen for pageshow (bfcache scenarios)
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setIsBackNavigation(true);
      }
    };

    // Run initial check
    checkPerformanceAPI();

    // Add event listeners
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  const resetBackNavigation = () => {
    console.log('🔍 Resetting back navigation flag');
    setIsBackNavigation(false);
  };

  console.log('🔍 NavigationProvider: isBackNavigation =', isBackNavigation);

  return (
    <NavigationContext.Provider value={{ isBackNavigation, resetBackNavigation }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}

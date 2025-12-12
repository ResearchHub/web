'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface CachedFeatureStatus {
  isDismissed: boolean;
  checkedAt: number;
}

interface DismissedFeaturesContextValue {
  /**
   * Get feature status - checks in-memory cache first, then localStorage.
   * Returns undefined if not found in either.
   */
  getFeatureStatus: (featureName: string) => CachedFeatureStatus | undefined;
  /**
   * Set feature status - updates both in-memory cache and localStorage.
   */
  setFeatureStatus: (featureName: string, isDismissed: boolean) => void;
  /**
   * Check if a feature has been checked (exists in cache).
   */
  isFeatureChecked: (featureName: string) => boolean;
}

const DismissedFeaturesContext = createContext<DismissedFeaturesContextValue | null>(null);

const getLocalStorageKey = (feature: string) => `feature_${feature.toLowerCase()}_dismissed`;

interface DismissedFeaturesProviderProps {
  children: ReactNode;
}

export function DismissedFeaturesProvider({ children }: DismissedFeaturesProviderProps) {
  const [cache, setCache] = useState<Record<string, CachedFeatureStatus>>({});

  const getFeatureStatus = useCallback(
    (featureName: string): CachedFeatureStatus | undefined => {
      // 1. Check in-memory cache first (fastest)
      if (cache[featureName]) {
        return cache[featureName];
      }

      // 2. Check localStorage and cache the result
      if (typeof window !== 'undefined') {
        try {
          const localStorageValue = window.localStorage.getItem(getLocalStorageKey(featureName));
          if (localStorageValue === 'true') {
            // Found in localStorage - cache it and return
            const status: CachedFeatureStatus = {
              isDismissed: true,
              checkedAt: Date.now(),
            };
            // Update cache (side effect, but safe for this use case)
            setCache((prev) => ({
              ...prev,
              [featureName]: status,
            }));
            return status;
          }
        } catch (error) {
          console.error('Failed to read from localStorage:', error);
        }
      }

      // 3. Not found in cache or localStorage
      return undefined;
    },
    [cache]
  );

  const setFeatureStatus = useCallback((featureName: string, isDismissed: boolean) => {
    // Update in-memory cache
    setCache((prev) => ({
      ...prev,
      [featureName]: {
        isDismissed,
        checkedAt: Date.now(),
      },
    }));

    // Update localStorage
    if (typeof window !== 'undefined') {
      try {
        if (isDismissed) {
          window.localStorage.setItem(getLocalStorageKey(featureName), 'true');
        } else {
          // Optionally remove if not dismissed (or keep as 'false')
          window.localStorage.removeItem(getLocalStorageKey(featureName));
        }
      } catch (error) {
        console.error('Failed to write to localStorage:', error);
      }
    }
  }, []);

  const isFeatureChecked = useCallback(
    (featureName: string): boolean => {
      return featureName in cache;
    },
    [cache]
  );

  return (
    <DismissedFeaturesContext.Provider
      value={{ getFeatureStatus, setFeatureStatus, isFeatureChecked }}
    >
      {children}
    </DismissedFeaturesContext.Provider>
  );
}

export function useDismissedFeaturesContext() {
  const context = useContext(DismissedFeaturesContext);
  if (!context) {
    throw new Error('useDismissedFeaturesContext must be used within a DismissedFeaturesProvider');
  }
  return context;
}

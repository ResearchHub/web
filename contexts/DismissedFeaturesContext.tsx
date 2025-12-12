'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useLayoutEffect,
  ReactNode,
} from 'react';

interface CachedFeatureStatus {
  isDismissed: boolean;
  checkedAt: number;
}

interface DismissedFeaturesContextValue {
  /**
   * Get feature status - checks in-memory cache only.
   * Cache is pre-populated from localStorage on mount via useLayoutEffect.
   * Returns undefined if not found in cache.
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

  // Pre-populate cache from localStorage before first render
  useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      const initialCache: Record<string, CachedFeatureStatus> = {};

      try {
        // Scan localStorage for all feature_*_dismissed keys
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('feature_') && key.endsWith('_dismissed')) {
            const value = localStorage.getItem(key);
            if (value === 'true') {
              // Extract feature name from key: feature_<name>_dismissed -> <name>
              const featureName = key.slice(8, -10); // Remove 'feature_' and '_dismissed'
              initialCache[featureName] = {
                isDismissed: true,
                checkedAt: Date.now(),
              };
            }
          }
        }

        if (Object.keys(initialCache).length > 0) {
          setCache(initialCache);
        }
      } catch (error) {
        console.error('Failed to pre-populate cache from localStorage:', error);
      }
    }
  }, []); // Run once on mount

  // Simplified to pure cache read - no localStorage access during render
  const getFeatureStatus = useCallback(
    (featureName: string): CachedFeatureStatus | undefined => {
      return cache[featureName];
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

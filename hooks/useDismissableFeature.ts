import { useEffect, useState, useCallback } from 'react';
import { SiteService } from '@/services/site.service';
import { useUser } from '@/contexts/UserContext';
import { useDismissedFeaturesContext } from '@/contexts/DismissedFeaturesContext';

type DismissStatus = 'unchecked' | 'checked' | 'checking';

// Single feature hook
export function useDismissableFeature(featureName: string): {
  isDismissed: boolean;
  dismissFeature: () => void;
  dismissStatus: DismissStatus;
} {
  const { user, isLoading: isUserLoading } = useUser();
  const { getFeatureStatus, setFeatureStatus } = useDismissedFeaturesContext();

  // Get cached status (checks in-memory cache pre-populated from localStorage)
  const cachedStatus = getFeatureStatus(featureName);

  // Initialize state with lazy initializers to avoid closure issues
  const [isDismissed, setIsDismissed] = useState<boolean>(() => cachedStatus?.isDismissed ?? false);

  const [status, setStatus] = useState<DismissStatus>(() => {
    // Determine initial state synchronously:
    // - If cached: use cached value, status = 'checked'
    // - If not cached but user is loading: status = 'unchecked' (wait for user)
    // - If not cached and no user (logged out): not dismissed, status = 'checked'
    // - If not cached and has user (logged in): status = 'unchecked' (need API check)
    if (cachedStatus) return 'checked';
    if (isUserLoading) return 'unchecked';
    if (!user) return 'checked';
    return 'unchecked';
  });

  // Dismiss handler - updates context (which handles localStorage) + backend
  const dismissFeature = useCallback(() => {
    setIsDismissed(true);
    setFeatureStatus(featureName, true);

    // If user is logged in, also update backend
    if (user?.id) {
      SiteService.dismissFeature({
        user: user.id,
        feature: featureName,
      }).catch((error) => {
        console.error(`Failed to dismiss feature ${featureName}:`, error);
      });
    }
  }, [featureName, user?.id, setFeatureStatus]);

  useEffect(() => {
    // If already in cache (pre-populated from localStorage), sync state and return
    if (cachedStatus) {
      setIsDismissed(cachedStatus.isDismissed);
      setStatus('checked');
      return;
    }

    // Wait for user loading to complete
    if (isUserLoading) {
      return;
    }

    // For logged-out users, cache as not dismissed and mark as checked
    if (!user) {
      setFeatureStatus(featureName, false);
      setStatus('checked');
      return;
    }

    // For logged-in users, check backend API
    setStatus('checking');

    SiteService.getFeatureStatus(featureName)
      .then((res) => {
        setIsDismissed(res.clicked);
        setFeatureStatus(featureName, res.clicked);
        setStatus('checked');
      })
      .catch((error) => {
        console.error(`Failed to get status for feature ${featureName}:`, error);
        setFeatureStatus(featureName, false);
        setIsDismissed(false);
        setStatus('checked');
      });
  }, [isUserLoading, user, featureName, cachedStatus, setFeatureStatus]);

  return {
    isDismissed,
    dismissFeature,
    dismissStatus: status,
  };
}

export function useDismissableFeatures(featureNames: string[]): {
  features: Record<
    string,
    {
      isDismissed: boolean;
      dismissFeature: () => void;
      dismissStatus: DismissStatus;
    }
  >;
  isLoading: boolean;
  dismissFeature: (featureName: string) => void;
} {
  const { user, isLoading: userLoading } = useUser();
  const { getFeatureStatus, setFeatureStatus } = useDismissedFeaturesContext();

  const [features, setFeatures] = useState<
    Record<string, { isDismissed: boolean; dismissStatus: DismissStatus }>
  >({});
  const [isLoading, setIsLoading] = useState(true);

  // Memoize the featureNames array to prevent infinite re-renders
  const memoizedFeatureNames = featureNames.join(',');

  const dismissFeature = useCallback(
    (featureName: string) => {
      setFeatures((prev) => ({
        ...prev,
        [featureName]: {
          ...prev[featureName],
          isDismissed: true,
          dismissStatus: 'checked',
        },
      }));

      // Update context (which handles localStorage)
      setFeatureStatus(featureName, true);

      // If user is logged in, also update backend
      if (user?.id) {
        SiteService.dismissFeature({
          user: user.id,
          feature: featureName,
        }).catch((error) => {
          console.error(`Failed to dismiss feature ${featureName}:`, error);
        });
      }
    },
    [user?.id, setFeatureStatus]
  );

  useEffect(() => {
    if (userLoading) {
      return;
    }

    const loadFeatures = async () => {
      setIsLoading(true);

      const featureNamesList = memoizedFeatureNames.split(',').filter(Boolean);
      const featuresToCheckBackend: string[] = [];

      // Initialize features from cache (pre-populated from localStorage)
      const initialFeatures: Record<
        string,
        { isDismissed: boolean; dismissStatus: DismissStatus }
      > = {};

      // Batch context reads
      featureNamesList.forEach((featureName) => {
        const cached = getFeatureStatus(featureName);
        if (cached) {
          initialFeatures[featureName] = {
            isDismissed: cached.isDismissed,
            dismissStatus: 'checked',
          };
        } else {
          initialFeatures[featureName] = {
            isDismissed: false,
            dismissStatus: 'unchecked',
          };
          if (user) {
            featuresToCheckBackend.push(featureName);
          }
        }
      });

      setFeatures(initialFeatures);

      // If user is logged in and there are features to check, make backend requests
      if (user && featuresToCheckBackend.length > 0) {
        try {
          const backendPromises = featuresToCheckBackend.map(async (featureName) => {
            try {
              const response = await SiteService.getFeatureStatus(featureName);
              return { featureName, clicked: response.clicked };
            } catch (error) {
              console.error(`Failed to get status for feature ${featureName}:`, error);
              return { featureName, clicked: false };
            }
          });

          const backendResults = await Promise.all(backendPromises);

          // Batch update features and context
          setFeatures((prev) => {
            const updated = { ...prev };
            backendResults.forEach(({ featureName, clicked }) => {
              updated[featureName] = {
                isDismissed: clicked,
                dismissStatus: 'checked',
              };
            });
            return updated;
          });

          // Batch context updates outside of state update
          backendResults.forEach(({ featureName, clicked }) => {
            setFeatureStatus(featureName, clicked);
          });
        } catch (error) {
          console.error('Failed to load features from backend:', error);
        }
      } else {
        // For logged-out users, mark unchecked features as checked with not dismissed
        const featuresToCache = featureNamesList.filter(
          (name) => initialFeatures[name]?.dismissStatus === 'unchecked'
        );

        if (featuresToCache.length > 0) {
          setFeatures((prev) => {
            const updated = { ...prev };
            featuresToCache.forEach((featureName) => {
              updated[featureName] = {
                isDismissed: false,
                dismissStatus: 'checked',
              };
            });
            return updated;
          });

          // Batch context updates outside of state update
          featuresToCache.forEach((featureName) => {
            setFeatureStatus(featureName, false);
          });
        }
      }

      setIsLoading(false);
    };

    loadFeatures();
    // getFeatureStatus and setFeatureStatus are stable from context
  }, [userLoading, user, memoizedFeatureNames, getFeatureStatus, setFeatureStatus]);

  const featuresWithMethods = Object.keys(features).reduce(
    (acc, featureName) => {
      acc[featureName] = {
        ...features[featureName],
        dismissFeature: () => dismissFeature(featureName),
      };
      return acc;
    },
    {} as Record<
      string,
      { isDismissed: boolean; dismissFeature: () => void; dismissStatus: DismissStatus }
    >
  );

  return {
    features: featuresWithMethods,
    isLoading,
    dismissFeature,
  };
}

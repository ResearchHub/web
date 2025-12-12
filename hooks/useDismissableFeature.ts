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

  // Get cached status (checks in-memory cache, then localStorage)
  const cachedStatus = getFeatureStatus(featureName);

  // Determine initial state synchronously:
  // - If cached (from context or localStorage): use cached value, status = 'checked'
  // - If not cached but user is loading: status = 'unchecked' (wait for user)
  // - If not cached and no user (logged out): not dismissed, status = 'checked'
  // - If not cached and has user (logged in): status = 'unchecked' (need API check)
  const getInitialStatus = (): DismissStatus => {
    if (cachedStatus) return 'checked';
    if (isUserLoading) return 'unchecked';
    if (!user) return 'checked'; // Logged out, localStorage already checked
    return 'unchecked'; // Logged in, need API check
  };

  const [isDismissed, setIsDismissed] = useState<boolean>(cachedStatus?.isDismissed ?? false);
  const [status, setStatus] = useState<DismissStatus>(getInitialStatus);

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
    // If already in context cache, sync state and return
    const cached = getFeatureStatus(featureName);
    if (cached) {
      setIsDismissed(cached.isDismissed);
      setStatus('checked');
      return;
    }

    // Wait for user loading to complete
    if (isUserLoading) {
      return;
    }

    // For logged-out users, we've already checked localStorage via getFeatureStatus
    // Cache the result and mark as checked
    if (!user) {
      setFeatureStatus(featureName, false);
      setStatus('checked');
      return;
    }

    // For logged-in users, check backend API (only if not already checking)
    if (status === 'checking') {
      return;
    }

    setStatus('checking');

    SiteService.getFeatureStatus(featureName)
      .then((res) => {
        setIsDismissed(res.clicked);
        setFeatureStatus(featureName, res.clicked);
      })
      .catch((error) => {
        console.error(`Failed to get status for feature ${featureName}:`, error);
        setFeatureStatus(featureName, false);
      })
      .finally(() => {
        setStatus('checked');
      });
  }, [isUserLoading, user, featureName, status, getFeatureStatus, setFeatureStatus]);

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

      // Initialize features from context/localStorage
      const initialFeatures: Record<
        string,
        { isDismissed: boolean; dismissStatus: DismissStatus }
      > = {};

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

          // Update features with backend results
          setFeatures((prev) => {
            const updated = { ...prev };
            backendResults.forEach(({ featureName, clicked }) => {
              updated[featureName] = {
                isDismissed: clicked,
                dismissStatus: 'checked',
              };
              // Update context (which handles localStorage)
              setFeatureStatus(featureName, clicked);
            });
            return updated;
          });
        } catch (error) {
          console.error('Failed to load features from backend:', error);
        }
      } else {
        // Mark unchecked features as checked with not dismissed
        setFeatures((prev) => {
          const updated = { ...prev };
          featureNamesList.forEach((featureName) => {
            if (updated[featureName]?.dismissStatus === 'unchecked') {
              updated[featureName] = {
                isDismissed: false,
                dismissStatus: 'checked',
              };
              setFeatureStatus(featureName, false);
            }
          });
          return updated;
        });
      }

      setIsLoading(false);
    };

    loadFeatures();
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

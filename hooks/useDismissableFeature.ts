import { useEffect, useState, useMemo } from 'react';
import { SiteService } from '@/services/site.service';
import { useUser } from '@/contexts/UserContext';

type DissmissStatus = 'unchecked' | 'checked' | 'checking';

// Single feature hook
export function useDismissableFeature(featureName: string): {
  isDismissed: boolean;
  dismissFeature: () => void;
  dismissStatus: DissmissStatus;
} {
  const { user, isLoading } = useUser();

  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [status, setStatus] = useState<DissmissStatus>('unchecked');

  const getLocalStorageKey = (feature: string) => `feature_${feature.toLowerCase()}_dismissed`;

  const dismissFeature = () => {
    setIsDismissed(true);

    // Always update localStorage for immediate persistence
    try {
      window.localStorage.setItem(getLocalStorageKey(featureName), 'true');
    } catch (error) {
      console.error('Failed to use localStorage:', error);
    }

    // If user is logged in, also update backend
    if (user?.id) {
      SiteService.dismissFeature({
        user: user.id,
        feature: featureName,
      }).catch((error) => {
        console.error(`Failed to dismiss feature ${featureName}:`, error);
      });
    }
  };

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (status === 'checked' || status === 'checking') {
      return;
    }

    setStatus('checking');

    // First check localStorage (fast, local check)
    try {
      const localStorageValue = window.localStorage?.getItem(getLocalStorageKey(featureName));

      if (localStorageValue === 'true') {
        setIsDismissed(true);
        setStatus('checked');
        return;
      }
    } catch (error) {
      console.error('Failed to use localStorage:', error);
    }

    // If localStorage doesn't have the value and user is logged in, check backend
    if (user) {
      SiteService.getFeatureStatus(featureName)
        .then((res) => {
          setIsDismissed(res.clicked);

          // Update localStorage with backend result for future fast checks
          if (res.clicked) {
            try {
              window.localStorage.setItem(getLocalStorageKey(featureName), 'true');
            } catch (error) {
              console.error('Failed to update localStorage:', error);
            }
          }
        })
        .catch((error) => {
          console.error(`Failed to get status for feature ${featureName}:`, error);
          setIsDismissed(false);
        })
        .finally(() => {
          setStatus('checked');
        });
    } else {
      // For non-logged in users, just check localStorage (already done above)
      setStatus('checked');
    }
  }, [isLoading, user, featureName, status]);

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
      dismissStatus: DissmissStatus;
    }
  >;
  isLoading: boolean;
  dismissFeature: (featureName: string) => void;
} {
  const { user, isLoading: userLoading } = useUser();
  const [features, setFeatures] = useState<
    Record<
      string,
      {
        isDismissed: boolean;
        dismissStatus: DissmissStatus;
      }
    >
  >({});
  const [isLoading, setIsLoading] = useState(true);

  // Memoize the featureNames array to prevent infinite re-renders
  const memoizedFeatureNames = useMemo(() => featureNames, [featureNames.join(',')]);

  const getLocalStorageKey = (feature: string) => `feature_${feature.toLowerCase()}_dismissed`;

  const dismissFeature = (featureName: string) => {
    setFeatures((prev) => ({
      ...prev,
      [featureName]: {
        ...prev[featureName],
        isDismissed: true,
      },
    }));

    // Always update localStorage for immediate persistence
    try {
      window.localStorage.setItem(getLocalStorageKey(featureName), 'true');
    } catch (error) {
      console.error('Failed to use localStorage:', error);
    }

    // If user is logged in, also update backend
    if (user?.id) {
      SiteService.dismissFeature({
        user: user.id,
        feature: featureName,
      }).catch((error) => {
        console.error(`Failed to dismiss feature ${featureName}:`, error);
      });
    }
  };

  useEffect(() => {
    if (userLoading) {
      return;
    }

    const loadFeatures = async () => {
      setIsLoading(true);

      // First check localStorage for all features
      const localStorageResults: Record<string, boolean> = {};
      const featuresToCheckBackend: string[] = [];

      memoizedFeatureNames.forEach((featureName) => {
        try {
          const localStorageValue = window.localStorage?.getItem(getLocalStorageKey(featureName));
          const isDismissed = localStorageValue === 'true';
          localStorageResults[featureName] = isDismissed;

          if (!isDismissed && user) {
            featuresToCheckBackend.push(featureName);
          }
        } catch (error) {
          console.error('Failed to use localStorage:', error);
          if (user) {
            featuresToCheckBackend.push(featureName);
          }
        }
      });

      // Initialize features with localStorage results
      const initialFeatures: Record<
        string,
        {
          isDismissed: boolean;
          dismissStatus: DissmissStatus;
        }
      > = {};

      memoizedFeatureNames.forEach((featureName) => {
        initialFeatures[featureName] = {
          isDismissed: localStorageResults[featureName] || false,
          dismissStatus: localStorageResults[featureName] ? 'checked' : 'unchecked',
        };
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

              // Update localStorage with backend result
              if (clicked) {
                try {
                  window.localStorage.setItem(getLocalStorageKey(featureName), 'true');
                } catch (error) {
                  console.error('Failed to update localStorage:', error);
                }
              }
            });
            return updated;
          });
        } catch (error) {
          console.error('Failed to load features from backend:', error);
        }
      }

      setIsLoading(false);
    };

    loadFeatures();
  }, [userLoading, user, memoizedFeatureNames]);

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
      {
        isDismissed: boolean;
        dismissFeature: () => void;
        dismissStatus: DissmissStatus;
      }
    >
  );

  return {
    features: featuresWithMethods,
    isLoading,
    dismissFeature,
  };
}

import { useEffect, useState } from 'react';
import { SiteService } from '@/services/site.service';
import { useUser } from '@/contexts/UserContext';

type DissmissStatus = 'unchecked' | 'checked' | 'checking';

export function useDismissableFeature(featureName: string): {
  isDismissed: boolean;
  dismissFeature: () => void;
  dismissStatus: DissmissStatus;
} {
  const { user, isLoading } = useUser();

  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [status, setStatus] = useState<DissmissStatus>('unchecked');

  const dismissFeature = () => {
    setIsDismissed(true);
    if (user?.id) {
      SiteService.dismissFeature({
        user: user.id,
        feature: featureName,
      }).catch((error) => {
        console.error(`Failed to dismiss feature ${featureName}:`, error);
      });
    } else {
      try {
        window.localStorage.setItem(`feature_${featureName.toLowerCase()}_dismissed`, 'true');
      } catch (error) {
        console.error('Failed to use localStorage:', error);
      }
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

    if (user) {
      SiteService.getFeatureStatus(featureName)
        .then((res) => {
          setIsDismissed(res.clicked);
        })
        .catch((error) => {
          console.error(`Failed to get status for feature ${featureName}:`, error);
          setIsDismissed(false);
        })
        .finally(() => {
          setStatus('checked');
        });
    } else {
      try {
        const localStorageValue =
          window.localStorage?.getItem(`feature_${featureName.toLowerCase()}_dismissed`) ?? 'false';
        setIsDismissed(localStorageValue === 'true');
      } catch (error) {
        console.error('Failed to use localStorage:', error);
        setIsDismissed(false);
      } finally {
        setStatus('checked');
      }
    }
  }, [isLoading, user, featureName, status]);

  return {
    isDismissed,
    dismissFeature,
    dismissStatus: status,
  };
}

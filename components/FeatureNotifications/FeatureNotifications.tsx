'use client';

import React, { useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { FeatureNotification as FeatureNotificationType } from './types';
import { FeatureNotification as FeatureNotificationComponent } from './FeatureNotification';
import { featureNotificationsConfig } from './config';
import { useUser } from '@/contexts/UserContext';
import { useDismissableFeatures } from '@/hooks/useDismissableFeature';

export function FeatureNotifications() {
  const { user } = useUser();
  const config = featureNotificationsConfig;

  // Memoize feature names to prevent infinite re-renders
  const featureNames = useMemo(
    () => config.notifications.map((notification) => notification.id),
    [config.notifications]
  );

  const { features, isLoading } = useDismissableFeatures(featureNames);

  const isNotificationShown = useCallback(
    (notification: FeatureNotificationType): boolean => {
      const feature = features[notification.id];

      // Check if the hook has finished loading and the feature is dismissed
      if (feature?.dismissStatus === 'checked') {
        return feature.isDismissed;
      }

      return false;
    },
    [features]
  );

  const markNotificationAsShown = useCallback(
    (notification: FeatureNotificationType) => {
      const feature = features[notification.id];
      feature?.dismissFeature();
    },
    [features]
  );

  const showNotification = useCallback(
    (notification: FeatureNotificationType) => {
      // Check if this notification has already been shown
      if (isNotificationShown(notification)) {
        return;
      }

      // Check if we should show for current user
      if (!notification.showForAllUsers && !user) {
        return;
      }

      const position = notification.position || config.defaultPosition || 'top-right';
      const duration = notification.duration || config.defaultDuration;

      toast.custom(
        (t) => (
          <FeatureNotificationComponent
            notification={notification}
            onDismiss={(id) => {
              markNotificationAsShown(notification);
              toast.dismiss(t.id);
            }}
          />
        ),
        {
          id: notification.id,
          position,
          duration,
        }
      );
    },
    [
      user,
      isNotificationShown,
      markNotificationAsShown,
      config.defaultPosition,
      config.defaultDuration,
    ]
  );

  const showNotifications = useCallback(() => {
    if (!config.enabled) return;

    // Sort notifications by priority
    const sortedNotifications = [...config.notifications].sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority || 'medium'];
      const bPriority = priorityOrder[b.priority || 'medium'];
      return bPriority - aPriority;
    });

    // Show notifications with delay
    sortedNotifications.forEach((notification, index) => {
      setTimeout(() => {
        showNotification(notification);
      }, index * 500); // 0.5 second between notifications
    });
  }, [config, showNotification]);

  useEffect(() => {
    // Wait for all features to load before showing notifications
    if (isLoading) {
      return;
    }

    // Show notifications after page load
    const timer = setTimeout(() => {
      showNotifications();
    }, 500); // 0.5 second delay after page load

    return () => clearTimeout(timer);
  }, [showNotifications, isLoading]);

  // This component doesn't render anything visible
  return null;
}

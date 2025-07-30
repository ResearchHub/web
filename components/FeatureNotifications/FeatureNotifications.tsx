'use client';

import React, { useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import { FeatureNotification as FeatureNotificationType } from './types';
import { FeatureNotification as FeatureNotificationComponent } from './FeatureNotification';
import { featureNotificationsConfig } from './config';
import { useUser } from '@/contexts/UserContext';

export function FeatureNotifications() {
  const { user } = useUser();
  const config = featureNotificationsConfig;

  const isNotificationShown = useCallback((cookieName: string): boolean => {
    return Cookies.get(cookieName) === 'shown';
  }, []);

  const markNotificationAsShown = useCallback((cookieName: string) => {
    // Set cookie without expiration (permanent)
    Cookies.set(cookieName, 'shown', { expires: 365 * 24 * 60 * 60 * 1000 }); // 1 year
  }, []);

  const showNotification = useCallback(
    (notification: FeatureNotificationType) => {
      // Check if this notification has already been shown
      if (isNotificationShown(notification.cookieName)) {
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
              markNotificationAsShown(notification.cookieName);
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
    // Show notifications after page load
    const timer = setTimeout(() => {
      showNotifications();
    }, 500); // 0.5 second delay after page load

    return () => clearTimeout(timer);
  }, [showNotifications]);

  // This component doesn't render anything visible
  return null;
}

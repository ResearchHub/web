'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { NotificationService } from '@/services/notification.service';
import { useSession } from 'next-auth/react';
import type { NotificationListResponse } from '@/services/types/notification.dto';

interface NotificationContextType {
  notificationData: NotificationListResponse;
  loading: boolean;
  error: string | null;
  unreadCount: number;
  isLoadingMore: boolean;
  refreshUnreadCount: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  fetchNextPage: () => Promise<void>;
  markAllAsRead: () => Promise<void>;
  setIsLoadingMore: (isLoadingMore: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notificationData: { results: [], count: 0, next: null, previous: null },
  loading: true,
  error: null,
  unreadCount: 0,
  isLoadingMore: false,
  refreshUnreadCount: async () => {},
  fetchNotifications: async () => {},
  fetchNextPage: async () => {},
  markAllAsRead: async () => {},
  setIsLoadingMore: () => {},
});

function AuthenticatedNotificationProvider({ children }: { children: React.ReactNode }) {
  const [notificationData, setNotificationData] = useState<NotificationListResponse>({
    results: [],
    count: 0,
    next: null,
    previous: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await NotificationService.getNotifications();
      setNotificationData(response);
    } catch (err) {
      setError('Failed to load notifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNextPage = useCallback(async () => {
    if (!notificationData.next || loading) return;
    try {
      setIsLoadingMore(true);
      const response = await NotificationService.getNotificationsByUrl(notificationData.next);

      setNotificationData((prev) => ({
        ...response,
        results: [...prev.results, ...response.results],
      }));
    } catch (err) {
      setError('Failed to load more notifications');
      console.error(err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [notificationData.next, loading]);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const response = await NotificationService.getUnreadCount();
      setUnreadCount(response.count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await NotificationService.markAllAsRead();

      setNotificationData((prev) => ({
        ...prev,
        results: prev.results.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      }));

      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, []);

  useEffect(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  return (
    <NotificationContext.Provider
      value={{
        notificationData,
        loading,
        error,
        unreadCount,
        refreshUnreadCount,
        fetchNotifications,
        fetchNextPage,
        markAllAsRead,
        isLoadingMore,
        setIsLoadingMore,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  if (status !== 'authenticated') {
    return (
      <NotificationContext.Provider
        value={{
          notificationData: { results: [], count: 0, next: null, previous: null },
          loading: false,
          error: null,
          unreadCount: 0,
          refreshUnreadCount: async () => {},
          fetchNotifications: async () => {},
          fetchNextPage: async () => {},
          markAllAsRead: async () => {},
          isLoadingMore: false,
          setIsLoadingMore: () => {},
        }}
      >
        {children}
      </NotificationContext.Provider>
    );
  }

  return <AuthenticatedNotificationProvider>{children}</AuthenticatedNotificationProvider>;
}

export const useNotifications = () => useContext(NotificationContext);

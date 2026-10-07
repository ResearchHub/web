'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { NotificationService } from '@/services/notification.service';
import { useSession } from 'next-auth/react';
import type { NotificationListResponse } from '@/services/types/notification.dto';

interface NotificationContextType {
  notificationData: NotificationListResponse;
  loading: boolean;
  error: string | null;
  loadMoreError: string | null;
  unreadCount: number;
  isLoadingMore: boolean;
  refreshUnreadCount: () => Promise<void>;
  /** Resolves to whether the first page loaded. */
  fetchNotifications: () => Promise<boolean>;
  fetchNextPage: () => Promise<void>;
  markAllAsRead: () => Promise<void>;
  setIsLoadingMore: (isLoadingMore: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notificationData: { results: [], count: 0, next: null, previous: null },
  loading: true,
  error: null,
  loadMoreError: null,
  unreadCount: 0,
  isLoadingMore: false,
  refreshUnreadCount: async () => {},
  fetchNotifications: async () => false,
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
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    setLoadMoreError(null);
    try {
      const response = await NotificationService.getNotifications();
      setNotificationData(response);
      return true;
    } catch (err) {
      setError('Failed to load notifications');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNextPage = useCallback(async () => {
    if (!notificationData.next || loading || isLoadingMore) return;
    try {
      setIsLoadingMore(true);
      setLoadMoreError(null);
      const response = await NotificationService.getNotificationsByUrl(notificationData.next);

      setNotificationData((prev) => ({
        ...response,
        results: [...prev.results, ...response.results],
      }));
    } catch (err) {
      setLoadMoreError('Failed to load more notifications');
      console.error(err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [notificationData.next, loading, isLoadingMore]);

  const refreshUnreadCount = async () => {
    try {
      const response = await NotificationService.getUnreadCount();
      setUnreadCount(response.count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  useEffect(() => {
    refreshUnreadCount();
  }, []);

  // Loaded notifications keep their read flags so the open list still marks what was new.
  const markAllAsRead = useCallback(async () => {
    try {
      await NotificationService.markAllAsRead();
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notificationData,
        loading,
        error,
        loadMoreError,
        unreadCount,
        isLoadingMore,
        refreshUnreadCount,
        fetchNotifications,
        fetchNextPage,
        markAllAsRead,
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
          loadMoreError: null,
          unreadCount: 0,
          isLoadingMore: false,
          refreshUnreadCount: async () => {},
          fetchNotifications: async () => false,
          fetchNextPage: async () => {},
          markAllAsRead: async () => {},
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

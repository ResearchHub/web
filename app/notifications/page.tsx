'use client'

import { useEffect, useRef, useCallback } from 'react'
import { PageLayout } from '@/app/layouts/PageLayout'
import { useNotifications } from '@/contexts/NotificationContext'
import { NotificationList } from '@/components/Notification/NotificationList'
import { NotificationSkeleton } from '@/components/Notification/NotificationSkeleton'
import { PageHeader } from '@/components/ui/PageHeader'

export default function NotificationsPage() {
  const { 
    notificationData,
    loading, 
    isLoadingMore,
    error, 
    fetchNotifications,
    fetchNextPage
  } = useNotifications()

  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [target] = entries
    if (target.isIntersecting && notificationData.next) {
      fetchNextPage()
    }
  }, [fetchNextPage, notificationData.next])

  useEffect(() => {
    const element = observerTarget.current
    if (!element) return

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 1.0,
    })

    observer.observe(element)

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [handleObserver])

  return (
    <PageLayout>
      <div className="w-full">
        <PageHeader title="Notifications" />

        <div className="py-6">
          <NotificationList
            notifications={notificationData.results}
            loading={loading}
            error={error}
          />
          {notificationData.next && (
            <div ref={observerTarget} className="mt-4">
              {isLoadingMore && (
                <div className="space-y-4">
                  <NotificationSkeleton key="skeleton-1" />
                  <NotificationSkeleton key="skeleton-2" />
                  <NotificationSkeleton key="skeleton-3" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
} 
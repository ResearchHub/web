'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { PageLayout } from '@/app/layouts/PageLayout'
import { useNotifications } from '@/contexts/NotificationContext'
import { NotificationList } from '@/components/Notification/NotificationList'
import { NotificationSkeleton } from '@/components/Notification/NotificationSkeleton'
import { Tabs } from '@/components/ui/Tabs'
import { Trophy, MessageCircle } from 'lucide-react'

export default function NotificationsPage() {
  const { 
    notificationData,
    loading, 
    isLoadingMore,
    error, 
    fetchNotifications,
    fetchNextPage
  } = useNotifications()

  const [activeTab, setActiveTab] = useState('all')

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'earning', label: 'Earning', icon: Trophy },
    { id: 'responses', label: 'Responses', icon: MessageCircle },
  ]

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

  const content = (
    <div className="w-full">
      <div className="border-b">
        <Tabs 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="max-w-screen-xl mx-auto"
        />
      </div>

      <div className="mt-6">
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
  )

  return (
    <PageLayout>
      {content}
    </PageLayout>
  )
} 
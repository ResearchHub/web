'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/icons/Icon';
import { useNotifications } from '@/contexts/NotificationContext';
import { useUser } from '@/contexts/UserContext';
import { useWebSocket } from '@/hooks/useWebSocket';
import { WS_ROUTES } from '@/services/websocket';
import { transformNotification } from '@/types/notification';
import { Tooltip } from '@/components/ui/Tooltip';

interface NotificationBellProps {
  filled?: boolean;
}

export function NotificationBell({ filled }: NotificationBellProps) {
  const [unreadCountInternal, setUnreadCountInternal] = useState(0);
  const { unreadCount } = useNotifications();
  const { user } = useUser();
  const pathname = usePathname();
  const isNotificationsPage = pathname === '/notifications';
  const href = isNotificationsPage ? '/' : '/notifications';

  // Connect to WebSocket for real-time notification updates
  const { messages } = useWebSocket({
    url: user?.id ? WS_ROUTES.NOTIFICATIONS(user.id) : '',
    authRequired: true,
    autoConnect: !!user?.id,
    global: true,
  });

  // Update unread count when new notifications arrive via websocket
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      try {
        transformNotification(latestMessage);
        setUnreadCountInternal((prev) => prev + 1);
      } catch (error) {
        console.error('Error processing notification:', error);
      }
    }
  }, [messages]);

  useEffect(() => {
    setUnreadCountInternal((prev) => prev + unreadCount);
  }, [unreadCount]);

  return (
    <Tooltip content="Notifications" width={'120px'}>
      <Link href={href} className="relative flex items-center justify-center">
        <Icon
          name="notification"
          size={24}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        />
        {unreadCountInternal > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-[9px] font-medium text-white">
            {unreadCountInternal > 9 ? '9+' : unreadCountInternal}
          </span>
        )}
      </Link>
    </Tooltip>
  );
}

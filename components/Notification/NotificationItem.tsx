import { Notification } from '@/types/notification';
import Link from 'next/link';
import { formatTimestamp } from '@/utils/date';
import { getNotificationInfo, formatNotificationMessage } from './lib/formatNotification';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/icons/Icon';
import clsx from 'clsx';

interface NotificationItemProps {
  notification: Notification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const notificationInfo = getNotificationInfo(notification);
  const message = formatNotificationMessage(notification);
  const hasNavigationUrl =
    !!notification.navigation_url && notification.navigation_url.trim() !== '';

  const AvatarSection =
    notification.action_user && notificationInfo.useAvatar ? (
      <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <Avatar
          src={notification.action_user?.authorProfile?.profileImage}
          alt={notification.action_user?.fullName || 'User'}
          size="md"
          authorId={notification.action_user?.authorProfile?.id}
        />
      </div>
    ) : (
      <div className={clsx('p-2 rounded-full bg-gray-100 flex-shrink-0', notificationInfo.color)}>
        <Icon name={notificationInfo.icon} size={20} />
      </div>
    );

  const ContentSection = (
    <div className="flex-grow min-w-0">
      <div className="text-sm text-gray-900">{message}</div>
      <div className="mt-1 text-xs text-gray-500">{formatTimestamp(notification.created_date)}</div>
    </div>
  );

  const wrapperClassNames = clsx(
    'p-4',
    notification.read ? 'bg-white' : 'bg-blue-50',
    hasNavigationUrl ? 'hover:bg-gray-50 transition-colors cursor-pointer' : ''
  );

  return (
    <div className="border-b border-gray-100">
      <div className={wrapperClassNames}>
        <div className="flex gap-4 items-start">
          {AvatarSection}

          {hasNavigationUrl && notification.navigation_url ? (
            <Link
              href={notification.navigation_url}
              className="flex-grow min-w-0 hover:text-indigo-600 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {ContentSection}
            </Link>
          ) : (
            ContentSection
          )}
        </div>
      </div>
    </div>
  );
}

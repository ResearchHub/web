import { Notification } from '@/types/notification';
import Link from 'next/link';
import { formatTimestamp } from '@/utils/date';
import {
  getNotificationInfo,
  formatNotificationMessage,
  getHubDetailsFromNotification,
} from './lib/formatNotification';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/icons/Icon';
import clsx from 'clsx';
import { TopicAndJournalBadge } from '@/components/ui/TopicAndJournalBadge';

interface NotificationItemProps {
  notification: Notification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const notificationInfo = getNotificationInfo(notification);
  const message = formatNotificationMessage(notification);
  const hasNavigationUrl =
    !!notification.navigation_url && notification.navigation_url.trim() !== '';

  const hubDetails = getHubDetailsFromNotification(notification);

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
      <div
        className={clsx(
          'w-[38px] h-[38px] flex items-center justify-center rounded-full bg-gray-50 flex-shrink-0',
          notificationInfo.color
        )}
      >
        <Icon name={notificationInfo.icon} size={18} />
      </div>
    );

  const ContentSection = (
    <div className="flex-grow min-w-0">
      <div className="text-sm font-medium text-gray-900">{message}</div>
      {hubDetails && (
        <div className="mt-2" onClick={(e) => e.stopPropagation()}>
          <TopicAndJournalBadge
            type="topic"
            name={hubDetails.name}
            slug={hubDetails.slug}
            imageUrl={hubDetails.imageUrl}
            size="sm"
          />
        </div>
      )}
      <div className="mt-0.5 text-xs text-gray-500">
        {formatTimestamp(notification.created_date)}
      </div>
    </div>
  );

  return (
    <div className="group">
      <div
        className={clsx(
          'relative py-3 px-4 -mx-4 rounded-lg',
          notification.read ? 'hover:bg-gray-50' : 'bg-blue-50 hover:bg-blue-100',
          hasNavigationUrl ? 'cursor-pointer' : ''
        )}
      >
        <div className="flex gap-3 items-center">
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

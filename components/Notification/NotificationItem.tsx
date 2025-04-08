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
  const hasNavigationUrl = !!notification.navigationUrl && notification.navigationUrl.trim() !== '';

  const hubDetails = getHubDetailsFromNotification(notification);

  const IndicatorSection = (
    <div className="w-2 flex-shrink-0 flex items-center justify-center self-center">
      <div
        className={clsx(
          'w-2 h-2 rounded-full',
          !notification.read ? 'bg-primary-500' : 'bg-transparent'
        )}
      ></div>
    </div>
  );

  const AvatarSection =
    notification.actionUser && notificationInfo.useAvatar ? (
      <div className="flex-shrink-0 w-[40px] h-[40px]" onClick={(e) => e.stopPropagation()}>
        <Avatar
          src={notification.actionUser?.authorProfile?.profileImage}
          alt={notification.actionUser?.fullName || 'User'}
          size="md"
          authorId={notification.actionUser?.authorProfile?.id}
        />
      </div>
    ) : (
      <div
        className={clsx(
          'w-[40px] h-[40px] flex items-center justify-center rounded-full bg-gray-50 flex-shrink-0'
        )}
      >
        <Icon name={notificationInfo.icon} size={18} />
      </div>
    );

  const ContentSection = (
    <div className="flex-grow min-w-0">
      <div className="text-sm font-medium text-gray-900">{message}</div>
      {hubDetails && (
        <div className="mt-1.5 mb-1.5 inline-block" onClick={(e) => e.stopPropagation()}>
          <TopicAndJournalBadge
            type="topic"
            name={hubDetails.name}
            slug={hubDetails.slug}
            imageUrl={hubDetails.imageUrl}
            size="sm"
          />
        </div>
      )}
      <div className="text-xs text-gray-500">
        {formatTimestamp(notification.createdDate.toISOString())}
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
        <div className="flex items-center">
          <div className="pl-1 flex-shrink-0 flex items-center justify-center self-center">
            <div
              className={clsx(
                'w-2 h-2 rounded-full',
                !notification.read ? 'bg-primary-500' : 'bg-transparent'
              )}
            ></div>
          </div>
          <div className="ml-3 flex gap-3 items-center">
            {AvatarSection}

            {hasNavigationUrl && notification.navigationUrl ? (
              <Link
                href={notification.navigationUrl}
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
    </div>
  );
}

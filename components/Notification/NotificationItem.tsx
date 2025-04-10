import { Notification } from '@/types/notification';
import Link from 'next/link';
import { formatTimestamp } from '@/utils/date';
import {
  getNotificationInfo,
  formatNotificationMessage,
  getHubDetailsFromNotification,
  formatNavigationUrl,
} from './lib/formatNotification';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/icons/Icon';
import clsx from 'clsx';
import { TopicAndJournalBadge } from '@/components/ui/TopicAndJournalBadge';
import { ChevronRight } from 'lucide-react';

interface NotificationItemProps {
  notification: Notification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const notificationInfo = getNotificationInfo(notification);
  const message = formatNotificationMessage(notification);
  const formattedNavigationUrl = formatNavigationUrl(notification.navigationUrl);
  const hasNavigationUrl = !!formattedNavigationUrl && formattedNavigationUrl.trim() !== '';

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
          'w-[40px] h-[40px] flex items-center justify-center rounded-full bg-white flex-shrink-0'
        )}
      >
        <Icon name={notificationInfo.icon} size={18} />
      </div>
    );

  const ContentSection = (
    <div className="flex-grow min-w-0">
      <div className="text-sm font-medium text-gray-900">{message}</div>
      <div className="flex items-center gap-2 mt-1">
        <div className="text-xs text-gray-500">
          {formatTimestamp(notification.createdDate.toISOString())}
        </div>
        {hubDetails && (
          <div className="inline-block" onClick={(e) => e.stopPropagation()}>
            <TopicAndJournalBadge
              type="topic"
              name={hubDetails.name}
              slug={hubDetails.slug}
              imageUrl={hubDetails.imageUrl}
              size="sm"
            />
          </div>
        )}
      </div>
    </div>
  );

  const NavigationIndicator = hasNavigationUrl && (
    <div className="text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0">
      <ChevronRight size={16} />
    </div>
  );

  return (
    <div className="group">
      <div
        className={clsx(
          'relative py-3 px-2 border-b border-gray-100',
          notification.read
            ? hasNavigationUrl
              ? 'hover:bg-gray-50'
              : ''
            : hasNavigationUrl
              ? 'bg-primary-50/40 hover:bg-primary-50/60'
              : 'bg-primary-50/40',
          hasNavigationUrl ? 'cursor-pointer' : ''
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {IndicatorSection}
            <div className="ml-2 flex gap-3 items-center">
              {AvatarSection}

              {hasNavigationUrl && formattedNavigationUrl ? (
                <Link
                  href={formattedNavigationUrl}
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
          {hasNavigationUrl && NavigationIndicator}
        </div>
      </div>
    </div>
  );
}

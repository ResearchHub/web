import { KeyboardEvent } from 'react';
import { Notification } from '@/types/notification';
import { formatTimeAgo } from '@/utils/date';
import {
  formatNavigationUrl,
  formatNotificationMessage,
  getNotificationInfo,
  getNotificationTitle,
  getNotificationTone,
  type NotificationTone,
} from './lib/formatNotification';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/icons/Icon';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { cn } from '@/utils/styles';
import { Button } from '@/components/ui/Button';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { Tooltip } from '@/components/ui/Tooltip';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const TONE_STYLES: Record<NotificationTone, { iconBg: string; iconColor: string }> = {
  blue: { iconBg: 'bg-primary-50', iconColor: '#2563eb' },
  green: { iconBg: 'bg-emerald-50', iconColor: '#059669' },
  amber: { iconBg: 'bg-amber-50', iconColor: '#d97706' },
  violet: { iconBg: 'bg-violet-50', iconColor: '#7c3aed' },
  red: { iconBg: 'bg-rose-50', iconColor: '#e11d48' },
};

interface NotificationItemProps {
  notification: Notification;
}

export function NotificationItem({ notification }: Readonly<NotificationItemProps>) {
  const router = useRouter();
  const notificationInfo = getNotificationInfo(notification);
  const { exchangeRate } = useExchangeRate();
  const { showUSD } = useCurrencyPreference();
  const title = getNotificationTitle(notification);
  const message = formatNotificationMessage(notification, exchangeRate, showUSD);
  const formattedNavigationUrl = formatNavigationUrl(notification);
  const hasNavigationUrl = !!formattedNavigationUrl && formattedNavigationUrl.trim() !== '';
  const toneStyles = TONE_STYLES[getNotificationTone(notification)];
  const timeAgo = formatTimeAgo(notification.createdDate.toISOString());
  const isUnread = !notification.read;

  const handleClick = () => {
    if (hasNavigationUrl && formattedNavigationUrl) {
      router.push(formattedNavigationUrl);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // Ignore Enter on nested controls (avatar, "Learn more") bubbling up to the item.
    if (event.key === 'Enter' && event.target === event.currentTarget) {
      handleClick();
    }
  };

  const navigationProps = hasNavigationUrl
    ? { role: 'link', tabIndex: 0, onClick: handleClick, onKeyDown: handleKeyDown }
    : {};

  const visual =
    notification.type === 'FUNDING_CREDITS_REMINDER' ? (
      // The coin's circle spans 12/14 of its viewBox; oversize it so the circle matches the 40px avatars.
      <ResearchCoinIcon variant="green" size={46} outlined className="-m-[3px] flex-shrink-0" />
    ) : notification.actionUser && notificationInfo.useAvatar ? (
      <Avatar
        className="flex-shrink-0"
        src={notification.actionUser?.authorProfile?.profileImage}
        alt={notification.actionUser?.fullName || 'User'}
        size="md"
        authorId={notification.actionUser?.authorProfile?.id}
        onClick={(e) => e.stopPropagation()}
      />
    ) : (
      <div
        className={cn(
          'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full',
          toneStyles.iconBg
        )}
      >
        <Icon name={notificationInfo.icon} size={18} color={toneStyles.iconColor} />
      </div>
    );

  const titleRow = (
    <h3 className="min-w-0 break-words text-[15px] font-semibold text-gray-900">{title}</h3>
  );

  const learnMore = notification.type === 'PREREGISTRATION_UPDATE_REMINDER' && (
    <Tooltip
      content={
        <p className="text-xs text-left p-1">
          ResearchHub incentivizes scientists to share ongoing updates as their experiments
          progress. There are no format or length requirements - interesting insights described with
          brevity are preferred for keeping our community of funders informed and interested in your
          work.
        </p>
      }
      position="bottom"
      width="w-72"
    >
      <Button
        variant="ghost"
        className="ml-1 inline h-auto w-auto cursor-help rounded-none p-0 text-xs font-medium text-gray-600"
        style={{ borderBottom: '1px dotted currentColor' }}
        onClick={(e) => e.stopPropagation()}
      >
        Learn more
      </Button>
    </Tooltip>
  );

  return (
    <div
      className={cn(
        'flex items-start gap-3 py-4 pl-2.5 pr-4 transition-colors',
        hasNavigationUrl && 'cursor-pointer hover:bg-gray-50'
      )}
      {...navigationProps}
    >
      {/* Read rows keep the empty slot so every avatar lines up. */}
      <span className="flex w-2 flex-shrink-0 self-center">
        {isUnread && (
          <>
            <span className="h-2 w-2 rounded-full bg-primary-500" aria-hidden />
            <span className="sr-only">Unread</span>
          </>
        )}
      </span>
      {visual}
      {/* The time sits beside the text when there's room and wraps below it on narrow screens. */}
      <div className="ml-1 flex min-w-0 flex-1 flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <div className="min-w-0 flex-1 basis-64">
          {titleRow}
          <p className="mt-0.5 text-sm leading-snug text-gray-500">
            {message.before}
            {message.amount && (
              <span className="font-semibold text-green-600">{message.amount}</span>
            )}
            {message.after}
            {learnMore}
          </p>
        </div>
        <span className="flex-shrink-0 text-xs text-gray-400">{timeAgo}</span>
      </div>
      {hasNavigationUrl ? (
        <ChevronRight className="h-4 w-4 flex-shrink-0 self-center text-gray-300" aria-hidden />
      ) : (
        <span className="w-4 flex-shrink-0" aria-hidden />
      )}
    </div>
  );
}

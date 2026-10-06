import { ReactNode } from 'react';
import { Notification } from '@/types/notification';
import { formatTimeAgo } from '@/utils/date';
import {
  formatNavigationUrl,
  formatNotificationMessage,
  getNotificationActionLabel,
  getNotificationAmount,
  getNotificationInfo,
  getNotificationTitle,
  getNotificationTone,
  isEarningNotification,
  type NotificationTone,
} from './lib/formatNotification';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/icons/Icon';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { cn } from '@/utils/styles';
import { Button } from '@/components/ui/Button';
import { ContributionAmount } from '@/components/Activity/amounts/ContributionAmount';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { Tooltip } from '@/components/ui/Tooltip';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const TONE_STYLES: Record<NotificationTone, { bar: string; iconBg: string; iconColor: string }> = {
  blue: { bar: 'bg-primary-500', iconBg: 'bg-primary-50', iconColor: '#2563eb' },
  green: { bar: 'bg-emerald-500', iconBg: 'bg-emerald-50', iconColor: '#059669' },
  amber: { bar: 'bg-amber-500', iconBg: 'bg-amber-50', iconColor: '#d97706' },
  violet: { bar: 'bg-violet-500', iconBg: 'bg-violet-50', iconColor: '#7c3aed' },
  red: { bar: 'bg-rose-500', iconBg: 'bg-rose-50', iconColor: '#e11d48' },
};

/** Render quoted work titles in the message in a darker, medium weight. */
function emphasizeQuoted(text: string): ReactNode[] {
  return text.split(/("[^"]+")/).map((part, index) =>
    index % 2 === 1 ? (
      <span key={index} className="font-medium text-gray-900">
        {part}
      </span>
    ) : (
      part
    )
  );
}

interface NotificationItemProps {
  notification: Notification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const router = useRouter();
  const notificationInfo = getNotificationInfo(notification);
  const { exchangeRate } = useExchangeRate();
  const { showUSD } = useCurrencyPreference();
  const title = getNotificationTitle(notification);
  const description = formatNotificationMessage(notification, exchangeRate, showUSD);
  const formattedNavigationUrl = formatNavigationUrl(notification);
  const hasNavigationUrl = !!formattedNavigationUrl && formattedNavigationUrl.trim() !== '';
  const amount = getNotificationAmount(notification);
  const tone = TONE_STYLES[getNotificationTone(notification)];
  const timeAgo = formatTimeAgo(notification.createdDate.toISOString());
  const isUnread = !notification.read;

  const handleClick = () => {
    if (hasNavigationUrl && formattedNavigationUrl) {
      router.push(formattedNavigationUrl);
    }
  };

  const visual =
    notification.type === 'FUNDING_CREDITS_REMINDER' ? (
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center">
        <ResearchCoinIcon variant="green" size={32} />
      </div>
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
          tone.iconBg
        )}
      >
        <Icon name={notificationInfo.icon} size={18} color={tone.iconColor} />
      </div>
    );

  const titleRow = (
    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
      <h3
        className={cn(
          'min-w-0 break-words text-gray-900',
          isUnread ? 'text-base font-bold' : 'text-[15px] font-semibold'
        )}
      >
        {title}
      </h3>
      {amount && (
        <ContributionAmount
          contribution={amount}
          showSign={isEarningNotification(notification)}
          size="sm"
          className="shrink-0"
        />
      )}
    </div>
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

  if (isUnread) {
    return (
      <div
        className={cn(
          'flex overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200 transition-shadow',
          hasNavigationUrl && 'cursor-pointer hover:shadow-md'
        )}
        onClick={handleClick}
      >
        <div className={cn('w-1 flex-shrink-0', tone.bar)} aria-hidden />
        <div className="flex min-w-0 flex-1 gap-4 p-4">
          {visual}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
              {titleRow}
              <span className="flex flex-shrink-0 items-center gap-2 text-xs text-gray-400">
                <span className="h-2 w-2 rounded-full bg-primary-500" aria-hidden />
                {timeAgo}
              </span>
            </div>
            <p className="mt-0.5 text-sm leading-snug text-gray-600">
              {emphasizeQuoted(description)}
              {learnMore}
            </p>
            {hasNavigationUrl && (
              <span className="mt-2.5 inline-flex items-center gap-1 text-sm font-semibold text-primary-600">
                {getNotificationActionLabel(notification)}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-start gap-4 p-4 transition-colors',
        hasNavigationUrl && 'cursor-pointer hover:bg-gray-50'
      )}
      onClick={handleClick}
    >
      {visual}
      {/* The time sits beside the text when there's room and wraps below it on narrow screens. */}
      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <div className="min-w-0 flex-1 basis-64">
          {titleRow}
          <p className="mt-0.5 text-sm leading-snug text-gray-500">
            {description}
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

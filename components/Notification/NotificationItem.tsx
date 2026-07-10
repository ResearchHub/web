import { Notification } from '@/types/notification';
import { formatTimeAgo } from '@/utils/date';
import {
  getNotificationInfo,
  getNotificationTitle,
  formatNotificationMessage,
  formatNavigationUrl,
  getRSCAmountForBadge,
} from './lib/formatNotification';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/icons/Icon';
import { cn } from '@/utils/styles';
import { Button } from '@/components/ui/Button';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { Tooltip } from '@/components/ui/Tooltip';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  const rscAmount = getRSCAmountForBadge(notification, description);

  const isReceivedRSC = [
    'FUNDRAISE_PAYOUT',
    'RSC_SUPPORT_ON_DIS',
    'RSC_SUPPORT_ON_DOC',
    'RSC_WITHDRAWAL_COMPLETE',
    'BOUNTY_PAYOUT',
  ].includes(notification.type);

  const AvatarSection =
    notification.actionUser && notificationInfo.useAvatar ? (
      <Avatar
        className="flex-shrink-0"
        src={notification.actionUser?.authorProfile?.profileImage}
        alt={notification.actionUser?.fullName || 'User'}
        size="md"
        authorId={notification.actionUser?.authorProfile?.id}
        onClick={(e) => e.stopPropagation()}
      />
    ) : (
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
        <Icon name={notificationInfo.icon} size={18} />
      </div>
    );

  return (
    <div
      className={cn(
        'flex items-start gap-3 border-b border-gray-200 px-4 py-4 transition-colors',
        !notification.read && 'bg-primary-50',
        hasNavigationUrl && 'cursor-pointer',
        notification.read ? 'hover:bg-gray-50' : 'hover:bg-primary-100'
      )}
      onClick={() => {
        if (hasNavigationUrl && formattedNavigationUrl) {
          router.push(formattedNavigationUrl);
        }
      }}
    >
      {AvatarSection}

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p className="min-w-0 truncate text-sm font-semibold text-gray-900">{title}</p>
          {rscAmount && (
            <CurrencyBadge
              amount={rscAmount}
              size="xs"
              variant={isReceivedRSC ? 'received' : 'badge'}
              currency={showUSD ? 'USD' : 'RSC'}
              showText
              className="shrink-0 py-0.5"
            />
          )}
        </div>

        <p className="mt-0.5 text-sm text-gray-600 leading-snug">
          {description}
          {notification.type === 'PREREGISTRATION_UPDATE_REMINDER' && (
            <Tooltip
              content={
                <p className="text-xs text-left p-1">
                  ResearchHub incentivizes scientists to share ongoing updates as their experiments
                  progress. There are no format or length requirements - interesting insights
                  described with brevity are preferred for keeping our community of funders informed
                  and interested in your work.
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
          )}
        </p>

        <p className="mt-1 text-xs text-gray-400">
          {formatTimeAgo(notification.createdDate.toISOString())}
        </p>
      </div>

      <div className="flex flex-shrink-0 items-center self-center">
        {hasNavigationUrl && <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden />}
      </div>
    </div>
  );
}

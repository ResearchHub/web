import { Notification } from '@/types/notification';
import { NotificationBodyElement } from '@/services/types/notification.dto';
import Link from 'next/link';
import { formatTimestamp } from '@/utils/date';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { FileIcon, FileTextIcon, Star, Trophy, Plus, Check, FileUp } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import clsx from 'clsx';

interface NotificationItemProps {
  notification: Notification;
}

const RewardBadge = ({ type }: { type: string }) => {
  const label =
    {
      REVIEW: 'Peer Review',
      CONTRIBUTION: 'Contribution',
      DISCUSSION: 'Discussion',
    }[type] || type;

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
      {type === 'REVIEW' && <Star className="w-3 h-3" />}
      {label}
    </span>
  );
};

const HubBadge = ({ name }: { name: string }) => (
  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
    {name.charAt(0).toUpperCase() + name.slice(1)}
  </span>
);

const RSCAmount = ({ amount }: { amount: string }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium">
    <ResearchCoinIcon size={14} color="#F3A113" />
    <span className="text-orange-600">{parseFloat(amount).toLocaleString()} RSC</span>
  </span>
);

const IconWithOverlay = ({
  icon: Icon,
  size = 40,
  className,
  overlayIcon: OverlayIcon = Trophy,
  overlayClassName = 'text-gray-500',
}: {
  icon: any;
  size?: number;
  className?: string;
  overlayIcon?: any;
  overlayClassName?: string;
}) => (
  <div className="relative">
    <Icon className={clsx(`w-${size / 4} h-${size / 4}`, className)} />
    <div className="absolute -bottom-1.5 -right-1.5 rounded-full bg-white p-1 shadow-sm ring-1 ring-gray-200/50">
      <div className="rounded-full ">
        <OverlayIcon className={clsx('w-3.5 h-3.5', overlayClassName)} />
      </div>
    </div>
  </div>
);

const renderLegacyBody = (body: NotificationBodyElement[]) => {
  return body.map((element, i) => {
    const { type, value, link, extra } = element;
    const styles = extra ? JSON.parse(extra) : [];
    const className = clsx(
      styles.includes('bold') && 'font-bold',
      styles.includes('link') && 'text-blue-600 hover:underline',
      styles.includes('italic') && 'italic'
    );

    switch (type) {
      case 'link':
        return link ? (
          <Link key={i} href={link} className={className}>
            {value}
          </Link>
        ) : (
          <span key={i} className={className}>
            {value}
          </span>
        );
      case 'text':
        return (
          <span key={i} className={className}>
            {value}
          </span>
        );
      case 'break':
        return <br key={i} />;
      default:
        return null;
    }
  });
};

const NotificationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'IDENTITY_VERIFICATION_UPDATED':
      return <VerifiedBadge size="lg" />;
    case 'BOUNTY_FOR_YOU':
      return (
        <IconWithOverlay
          icon={ResearchCoinIcon}
          overlayIcon={Trophy}
          overlayClassName="text-gray-500"
        />
      );
    case 'PAPER_CLAIM_PAYOUT':
      return (
        <IconWithOverlay
          icon={FileTextIcon}
          className="text-gray-600"
          overlayIcon={Check}
          overlayClassName="text-green-500"
        />
      );
    case 'PUBLICATIONS_ADDED':
      return (
        <IconWithOverlay
          icon={FileUp}
          className="text-gray-600"
          overlayIcon={Plus}
          overlayClassName="text-gray-500"
        />
      );
    default:
      return null;
  }
};

const NotificationContent = ({ notification }: { notification: Notification }) => {
  const { type, body, actionUser, document, extra } = notification;

  const renderExtraInfo = () => {
    const hasRewardType = extra?.rewardType;
    const hasHub = extra?.hub;
    const hasAmount = extra?.amount;

    if (!hasRewardType && !hasHub && !hasAmount) return null;

    return (
      <div className="flex flex-wrap gap-2 pt-1">
        {hasRewardType && <RewardBadge type={extra.rewardType} />}
        {hasHub && <HubBadge name={extra.hub.name} />}
        {hasAmount && <RSCAmount amount={extra.amount} />}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {type === 'RSC_SUPPORT_ON_DIS' && Array.isArray(body) ? (
        renderLegacyBody(body)
      ) : type === 'IDENTITY_VERIFICATION_UPDATED' ? (
        'Congratulations! Your account has been verified by the ResearchHub team.'
      ) : type === 'PAPER_CLAIM_PAYOUT' ? (
        <span>Your claim has been approved and RSC has been awarded to your account.</span>
      ) : type === 'PUBLICATIONS_ADDED' ? (
        <>
          <span>New publications were added to your profile.</span>
          <Link href="/publications" className="text-blue-600 hover:underline block">
            View publications
          </Link>
        </>
      ) : type === 'BOUNTY_FOR_YOU' ? (
        <>
          <span>An earning opportunity is recommended for you based on your expertise</span>
          {document && (
            <Link href={`/paper/${document.id}`} className="text-blue-600 hover:underline block">
              {document.title}
            </Link>
          )}
        </>
      ) : (
        (body as string)
      )}
      {renderExtraInfo()}
    </div>
  );
};

export function NotificationItem({ notification }: NotificationItemProps) {
  const icon = NotificationIcon({ type: notification.type });

  return (
    <Link
      href={notification.navigationUrl || '#'}
      className={clsx(
        'block border-b border-gray-100 pb-8',
        notification.isRead ? 'bg-white' : 'bg-blue-50'
      )}
    >
      <div className="flex gap-5">
        <div className="flex-shrink-0">
          {icon ||
            (notification.actionUser && (
              <Avatar
                src={notification.actionUser.authorProfile?.profileImage}
                alt={notification.actionUser.fullName}
                size="md"
              />
            ))}
        </div>
        <div className="flex-grow min-w-0">
          <div className="text-sm text-gray-900">
            <NotificationContent notification={notification} />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {formatTimestamp(notification.createdDate.toISOString())}
          </div>
        </div>
      </div>
    </Link>
  );
}

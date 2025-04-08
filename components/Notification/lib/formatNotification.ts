import { Icon, type IconName } from '@/components/ui/icons/Icon';
import { Notification, Document } from '@/types/notification';

export interface NotificationTypeInfo {
  icon: IconName;
  useAvatar: boolean;
  useIconComponent: boolean;
  color: string;
}

const NOTIFICATION_TYPE_MAP: Record<string, NotificationTypeInfo> = {
  // Account notifications
  IDENTITY_VERIFICATION_UPDATED: {
    icon: 'verify1',
    useAvatar: false,
    useIconComponent: true,
    color: 'text-green-600',
  },
  ACCOUNT_VERIFIED: {
    icon: 'verify2',
    useAvatar: false,
    useIconComponent: true,
    color: 'text-green-600',
  },

  // Bounty-related notifications
  BOUNTY_FOR_YOU: {
    icon: 'earn1',
    useAvatar: false,
    useIconComponent: true,
    color: 'text-orange-600',
  },
  BOUNTY_EXPIRING_SOON: {
    icon: 'earn1',
    useAvatar: false,
    useIconComponent: true,
    color: 'text-yellow-600',
  },
  BOUNTY_HUB_EXPIRING_SOON: {
    icon: 'earn1',
    useAvatar: false,
    useIconComponent: true,
    color: 'text-yellow-600',
  },
  BOUNTY_PAYOUT: {
    icon: 'earn1',
    useAvatar: true,
    useIconComponent: true,
    color: 'text-green-600',
  },

  // Paper-related notifications
  PAPER_CLAIM_PAYOUT: {
    icon: 'createBounty',
    useAvatar: false,
    useIconComponent: true,
    color: 'text-green-600',
  },
  PAPER_CLAIMED: {
    icon: 'claimPaper',
    useAvatar: true,
    useIconComponent: true,
    color: 'text-blue-600',
  },
  PUBLICATIONS_ADDED: {
    icon: 'claimPaper',
    useAvatar: false,
    useIconComponent: true,
    color: 'text-blue-600',
  },

  // Comment and thread notifications
  COMMENT: {
    icon: 'comment',
    useAvatar: true,
    useIconComponent: true,
    color: 'text-blue-600',
  },
  COMMENT_ON_COMMENT: {
    icon: 'comment',
    useAvatar: true,
    useIconComponent: true,
    color: 'text-blue-600',
  },
  COMMENT_ON_THREAD: {
    icon: 'comment',
    useAvatar: true,
    useIconComponent: true,
    color: 'text-blue-600',
  },
  REPLY_ON_THREAD: {
    icon: 'comment',
    useAvatar: true,
    useIconComponent: true,
    color: 'text-blue-600',
  },
  COMMENT_USER_MENTION: {
    icon: 'profile',
    useAvatar: true,
    useIconComponent: true,
    color: 'text-purple-600',
  },
  THREAD_ON_DOC: {
    icon: 'comment',
    useAvatar: true,
    useIconComponent: true,
    color: 'text-blue-600',
  },

  // Financial notifications
  RSC_WITHDRAWAL_COMPLETE: {
    icon: 'wallet1',
    useAvatar: false,
    useIconComponent: true,
    color: 'text-green-600',
  },
  FUNDRAISE_PAYOUT: {
    icon: 'fundYourRsc2',
    useAvatar: false,
    useIconComponent: true,
    color: 'text-green-600',
  },
  RSC_SUPPORT_ON_DIS: {
    icon: 'fund',
    useAvatar: true,
    useIconComponent: true,
    color: 'text-green-600',
  },
  RSC_SUPPORT_ON_DOC: {
    icon: 'fund',
    useAvatar: true,
    useIconComponent: true,
    color: 'text-green-600',
  },
};

export function getNotificationInfo(notification: Notification): NotificationTypeInfo {
  return (
    NOTIFICATION_TYPE_MAP[notification.type] || {
      icon: 'notification',
      useAvatar: false,
      useIconComponent: true,
      color: 'text-gray-600',
    }
  );
}

function getDocumentTitle(documents: Document | Document[]): string {
  if (Array.isArray(documents)) {
    return documents[0]?.title || documents[0]?.paper_title || '';
  }
  return documents.title || documents.paper_title || '';
}

export function formatNotificationMessage(notification: Notification): string {
  const { type, action_user, unified_document } = notification;

  const userName = action_user.fullName;
  const docTitle = unified_document?.documents ? getDocumentTitle(unified_document.documents) : '';
  const truncatedTitle = docTitle.length > 60 ? `${docTitle.slice(0, 60)}...` : docTitle;

  switch (type) {
    // Financial notifications
    case 'RSC_WITHDRAWAL_COMPLETE':
      return 'Your RSC withdrawal has been completed';

    case 'BOUNTY_PAYOUT':
      return `${userName} received a bounty payout for "${truncatedTitle}"`;

    case 'BOUNTY_FOR_YOU':
      const amount = notification.extra?.amount
        ? parseFloat(notification.extra.amount).toLocaleString()
        : '';
      const hubName = notification.extra?.hub_details
        ? JSON.parse(notification.extra.hub_details).name
        : '';
      return `${amount} RSC bounty available in ${hubName} hub`;

    case 'BOUNTY_EXPIRING_SOON':
    case 'BOUNTY_HUB_EXPIRING_SOON':
      return `A bounty for "${truncatedTitle}" is expiring soon`;

    // Paper-related notifications
    case 'PAPER_CLAIM_PAYOUT':
      return `Your paper claim for "${truncatedTitle}" has been approved`;

    case 'PAPER_CLAIMED':
      return `${userName} claimed "${truncatedTitle}"`;

    case 'PUBLICATIONS_ADDED':
      return 'New publications were added to your profile';

    // Comment notifications
    case 'COMMENT':
      return `${userName} commented on "${truncatedTitle}"`;

    case 'COMMENT_ON_COMMENT':
      return `${userName} replied to your comment on "${truncatedTitle}"`;

    case 'COMMENT_ON_THREAD':
    case 'REPLY_ON_THREAD':
      return `${userName} replied to a thread on "${truncatedTitle}"`;

    case 'COMMENT_USER_MENTION':
      return `${userName} mentioned you in a comment on "${truncatedTitle}"`;

    case 'THREAD_ON_DOC':
      return `${userName} started a thread on "${truncatedTitle}"`;

    // Account notifications
    case 'IDENTITY_VERIFICATION_UPDATED':
    case 'ACCOUNT_VERIFIED':
      return 'Your account has been verified';

    // RSC Support notifications
    case 'RSC_SUPPORT_ON_DIS':
    case 'RSC_SUPPORT_ON_DOC':
      return `${userName} supported "${truncatedTitle}" with RSC`;

    // Fundraising notifications
    case 'FUNDRAISE_PAYOUT':
      return 'Your fundraising payout has been processed';

    // Moderation notifications
    case 'FLAGGED_CONTENT_VERDICT':
      return 'A moderation decision has been made on your reported content';

    default:
      console.warn(`Unhandled notification type: ${type}`);
      return `${type.split('_').join(' ').toLowerCase()}`;
  }
}

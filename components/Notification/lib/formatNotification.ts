import { Icon, type IconName } from '@/components/ui/icons/Icon';
import { Notification, Document } from '@/types/notification';

export interface NotificationTypeInfo {
  icon: IconName;
  useAvatar: boolean;
}

export interface HubDetails {
  name: string;
  slug: string;
  imageUrl?: string;
}

const NOTIFICATION_TYPE_MAP: Record<string, NotificationTypeInfo> = {
  // Account notifications
  IDENTITY_VERIFICATION_UPDATED: {
    icon: 'verify1',
    useAvatar: false,
  },
  ACCOUNT_VERIFIED: {
    icon: 'verify2',
    useAvatar: false,
  },

  // Bounty-related notifications
  BOUNTY_FOR_YOU: {
    icon: 'earn1',
    useAvatar: false,
  },
  BOUNTY_EXPIRING_SOON: {
    icon: 'earn1',
    useAvatar: false,
  },
  BOUNTY_HUB_EXPIRING_SOON: {
    icon: 'earn1',
    useAvatar: false,
  },
  BOUNTY_PAYOUT: {
    icon: 'earn1',
    useAvatar: true,
  },

  // Paper-related notifications
  PAPER_CLAIM_PAYOUT: {
    icon: 'createBounty',
    useAvatar: false,
  },
  PAPER_CLAIMED: {
    icon: 'claimPaper',
    useAvatar: true,
  },
  PUBLICATIONS_ADDED: {
    icon: 'claimPaper',
    useAvatar: false,
  },

  // Comment and thread notifications
  COMMENT: {
    icon: 'comment',
    useAvatar: true,
  },
  COMMENT_ON_COMMENT: {
    icon: 'comment',
    useAvatar: true,
  },
  COMMENT_ON_THREAD: {
    icon: 'comment',
    useAvatar: true,
  },
  REPLY_ON_THREAD: {
    icon: 'comment',
    useAvatar: true,
  },
  COMMENT_USER_MENTION: {
    icon: 'profile',
    useAvatar: true,
  },
  THREAD_ON_DOC: {
    icon: 'comment',
    useAvatar: true,
  },

  // Financial notifications
  RSC_WITHDRAWAL_COMPLETE: {
    icon: 'wallet1',
    useAvatar: false,
  },
  FUNDRAISE_PAYOUT: {
    icon: 'fundYourRsc2',
    useAvatar: false,
  },
  RSC_SUPPORT_ON_DIS: {
    icon: 'fund',
    useAvatar: true,
  },
  RSC_SUPPORT_ON_DOC: {
    icon: 'fund',
    useAvatar: true,
  },
};

export function getNotificationInfo(notification: Notification): NotificationTypeInfo {
  return (
    NOTIFICATION_TYPE_MAP[notification.type] || {
      icon: 'notification',
      useAvatar: false,
    }
  );
}

function getDocumentTitle(documents: Document | Document[]): string {
  if (Array.isArray(documents)) {
    return documents[0]?.title || documents[0]?.paper_title || '';
  }
  return documents.title || documents.paper_title || '';
}

export function getHubDetailsFromNotification(notification: Notification): HubDetails | null {
  // For hub-related notifications, extract hub details
  if (notification.type === 'BOUNTY_FOR_YOU' && notification.extra?.hub_details) {
    try {
      const hubDetails = JSON.parse(notification.extra.hub_details);
      return {
        name: hubDetails.name || '',
        slug: hubDetails.slug || '',
        imageUrl: hubDetails.imageUrl || hubDetails.image_url || undefined,
      };
    } catch (error) {
      console.error('Failed to parse hub details', error);
      return null;
    }
  }
  return null;
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
      // For the plain text message format, still include the hub name in the text
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

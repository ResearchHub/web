import { Icon, type IconName } from '@/components/ui/icons/Icon';
import { Notification } from '@/types/notification';

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

export function getHubDetailsFromNotification(notification: Notification): HubDetails | null {
  // For hub-related notifications, extract hub details
  if (notification.type === 'BOUNTY_FOR_YOU' && notification.extra?.hub) {
    try {
      return {
        name: notification.extra.hub.name || '',
        slug: notification.extra.hub.slug || '',
        imageUrl: undefined,
      };
    } catch (error) {
      console.error('Failed to parse hub details', error);
      return null;
    }
  }
  return null;
}

/**
 * Transform ResearchHub URLs to relative paths and convert #comments to /conversation
 * Examples:
 * - https://www.researchhub.com/paper/8086044/title#comments → /paper/8086044/title/conversation
 * - https://www.staging.researchhub.com/post/272/03-25-24-test-post#comments → /post/272/03-25-24-test-post/conversation
 * - http://localhost:3000/paper/4/alzheimeralzheimer#comments → /paper/4/alzheimeralzheimer/conversation
 * - https://xyz-researchhub.vercel.app/paper/9348486/title → /paper/9348486/title
 */
export function formatNavigationUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;

  try {
    // Strip the hostname and protocol using regex - handle hostnames with ports like localhost:3000
    let relativePath = url.replace(/^(https?:\/\/)?([^\/]+(:\d+)?)/, '');

    // Ensure the path starts with a forward slash
    if (!relativePath.startsWith('/')) {
      relativePath = '/' + relativePath;
    }

    relativePath = relativePath.replace(/#comments$/, '/conversation');

    if (relativePath.length > 1 && relativePath.endsWith('/')) {
      relativePath = relativePath.slice(0, -1);
    }

    return relativePath;
  } catch (error) {
    console.error('Error formatting navigation URL:', error);
    return url;
  }
}

export function formatNotificationMessage(notification: Notification): string {
  const { type, actionUser, work } = notification;

  const userName = actionUser ? actionUser.fullName : 'A user';
  const docTitle = work?.title || 'an item';
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
      const hubName = notification.extra?.hub?.name || '';
      return `${amount} RSC bounty available for "${truncatedTitle}"${hubName ? ` in ${hubName}` : ''}`;

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

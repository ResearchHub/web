import { Icon, type IconName } from '@/components/ui/icons/Icon';
import { Notification } from '@/types/notification';
import { formatUsdValue } from '@/utils/number';

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
    icon: 'verify2',
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
    icon: 'openGrant',
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
  FLAGGED_CONTENT_VERDICT: {
    icon: 'report',
    useAvatar: false,
  },

  // Paper-related notifications
  PAPER_CLAIM_PAYOUT: {
    icon: 'claimPaper',
    useAvatar: false,
  },
  PAPER_CLAIMED: {
    icon: 'submit2',
    useAvatar: false,
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
  if (notification.extra?.hub) {
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
 * Extract RSC amount from notification if available
 */
export function getRSCAmountFromNotification(notification: Notification): number | null {
  if (notification.extra?.amount) {
    try {
      return parseFloat(notification.extra.amount);
    } catch (error) {
      console.error('Failed to parse RSC amount', error);
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
 *
 * For notifications with null/empty URLs:
 * - Creates relative paper URLs for any notification with a paper ID
 * - Adds /bounties suffix specifically for BOUNTY_FOR_YOU notifications
 */
export function formatNavigationUrl(notification: Notification): string | undefined {
  const url = notification.navigationUrl;

  // Handle null/empty URL when we have document data
  if ((!url || url.trim() === '') && notification.work?.id) {
    const paperId = notification.work.id;
    let basePath = notification.work.slug
      ? `/paper/${paperId}/${notification.work.slug}`
      : `/paper/${paperId}`;

    if (
      notification.type === 'BOUNTY_FOR_YOU' ||
      notification.type === 'BOUNTY_EXPIRING_SOON' ||
      notification.type === 'BOUNTY_HUB_EXPIRING_SOON' ||
      notification.type === 'BOUNTY_PAYOUT'
    ) {
      basePath += '/bounties';
    }

    return basePath;
  }

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

function getBountyTypeAction(bountyType: string): string {
  switch (bountyType?.toUpperCase()) {
    case 'REVIEW':
      return 'peer reviewing';
    case 'ANSWER':
      return 'answering a question on';
    default:
      return 'helping with';
  }
}

/**
 * Extract RSC amount from notification body text
 * Looks for text segments with "rsc_color" in extra and parses the RSC amount
 */
function getRSCFromBody(
  body: Array<{ type: string; value: string; extra?: string }>
): string | null {
  const rscSegment = body.find(
    (segment) =>
      segment.extra && segment.extra.includes('rsc_color') && segment.value.includes('RSC')
  );

  if (rscSegment) {
    const match = rscSegment.value.match(/(\d+(?:\.\d+)?)\s*RSC/);
    return match ? match[1] : null;
  }

  return null;
}

export function formatNotificationMessage(
  notification: Notification,
  exchangeRate: number = 0
): string {
  const { type, actionUser, work } = notification;

  const userName = actionUser ? actionUser.fullName : 'A user';
  const docTitle = work?.title || 'an item';
  const truncatedTitle = docTitle.length > 60 ? `${docTitle.slice(0, 60)}...` : docTitle;

  switch (type) {
    // Financial notifications
    case 'RSC_WITHDRAWAL_COMPLETE':
      return 'Your RSC withdrawal has been completed';

    case 'BOUNTY_PAYOUT':
      return `${userName} awarded you RSC for your work on "${truncatedTitle}"`;

    case 'BOUNTY_FOR_YOU': {
      const amount = notification.extra?.amount || '0';
      const bountyType = notification.extra?.bounty_type || '';
      const bountyTypeAction = getBountyTypeAction(bountyType);
      const usdValue = formatUsdValue(amount, exchangeRate);
      return `Your expertise is needed! Earn ${usdValue} for ${bountyTypeAction} "${truncatedTitle}"`;
    }

    case 'BOUNTY_EXPIRING_SOON':
      return `Your bounty on "${truncatedTitle}" is expiring soon! Please award the best answer`;

    case 'BOUNTY_HUB_EXPIRING_SOON':
      return `A bounty on "${truncatedTitle}" is expiring soon `;

    // Paper-related notifications
    case 'PAPER_CLAIM_PAYOUT':
      return `Your paper claim for "${truncatedTitle}" has been approved`;

    case 'PAPER_CLAIMED':
      return `Your paper claim for "${truncatedTitle} has been submitted`;

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
      return 'Your ID verification status has been updated';

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

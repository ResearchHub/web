import { type IconName } from '@/components/ui/icons/Icon';
import { Notification } from '@/types/notification';
import { formatCurrencyAmount, type CurrencyAmount } from '@/utils/currency';
import { formatRSC } from '@/utils/number';
import { buildWorkUrl } from '@/utils/url';
import { stripHtml, truncateText } from '@/utils/stringUtils';

export interface NotificationTypeInfo {
  icon: IconName;
  useAvatar: boolean;
  title: string;
}

const PROPOSAL_UPDATE_REWARD_USD = 50;

const NOTIFICATION_TYPE_MAP = {
  // Account notifications
  IDENTITY_VERIFICATION_UPDATED: {
    icon: 'verify2',
    useAvatar: false,
    title: 'Verification updated',
  },
  ACCOUNT_VERIFIED: {
    icon: 'verify2',
    useAvatar: false,
    title: 'Account verified',
  },

  // Bounty-related notifications
  BOUNTY_FOR_YOU: {
    icon: 'earn1',
    useAvatar: false,
    title: 'Bounty opportunity',
  },
  BOUNTY_EXPIRING_SOON: {
    icon: 'openGrant',
    useAvatar: false,
    title: 'Bounty expiring soon',
  },
  BOUNTY_ENTERED_ASSESSMENT: {
    icon: 'openGrant',
    useAvatar: false,
    title: 'Bounty in assessment',
  },
  BOUNTY_ASSESSMENT_EXPIRING_SOON: {
    icon: 'openGrant',
    useAvatar: false,
    title: 'Bounty assessment expiring',
  },
  BOUNTY_SOLUTION_IN_ASSESSMENT: {
    icon: 'openGrant',
    useAvatar: false,
    title: 'Bounty solution in review',
  },
  BOUNTY_HUB_EXPIRING_SOON: {
    icon: 'earn1',
    useAvatar: false,
    title: 'Bounty expiring soon',
  },
  BOUNTY_PAYOUT: {
    icon: 'earn1',
    useAvatar: false,
    title: 'Bounty payout',
  },
  FLAGGED_CONTENT_VERDICT: {
    icon: 'report',
    useAvatar: false,
    title: 'Moderation decision',
  },

  // Paper-related notifications
  PAPER_CLAIM_PAYOUT: {
    icon: 'claimPaper',
    useAvatar: false,
    title: 'Paper claim approved',
  },
  PAPER_CLAIMED: {
    icon: 'submit2',
    useAvatar: false,
    title: 'Paper claim submitted',
  },
  PUBLICATIONS_ADDED: {
    icon: 'claimPaper',
    useAvatar: false,
    title: 'New publications',
  },

  // Comment and thread notifications
  COMMENT: {
    icon: 'comment',
    useAvatar: true,
    title: 'New comment',
  },
  COMMENT_ON_COMMENT: {
    icon: 'comment',
    useAvatar: true,
    title: 'New reply',
  },
  COMMENT_ON_THREAD: {
    icon: 'comment',
    useAvatar: true,
    title: 'New thread reply',
  },
  REPLY_ON_THREAD: {
    icon: 'comment',
    useAvatar: true,
    title: 'New thread reply',
  },
  COMMENT_USER_MENTION: {
    icon: 'profile',
    useAvatar: true,
    title: 'You were mentioned',
  },
  THREAD_ON_DOC: {
    icon: 'comment',
    useAvatar: true,
    title: 'New thread',
  },

  // Financial notifications
  RSC_WITHDRAWAL_COMPLETE: {
    icon: 'wallet1',
    useAvatar: false,
    title: 'Withdrawal complete',
  },
  FUNDRAISE_PAYOUT: {
    icon: 'fundYourRsc2',
    useAvatar: false,
    title: 'Fundraise payout',
  },
  FUNDRAISE_CONTRIBUTION: {
    icon: 'fund',
    useAvatar: true,
    title: 'New contribution',
  },
  FUNDING_POOL_CONTRIBUTION: {
    icon: 'fund',
    useAvatar: true,
    title: 'New contribution',
  },
  RSC_SUPPORT_ON_DIS: {
    icon: 'fund',
    useAvatar: true,
    title: 'Comment supported',
  },
  RSC_SUPPORT_ON_DOC: {
    icon: 'fund',
    useAvatar: true,
    title: 'Peer review supported',
  },

  // Proposal notifications
  PREREGISTRATION_UPDATE: {
    icon: 'edit',
    useAvatar: true,
    title: 'Proposal update',
  },
  PREREGISTRATION_UPDATE_REMINDER: {
    icon: 'earn1',
    useAvatar: false,
    title: 'Proposal update reminder',
  },

  // Grant moderation notifications
  GRANT_APPROVED: {
    icon: 'openGrant',
    useAvatar: false,
    title: 'RFP approved',
  },
  GRANT_DECLINED: {
    icon: 'openGrant',
    useAvatar: false,
    title: 'RFP declined',
  },

  // RFP owner notifications
  GRANT_APPLICATION_SUBMITTED: {
    icon: 'openGrant',
    useAvatar: true,
    title: 'New proposal submitted',
  },
  PROPOSAL_PEER_REVIEW: {
    icon: 'openGrant',
    useAvatar: true,
    title: 'Peer review on proposal',
  },

  // Content moderation notifications (papers, posts, proposals)
  CONTENT_APPROVED: {
    icon: 'verify2',
    useAvatar: false,
    title: 'Content approved',
  },
  CONTENT_DECLINED: {
    icon: 'report',
    useAvatar: false,
    title: 'Content declined',
  },

  // RSC yield notifications
  RSC_YIELD_OPT_IN: {
    icon: 'fundYourRsc2',
    useAvatar: false,
    title: 'Earn yield on RSC',
  },

  // Funding credits reminder
  FUNDING_CREDITS_REMINDER: {
    icon: 'fundYourRsc2',
    useAvatar: false,
    title: 'You earned funding credits!',
  },
} satisfies Record<string, NotificationTypeInfo>;

const DEFAULT_NOTIFICATION_INFO: NotificationTypeInfo = {
  icon: 'notification',
  useAvatar: false,
  title: 'Notification',
};

/** Color family a notification is drawn in: accent bar and icon tint. */
export type NotificationTone = 'blue' | 'green' | 'amber' | 'violet' | 'red';

const NOTIFICATION_TONE_BY_TYPE: Partial<
  Record<keyof typeof NOTIFICATION_TYPE_MAP, NotificationTone>
> = {
  BOUNTY_PAYOUT: 'green',
  RSC_WITHDRAWAL_COMPLETE: 'green',
  FUNDRAISE_PAYOUT: 'green',
  FUNDRAISE_CONTRIBUTION: 'green',
  FUNDING_POOL_CONTRIBUTION: 'green',
  RSC_SUPPORT_ON_DIS: 'green',
  RSC_SUPPORT_ON_DOC: 'green',
  RSC_YIELD_OPT_IN: 'green',
  FUNDING_CREDITS_REMINDER: 'green',

  BOUNTY_FOR_YOU: 'amber',
  BOUNTY_EXPIRING_SOON: 'amber',
  BOUNTY_ENTERED_ASSESSMENT: 'amber',
  BOUNTY_ASSESSMENT_EXPIRING_SOON: 'amber',
  BOUNTY_SOLUTION_IN_ASSESSMENT: 'amber',
  BOUNTY_HUB_EXPIRING_SOON: 'amber',
  PREREGISTRATION_UPDATE_REMINDER: 'amber',

  GRANT_APPROVED: 'violet',
  GRANT_APPLICATION_SUBMITTED: 'violet',
  PROPOSAL_PEER_REVIEW: 'violet',

  GRANT_DECLINED: 'red',
  CONTENT_DECLINED: 'red',
  FLAGGED_CONTENT_VERDICT: 'red',
};

export function getNotificationTone(notification: Notification): NotificationTone {
  return (
    NOTIFICATION_TONE_BY_TYPE[notification.type as keyof typeof NOTIFICATION_TYPE_MAP] ?? 'blue'
  );
}

/** Label for the call to action on unread notification cards, e.g. "View comment". */
export function getNotificationActionLabel(notification: Notification): string {
  switch (notification.type) {
    case 'COMMENT':
    case 'COMMENT_ON_COMMENT':
    case 'COMMENT_ON_THREAD':
    case 'REPLY_ON_THREAD':
    case 'COMMENT_USER_MENTION':
    case 'THREAD_ON_DOC':
    case 'RSC_SUPPORT_ON_DIS':
      return 'View comment';
    case 'RSC_SUPPORT_ON_DOC':
      return isPeerReviewTip(notification) ? 'View peer review' : 'View post';
    case 'PROPOSAL_PEER_REVIEW':
      return 'View peer review';
    case 'PREREGISTRATION_UPDATE':
      return 'View update';
    case 'PREREGISTRATION_UPDATE_REMINDER':
      return 'Post an update';
    case 'GRANT_APPROVED':
      return 'View RFP';
    case 'GRANT_APPLICATION_SUBMITTED':
      return 'View proposal';
    case 'RSC_YIELD_OPT_IN':
      return 'Start earning';
    case 'FUNDING_CREDITS_REMINDER':
      return 'Fund proposals';
    case 'PUBLICATIONS_ADDED':
      return 'View publications';
    default:
      return notification.work ? `View ${getWorkTypeLabel(notification.work.contentType)}` : 'View';
  }
}

function formatTypeFallbackTitle(type: string): string {
  return type
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

function lookupNotificationTypeInfo(type: string): NotificationTypeInfo | undefined {
  if (type in NOTIFICATION_TYPE_MAP) {
    return NOTIFICATION_TYPE_MAP[type as keyof typeof NOTIFICATION_TYPE_MAP];
  }
  return undefined;
}

export function getNotificationTitle(notification: Notification): string {
  if (notification.type === 'RSC_SUPPORT_ON_DOC' && !isPeerReviewTip(notification)) {
    return 'Post supported';
  }
  return (
    lookupNotificationTypeInfo(notification.type)?.title ??
    formatTypeFallbackTitle(notification.type)
  );
}

export function getNotificationInfo(notification: Notification): NotificationTypeInfo {
  return lookupNotificationTypeInfo(notification.type) ?? DEFAULT_NOTIFICATION_INFO;
}

/**
 * Extract RSC amount from notification if available
 */
export function getRSCAmountFromNotification(notification: Notification): number | null {
  if (notification.extra?.amount) {
    const amount = parseFloat(notification.extra.amount);
    if (!isNaN(amount)) return amount;
  }

  // If no amount in extra, try to parse from notification body
  if (notification.body && Array.isArray(notification.body)) {
    const bodyText = notification.body.map((segment) => segment.value).join('');

    // Match numbers with optional decimal places followed by RSC
    const match = bodyText.match(/(\d+(?:\.\d+)?)\s*RSC/);
    if (match?.[1]) {
      const amount = parseFloat(match[1]);
      if (!isNaN(amount)) return amount;
    }
  }

  return null;
}

/** Return the notification's RSC amount, if it has one. */
export function getNotificationAmount(notification: Notification): CurrencyAmount | null {
  const amount = getRSCAmountFromNotification(notification);
  return amount ? { amount, currency: 'RSC' } : null;
}

/**
 * `RSC_SUPPORT_ON_DOC` used to mean a tip on a post; it now means a tip on a peer review.
 * Only peer review tips link to the reviews tab.
 */
function isPeerReviewTip(notification: Notification): boolean {
  return (
    notification.type === 'RSC_SUPPORT_ON_DOC' &&
    !!notification.navigationUrl?.replace(/\/$/, '').endsWith('/reviews')
  );
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
 * - Builds a path with {@link buildWorkUrl} using work.contentType (from API document_type) or paper as default
 * - Adds /bounties tab for selected bounty notification types
 */
export function formatNavigationUrl(notification: Notification): string | undefined {
  if (
    (notification.type === 'PREREGISTRATION_UPDATE' ||
      notification.type === 'PREREGISTRATION_UPDATE_REMINDER') &&
    notification.work
  ) {
    const { id, slug } = notification.work;
    if (id && slug) {
      return `/proposal/${id}/${slug}/updates`;
    }
  }

  if (notification.type === 'GRANT_DECLINED' || notification.type === 'CONTENT_DECLINED') {
    return undefined;
  }

  if (notification.type === 'RSC_YIELD_OPT_IN') {
    return '/researchcoin';
  }

  if (notification.type === 'FUNDING_CREDITS_REMINDER') {
    return '/fund/proposals';
  }

  if (notification.type === 'GRANT_APPROVED' && notification.work) {
    const { id, slug } = notification.work;
    if (id && slug) {
      return `/grant/${id}/${slug}`;
    }
  }

  if (notification.type === 'CONTENT_APPROVED' && notification.work?.id) {
    return buildWorkUrl({
      id: notification.work.id,
      slug: notification.work.slug,
      contentType: notification.work.contentType ?? 'paper',
    });
  }

  const url = notification.navigationUrl;

  // Handle null/empty URL when we have document data
  if ((!url || url.trim() === '') && notification.work?.id) {
    const contentType = notification.work.contentType ?? 'paper';
    const bountyTabTypes = [
      'BOUNTY_FOR_YOU',
      'BOUNTY_EXPIRING_SOON',
      'BOUNTY_HUB_EXPIRING_SOON',
      'BOUNTY_PAYOUT',
    ] as const;
    const tab = bountyTabTypes.includes(notification.type as (typeof bountyTabTypes)[number])
      ? 'bounties'
      : undefined;

    return buildWorkUrl({
      id: notification.work.id,
      slug: notification.work.slug,
      contentType,
      tab,
    });
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

function getWorkTypeLabel(contentType?: string): string {
  switch (contentType) {
    case 'preregistration':
      return 'proposal';
    case 'paper':
      return 'paper';
    case 'post':
      return 'post';
    default:
      return 'submission';
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

/** A notification message, split around the amount so it can be styled separately. */
export interface NotificationMessage {
  before: string;
  amount: string | null;
  after: string;
}

/** Marks where the amount goes in a message; message text can't otherwise contain it. */
const AMOUNT_SLOT = '\u0000';

/**
 * Build the notification message. Types whose sentence names the amount place it
 * inline; any other notification with an amount ends in "for <amount>".
 */
export function formatNotificationMessage(
  notification: Notification,
  exchangeRate: number = 0,
  showUSD: boolean = true
): NotificationMessage {
  const rawAmount = getNotificationAmount(notification);
  const amount = rawAmount
    ? formatCurrencyAmount({ ...rawAmount, showUSD, exchangeRate, shorten: true })
    : null;

  let text = buildMessageText(notification, exchangeRate, showUSD, !!amount);
  if (amount && !text.includes(AMOUNT_SLOT)) {
    text = `${text} for ${AMOUNT_SLOT}`;
  }

  const [before, after = ''] = text.split(AMOUNT_SLOT);
  return { before, amount, after };
}

function buildMessageText(
  notification: Notification,
  exchangeRate: number,
  showUSD: boolean,
  hasAmount: boolean
): string {
  const { type, actionUser, work } = notification;

  const userName = actionUser ? actionUser.fullName : 'A user';
  const truncatedTitle = truncateText(stripHtml(work?.title || 'an item'), 60).replace(
    /\u0000/g,
    ''
  );
  const bounty = hasAmount ? `${AMOUNT_SLOT} bounty` : 'bounty';

  switch (type) {
    // Financial notifications
    case 'RSC_WITHDRAWAL_COMPLETE':
      return hasAmount
        ? `Your withdrawal of ${AMOUNT_SLOT} has been completed`
        : 'Your withdrawal has been completed';

    case 'BOUNTY_PAYOUT':
      return `${userName} awarded you ${hasAmount ? AMOUNT_SLOT : 'a bounty'} for your thread in "${truncatedTitle}"`;

    case 'BOUNTY_FOR_YOU': {
      const bountyType = notification.extra?.bounty_type || '';
      const bountyTypeAction = getBountyTypeAction(bountyType);
      return `Your expertise is needed! Earn ${hasAmount ? AMOUNT_SLOT : 'a bounty'} for ${bountyTypeAction} "${truncatedTitle}"`;
    }

    case 'BOUNTY_EXPIRING_SOON':
      return `Your ${bounty} on "${truncatedTitle}" is expiring soon! Please award the best answer`;

    case 'BOUNTY_ENTERED_ASSESSMENT':
      return `Your ${bounty} on "${truncatedTitle}" has entered assessment`;

    case 'BOUNTY_ASSESSMENT_EXPIRING_SOON':
      return `Your ${bounty} on "${truncatedTitle}" is expiring soon! Please award the best answer`;

    case 'BOUNTY_SOLUTION_IN_ASSESSMENT':
      return `Your solution to the ${bounty} on "${truncatedTitle}" is in assessment`;

    case 'BOUNTY_HUB_EXPIRING_SOON':
      return hasAmount
        ? `A bounty of ${AMOUNT_SLOT} on "${truncatedTitle}" is expiring soon`
        : `A bounty on "${truncatedTitle}" is expiring soon`;

    // Paper-related notifications
    case 'PAPER_CLAIM_PAYOUT':
      return hasAmount
        ? `Your paper claim for "${truncatedTitle}" has been approved and you earned ${AMOUNT_SLOT}`
        : `Your paper claim for "${truncatedTitle}" has been approved`;

    case 'PAPER_CLAIMED':
      return `Your paper claim for "${truncatedTitle}" has been submitted`;

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
      return `${userName} supported your comment on "${truncatedTitle}"`;

    case 'RSC_SUPPORT_ON_DOC':
      return isPeerReviewTip(notification)
        ? `${userName} supported your peer review on "${truncatedTitle}"`
        : `${userName} supported your post "${truncatedTitle}"`;

    // Fundraising notifications
    case 'FUNDRAISE_CONTRIBUTION':
    case 'FUNDING_POOL_CONTRIBUTION': {
      const target = type === 'FUNDRAISE_CONTRIBUTION' ? 'proposal' : 'RFP';
      return hasAmount
        ? `${userName} contributed ${AMOUNT_SLOT} to your ${target} "${truncatedTitle}"`
        : `${userName} submitted a contribution to your ${target} "${truncatedTitle}"`;
    }

    case 'FUNDRAISE_PAYOUT':
      return hasAmount
        ? `Your fundraise for "${truncatedTitle}" has been fulfilled and ${AMOUNT_SLOT} was paid out to you`
        : `Your fundraise for "${truncatedTitle}" has been fulfilled and paid out to you`;

    // Moderation notifications
    case 'FLAGGED_CONTENT_VERDICT':
      return 'A moderation decision has been made on your reported content';

    case 'PREREGISTRATION_UPDATE':
      return `${userName} made an update to "${truncatedTitle}"`;

    case 'PREREGISTRATION_UPDATE_REMINDER': {
      const formattedAmount =
        showUSD || exchangeRate <= 0
          ? `$${PROPOSAL_UPDATE_REWARD_USD} USD`
          : `${formatRSC({ amount: PROPOSAL_UPDATE_REWARD_USD / exchangeRate, round: true })} RSC`;
      return `Share a meaningful update on your proposal "${truncatedTitle}" and earn ${formattedAmount}`;
    }

    // Grant moderation notifications
    case 'GRANT_APPROVED':
      return `Your RFP has been approved.`;

    case 'GRANT_DECLINED':
      return `Your RFP has been declined.`;

    // RFP owner notifications
    case 'GRANT_APPLICATION_SUBMITTED':
      return `${userName} submitted a new proposal to your RFP: "${truncatedTitle}"`;

    case 'PROPOSAL_PEER_REVIEW':
      return `${userName} peer reviewed a proposal linked to your RFP`;

    // Content moderation notifications (papers, posts, proposals)
    case 'CONTENT_APPROVED':
      return `Your ${getWorkTypeLabel(work?.contentType)} "${truncatedTitle}" has been approved.`;

    case 'CONTENT_DECLINED':
      return `Your ${getWorkTypeLabel(work?.contentType)} "${truncatedTitle}" has been declined.`;

    case 'RSC_YIELD_OPT_IN':
      return 'Start earning yield today by opting in to "Stake" via the My ResearchCoin page';

    case 'FUNDING_CREDITS_REMINDER':
      return 'You have unspent funding credits. Use them to fund science.';

    default:
      console.warn(`Unhandled notification type: ${type}`);
      return `${type.split('_').join(' ').toLowerCase()}`;
  }
}

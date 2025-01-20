import {
  ArrowBigUpDash,
  ArrowUpFromLine,
  HandCoins,
  ArrowDownToLine,
  Trophy,
  Percent,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react';
import { formatUsdValue, formatRSC } from '@/utils/number';
import { formatTimestamp } from '@/utils/date';
import type { TransactionAPIRequest } from '@/services/types/transaction.dto';

export interface TransactionTypeInfo {
  label: string;
  icon: LucideIcon;
}

// Move distribution types mapping to view layer
export const DISTRIBUTION_TYPES = {
  EDITOR_BOUNTY: 'Editor Bounty',
  PAPER_UPVOTED: 'Upvote: Paper',
  COMMENT_UPVOTED: 'Upvote: Comment',
  RESEARCH_UPVOTED: 'Upvote: Research',
  PURCHASING_POWER: 'Purchasing Power',
  RhCOMMENT: 'Comment',
  STORED_REWARD: 'Stored Reward',
  THREAD_REWARD: 'Thread Reward',
  PAPER_REWARD: 'Paper Reward',
  EDITOR_CONTRIBUTION: 'Editor Contribution',
  COMMENT_REWARD: 'Comment Reward',
  RhCOMMENT_UPVOTED: 'Upvote: Comment',
  RESEARCHHUB_POST_UPVOTED: 'Upvote: Post',
  MOD_PAYMENT: 'Moderator Payment',
  REPLY_COMMENT: 'Reply Comment',
  PURCHASE: 'Purchase',
  PURCHASE_BOOST: 'Tip',
  PURCHASE_TIP: 'Tip',
  SUPPORT_RH_FEE: 'Support RH Fee',
  BOUNTY: 'Bounty',
  BOUNTY_FEE: 'Bounty Fee',
  WITHDRAWAL: 'Withdrawal',
  DEPOSIT: 'Deposit',
} as const;

// Move content type mapping to view layer
export const CONTENT_TYPE_MAP: Record<number, TransactionTypeInfo> = {
  27: { label: 'Distribution', icon: ArrowBigUpDash },
  30: { label: 'Withdrawal', icon: ArrowUpFromLine },
  55: { label: 'Purchase', icon: HandCoins },
  61: { label: 'Support', icon: HandCoins },
  89: { label: 'Deposit', icon: ArrowDownToLine },
  108: { label: 'Bounty', icon: Trophy },
  110: { label: 'Bounty Fee', icon: Percent },
  127: { label: 'Support Fee', icon: Percent },
  144: { label: 'Paper Reward', icon: Trophy },
  154: { label: 'Payment', icon: HandCoins },
};

export function getTransactionTypeInfo(tx: TransactionAPIRequest): TransactionTypeInfo {
  // First check if we have source type information
  if (tx.source?.purchase_type) {
    const sourceType = tx.source.purchase_type;
    const label = DISTRIBUTION_TYPES[sourceType as keyof typeof DISTRIBUTION_TYPES];
    if (label) {
      return {
        label,
        icon:
          sourceType.includes('BOOST') || sourceType.includes('TIP')
            ? HandCoins
            : sourceType === 'BOUNTY'
              ? Trophy
              : ArrowBigUpDash,
      };
    }
  }

  // Then check content type map
  if (tx.content_type && CONTENT_TYPE_MAP[tx.content_type]) {
    return CONTENT_TYPE_MAP[tx.content_type];
  }

  // Finally fall back to readable content type or unknown
  return {
    label:
      tx.readable_content_type?.charAt(0).toUpperCase() + tx.readable_content_type?.slice(1) ||
      'Unknown TX',
    icon: HelpCircle,
  };
}

export function formatTransaction(tx: TransactionAPIRequest, exchangeRate: number) {
  const amount = parseFloat(tx.amount);
  const isPositive = amount >= 0;
  const formattedAmount = formatRSC({ amount: Math.abs(amount) });

  return {
    ...tx,
    formattedAmount: `${isPositive ? '+' : '-'}${formattedAmount} RSC`,
    formattedUsdValue: formatUsdValue(tx.amount, exchangeRate),
    formattedDate: formatTimestamp(tx.created_date),
    typeInfo: getTransactionTypeInfo(tx),
    isPositive,
  };
}

export function formatBalance(balance: number, exchangeRate: number) {
  return {
    raw: balance,
    formatted: formatRSC({ amount: balance }),
    formattedUsd: formatUsdValue(balance.toString(), exchangeRate),
  };
}

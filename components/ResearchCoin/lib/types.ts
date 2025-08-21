import { formatUsdValue, formatRSC } from '@/utils/number';
import { formatTimestamp } from '@/utils/date';
import type { TransactionAPIRequest } from '@/services/types/transaction.dto';
import type { IconName } from '@/components/ui/icons/Icon';

export interface TransactionTypeInfo {
  label: string;
  icon: IconName;
  variant?: 'default' | 'positive' | 'negative';
}

// Define mapping rules in order of priority
const transactionMappings: TransactionMappingRule[] = [
  // Specific Distribution Types
  {
    condition: (tx) => tx.source?.distribution_type === 'RESEARCHHUB_POST_UPVOTED',
    label: 'Upvote: Post',
    icon: 'upvote',
    variant: 'positive',
  },
  {
    condition: (tx) => tx.source?.distribution_type === 'BOUNTY_REFUND',
    label: 'Bounty Refund',
    icon: 'earn1',
  },
  {
    condition: (tx) => tx.source?.distribution_type === 'RhCOMMENT_UPVOTED',
    label: 'Upvote: Comment',
    icon: 'upvote',
    variant: 'positive',
  },
  {
    condition: (tx) => tx.source?.distribution_type === 'PAPER_UPVOTED',
    label: 'Upvote: Paper',
    icon: 'upvote',
    variant: 'positive',
  },
  {
    condition: (tx) => tx.source?.distribution_type === 'RESEARCHHUB_POST_DOWNVOTED',
    label: 'Downvote: Post',
    icon: 'upvote',
    variant: 'negative',
  },
  {
    condition: (tx) => tx.source?.distribution_type === 'PAPER_REWARD',
    label: 'Paper Reward',
    icon: 'solidCoin',
  },
  {
    condition: (tx) => tx.source?.distribution_type === 'PURCHASE',
    label: 'Received Support',
    icon: 'fund',
  },
  {
    condition: (tx) => tx.source?.distribution_type === 'EDITOR_COMPENSATION',
    label: 'Editor Compensation',
    icon: 'solidCoin',
  },
  {
    condition: (tx) => tx.source?.distribution_type === 'REFERRAL_BONUS',
    label: 'Referral Bonus',
    icon: 'earn1',
    variant: 'positive',
  },
  {
    condition: (tx) => tx.source?.distribution_type === 'DEPOSIT',
    label: 'Deposit',
    icon: 'wallet1',
  },

  // Specific Purchase Types & Associated Fees (Fees checked first)
  {
    condition: (tx) =>
      tx.source?.purchase_type === 'BOOST' && tx.readable_content_type === 'supportfee',
    label: 'ResearchHub Platform Fee',
    icon: 'RSC',
  },
  {
    condition: (tx) =>
      tx.source?.purchase_type === 'FUNDRAISE_CONTRIBUTION' &&
      tx.readable_content_type === 'bountyfee',
    label: 'ResearchHub Platform Fee',
    icon: 'RSC',
  },
  {
    condition: (tx) => tx.source?.purchase_type === 'BOOST',
    label: 'Boost',
    icon: 'fund',
  },
  {
    condition: (tx) => tx.source?.purchase_type === 'FUNDRAISE_CONTRIBUTION',
    label: 'Fundraise Contribution',
    icon: 'fund',
  },

  // Fallback readable_content_type checks
  {
    condition: (tx) => tx.readable_content_type === 'withdrawal',
    label: 'Withdrawal',
    icon: 'wallet3',
  },
  {
    condition: (tx) => tx.readable_content_type === 'bounty',
    label: 'Bounty',
    icon: 'earn1',
  },
  // Fallback fee checks (if not caught by purchase_type) - lower priority
  {
    condition: (tx) => tx.readable_content_type === 'supportfee',
    label: 'ResearchHub Platform Fee',
    icon: 'RSC',
  },
  {
    condition: (tx) => tx.readable_content_type === 'bountyfee',
    label: 'ResearchHub Platform Fee',
    icon: 'RSC',
  },
];

interface TransactionMappingRule {
  condition: (tx: TransactionAPIRequest) => boolean;
  label: string;
  icon: IconName;
  variant?: 'default' | 'positive' | 'negative';
}

export function getTransactionTypeInfo(tx: TransactionAPIRequest): TransactionTypeInfo {
  for (const rule of transactionMappings) {
    if (rule.condition(tx)) {
      return {
        label: rule.label,
        icon: rule.icon,
        variant: rule.variant || 'default',
      };
    }
  }

  // Final fallback if no rules match
  return {
    label:
      tx.readable_content_type?.charAt(0).toUpperCase() + tx.readable_content_type?.slice(1) ||
      'Unknown Transaction',
    icon: 'notification',
  };
}

// Define the shape of the formatted transaction object
export interface FormattedTransaction extends TransactionAPIRequest {
  formattedAmount: string;
  formattedUsdValue: string;
  formattedDate: string;
  typeInfo: TransactionTypeInfo;
  isLocked: boolean;
  isPositive: boolean;
}

export function formatTransaction(
  tx: TransactionAPIRequest,
  exchangeRate: number,
  showUSD: boolean = false
): FormattedTransaction {
  const amount = parseFloat(tx.amount);
  const isPositive = amount >= 0;
  const absAmount = Math.abs(amount);

  let primaryAmount: string;
  let secondaryAmount: string;

  if (showUSD && exchangeRate > 0) {
    const usdAmount = absAmount * exchangeRate;
    primaryAmount = `${isPositive ? '+' : '-'}$${usdAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
    secondaryAmount = `${formatRSC({ amount: absAmount })} RSC`;
  } else {
    primaryAmount = `${isPositive ? '+' : '-'}${formatRSC({ amount: absAmount })} RSC`;
    secondaryAmount = formatUsdValue(tx.amount, exchangeRate);
  }

  return {
    ...tx,
    formattedAmount: primaryAmount,
    formattedUsdValue: secondaryAmount,
    formattedDate: formatTimestamp(tx.created_date),
    typeInfo: getTransactionTypeInfo(tx),
    isLocked: tx.is_locked,
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

import {
  ArrowBigUpDash,
  ArrowUpFromLine,
  HandCoins,
  ArrowDownToLine,
  ArrowDown,
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

// Define mapping rules in order of priority
const transactionMappings: TransactionMappingRule[] = [
  // Specific Distribution Types
  {
    condition: (tx) => tx.source?.distribution_type === 'RESEARCHHUB_POST_UPVOTED',
    label: 'Upvote: Post',
    icon: ArrowBigUpDash,
  },
  {
    condition: (tx) => tx.source?.distribution_type === 'BOUNTY_REFUND',
    label: 'Bounty Refund',
    icon: HandCoins,
  },
  {
    condition: (tx) => tx.source?.distribution_type === 'RhCOMMENT_UPVOTED',
    label: 'Upvote: Comment',
    icon: ArrowBigUpDash,
  },
  {
    condition: (tx) => tx.source?.distribution_type === 'PAPER_UPVOTED',
    label: 'Upvote: Paper',
    icon: ArrowBigUpDash,
  },
  {
    condition: (tx) => tx.source?.distribution_type === 'RESEARCHHUB_POST_DOWNVOTED',
    label: 'Downvote: Post',
    icon: ArrowDown,
  },
  {
    condition: (tx) => tx.source?.distribution_type === 'PAPER_REWARD',
    label: 'Paper Reward',
    icon: Trophy,
  },
  {
    condition: (tx) => tx.source?.distribution_type === 'PURCHASE',
    label: 'Received Support',
    icon: HandCoins,
  },
  {
    condition: (tx) => tx.source?.distribution_type === 'EDITOR_COMPENSATION',
    label: 'Editor Compensation',
    icon: Trophy,
  },
  {
    condition: (tx) => tx.source?.distribution_type === 'DEPOSIT',
    label: 'Deposit',
    icon: ArrowDownToLine,
  },

  // Specific Purchase Types & Associated Fees (Fees checked first)
  {
    condition: (tx) =>
      tx.source?.purchase_type === 'BOOST' && tx.readable_content_type === 'supportfee',
    label: 'ResearchHub Platform Fee',
    icon: Percent,
  },
  {
    condition: (tx) =>
      tx.source?.purchase_type === 'FUNDRAISE_CONTRIBUTION' &&
      tx.readable_content_type === 'bountyfee',
    label: 'ResearchHub Platform Fee',
    icon: Percent,
  },
  { condition: (tx) => tx.source?.purchase_type === 'BOOST', label: 'Boost', icon: HandCoins },
  {
    condition: (tx) => tx.source?.purchase_type === 'FUNDRAISE_CONTRIBUTION',
    label: 'Fundraise Contribution',
    icon: HandCoins,
  },

  // Fallback readable_content_type checks
  {
    condition: (tx) => tx.readable_content_type === 'withdrawal',
    label: 'Withdrawal',
    icon: ArrowUpFromLine,
  },
  { condition: (tx) => tx.readable_content_type === 'bounty', label: 'Bounty', icon: Trophy },
  // Fallback fee checks (if not caught by purchase_type) - lower priority
  {
    condition: (tx) => tx.readable_content_type === 'supportfee',
    label: 'ResearchHub Platform Fee',
    icon: Percent,
  },
  {
    condition: (tx) => tx.readable_content_type === 'bountyfee',
    label: 'ResearchHub Platform Fee',
    icon: Percent,
  },
];

interface TransactionMappingRule {
  condition: (tx: TransactionAPIRequest) => boolean;
  label: string;
  icon: LucideIcon;
}

export function getTransactionTypeInfo(tx: TransactionAPIRequest): TransactionTypeInfo {
  for (const rule of transactionMappings) {
    if (rule.condition(tx)) {
      return { label: rule.label, icon: rule.icon };
    }
  }

  // Final fallback if no rules match
  return {
    label:
      tx.readable_content_type?.charAt(0).toUpperCase() + tx.readable_content_type?.slice(1) ||
      'Unknown Transaction',
    icon: HelpCircle,
  };
}

// Define the shape of the formatted transaction object
export interface FormattedTransaction extends TransactionAPIRequest {
  formattedAmount: string;
  formattedUsdValue: string;
  formattedDate: string;
  typeInfo: TransactionTypeInfo;
  isPositive: boolean;
}

export function formatTransaction(
  tx: TransactionAPIRequest,
  exchangeRate: number
): FormattedTransaction {
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

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
import { ID } from '@/types/root'; // Assuming ID type exists

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
  }, // Matches "Received Support" example
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
  { condition: (tx) => tx.readable_content_type === 'bounty', label: 'Bounty', icon: Trophy }, // Covers Grant example
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

// --- START NEW HELPER FUNCTIONS ---

// Placeholder base URLs - adjust these to match your actual routing
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || ''; // Ensure this env var is set
const USER_PROFILE_BASE_URL = `${BASE_URL}/user/`;
// const POST_BASE_URL = `${BASE_URL}/post/`; // Commented out as post links are deferred
const PAPER_BASE_URL = `${BASE_URL}/paper/`;
// const COMMENT_BASE_URL = `${BASE_URL}/`; // Commented out as comment links are deferred

/**
 * Determines the URL for the *paper* related to the transaction, if found.
 * Checks multiple locations within the transaction object based on observed patterns.
 */
function getContentUrl(tx: TransactionAPIRequest): string | null {
  let paperId: ID | undefined;

  // Priority 1: Direct content link if it's explicitly a paper
  if (tx.content_id && tx.readable_content_type === 'paper') {
    paperId = tx.content_id;
  }
  // Priority 2: Unified document ID directly in the source (e.g., Bounties)
  else if (tx.source?.unified_document?.id) {
    // We might want to check unified_document.document_type === 'PAPER' if available
    paperId = tx.source.unified_document.id;
  }
  // Priority 3: Nested unified document ID within proof_item.source (e.g., Boosts/Tips)
  else if (tx.source?.proof_item?.source?.unified_document?.id) {
    // We might want to check proof_item.source.unified_document.document_type === 'PAPER' if available
    paperId = tx.source.proof_item.source.unified_document.id;
  }
  // Add more checks here if other patterns are found later

  // If we found a potential paper ID, construct the URL
  if (paperId) {
    // Check if it's a valid number or numeric string before constructing URL
    const numericPaperId = typeof paperId === 'number' ? paperId : parseInt(paperId as string, 10);
    if (!isNaN(numericPaperId)) {
      return `${PAPER_BASE_URL}${numericPaperId}/summary`; // Assumes /summary is the target
    } else {
      console.warn('Found potential paper ID, but it was not numeric:', paperId);
    }
  }

  // No paper link found in the known locations
  return null;
}

/**
 * Determines the user who initiated the action, if different from the current user.
 */
function getGiverInfo(
  tx: TransactionAPIRequest,
  currentUserId?: ID
): { id: ID; url: string } | null {
  const giverId = tx.source?.giver;

  if (giverId && currentUserId && giverId.toString() !== currentUserId.toString()) {
    return {
      id: giverId,
      url: `${USER_PROFILE_BASE_URL}${giverId}`,
    };
  }

  return null;
}

// --- END NEW HELPER FUNCTIONS ---

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
  contentUrl: string | null;
  giverInfo: { id: ID; url: string } | null;
}

export function formatTransaction(
  tx: TransactionAPIRequest,
  exchangeRate: number,
  currentUserId?: ID // Make currentUserId optional for flexibility
): FormattedTransaction {
  // Return the specific formatted type
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
    contentUrl: getContentUrl(tx), // Add content URL
    giverInfo: getGiverInfo(tx, currentUserId), // Add giver info
  };
}

export function formatBalance(balance: number, exchangeRate: number) {
  return {
    raw: balance,
    formatted: formatRSC({ amount: balance }),
    formattedUsd: formatUsdValue(balance.toString(), exchangeRate),
  };
}

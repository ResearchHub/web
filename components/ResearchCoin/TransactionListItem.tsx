import { memo } from 'react';
import dayjs from 'dayjs';
import {
  ArrowBigUpDash,
  ArrowUpFromLine,
  HandCoins,
  ArrowDownToLine,
  Trophy,
  Percent,
  HelpCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { TransactionAPIRequest } from '@/services/types/transaction.dto';

interface TransactionListItemProps {
  transaction: TransactionAPIRequest;
  /**
   * Current exchange rate passed down from BalanceCard
   */
  exchangeRate: number;
}

interface TransactionTypeInfo {
  label: string;
  icon: LucideIcon;
}

// Map of distribution types to display names
const DISTRIBUTION_TYPES = {
  'EDITOR_BOUNTY': 'Editor Bounty',
  'PAPER_UPVOTED': 'Upvote: Paper',
  'COMMENT_UPVOTED': 'Upvote: Comment',
  'RESEARCH_UPVOTED': 'Upvote: Research',
  'PURCHASING_POWER': 'Purchasing Power',
  'RhCOMMENT': 'Comment',
  'STORED_REWARD': 'Stored Reward',
  'THREAD_REWARD': 'Thread Reward',
  'PAPER_REWARD': 'Paper Reward',
  'EDITOR_CONTRIBUTION': 'Editor Contribution',
  'COMMENT_REWARD': 'Comment Reward',
  'RhCOMMENT_UPVOTED': 'Upvote: Comment',
  'RESEARCHHUB_POST_UPVOTED': 'Upvote: Post',
  'MOD_PAYMENT': 'Moderator Payment',
  'REPLY_COMMENT': 'Reply Comment',
  'PURCHASE': 'Purchase',
  'PURCHASE_BOOST': 'Tip',
  'PURCHASE_TIP': 'Tip',
  'SUPPORT_RH_FEE': 'Support RH Fee',
  'BOUNTY': 'Bounty',
  'BOUNTY_FEE': 'Bounty Fee',
  'WITHDRAWAL': 'Withdrawal',
  'DEPOSIT': 'Deposit',
} as const;

// Map content_type IDs to display names and icons
const CONTENT_TYPE_MAP: Record<number, TransactionTypeInfo> = {
  27: { label: 'Distribution', icon: ArrowBigUpDash },
  30: { label: 'Withdrawal', icon: ArrowUpFromLine },
  55: { label: 'Purchase', icon: HandCoins },
  61: { label: 'Support', icon: HandCoins },
  89: { label: 'Deposit', icon: ArrowDownToLine },
  108: { label: 'Bounty', icon: Trophy },
  110: { label: 'Bounty Fee', icon: Percent },
  127: { label: 'Support Fee', icon: Percent },
  144: { label: 'Paper Reward', icon: Trophy },
  154: { label: 'Payment', icon: HandCoins }
} as const;

function TransactionListItemComponent({ 
  transaction, 
  exchangeRate,
}: TransactionListItemProps) {
  const formatTransactionAmount = (amount: string) => {
    const parsedAmount = parseFloat(amount);
    const formattedAmount = parsedAmount % 1 === 0 ? 
      parsedAmount.toString() : 
      parsedAmount.toFixed(2);
    return `${parsedAmount >= 0 ? '+' : ''}${formattedAmount} RSC`;
  };

  const getTransactionInfo = (tx: TransactionAPIRequest): TransactionTypeInfo => {
    // First check if we have source type information
    if (tx.source?.purchase_type) {
      const sourceType = tx.source.purchase_type;
      const label = DISTRIBUTION_TYPES[sourceType as keyof typeof DISTRIBUTION_TYPES];
      if (label) {
        return {
          label,
          icon: sourceType.includes('BOOST') || sourceType.includes('TIP') ? HandCoins : 
                sourceType === 'BOUNTY' ? Trophy :
                ArrowBigUpDash
        };
      }
    }

    // Then check content type map
    if (tx.content_type && CONTENT_TYPE_MAP[tx.content_type]) {
      return CONTENT_TYPE_MAP[tx.content_type];
    }

    // Finally fall back to readable content type or unknown
    return {
      label: tx.readable_content_type?.charAt(0).toUpperCase() + 
             tx.readable_content_type?.slice(1) || 'Unknown TX',
      icon: HelpCircle
    };
  };

  const formatDateTime = (dateString: string) => {
    return dayjs(dateString).format('MMM D, YYYY, h:mm A');
  };

  const renderUsdValue = () => {
    const amount = parseFloat(transaction.amount);
    const usdValue = amount * exchangeRate;
    const absValue = Math.abs(usdValue).toFixed(2);
    
    return (
      <span className="text-xs text-gray-500 group-hover:text-gray-600">
        {usdValue < 0 ? `-$${absValue}` : `$${absValue}`} USD
      </span>
    );
  };

  const isPositive = parseFloat(transaction.amount) >= 0;
  const transactionInfo = getTransactionInfo(transaction);
  const Icon = transactionInfo.icon;

  return (
    <div className="group">
      <div className="relative py-3 transition-all duration-200 rounded-lg px-4 -mx-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-3 w-full">
            <div className="w-[38px] h-[38px] flex items-center justify-center rounded-full bg-gray-50">
              <Icon className="h-4 w-4 text-gray-600" strokeWidth={2} />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900">{transactionInfo.label}</p>
              </div>
              <div className="text-xs text-gray-600 mt-0.5">
                {formatDateTime(transaction.created_date)}
              </div>
            </div>

            <div className="flex flex-col items-end min-w-[140px]">
              <div className="flex items-center justify-end w-full">
                <div className="flex flex-col items-end">
                  <span className={`
                    text-base font-medium transition-colors duration-200
                    ${isPositive ? 'text-green-600 group-hover:text-green-700' : 'text-gray-900'}
                  `}>
                    {formatTransactionAmount(transaction.amount)}
                  </span>
                  {renderUsdValue()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const TransactionListItem = memo(TransactionListItemComponent); 
import { TransactionDTO } from '@/services/types/transaction.dto';
import { 
  ArrowDownToLine,
  ArrowUpFromLine, 
  HandCoins, 
  CheckCircle,
  CircleDollarSign,
  Percent,
  RotateCcw,
  ArrowBigUpDash,
  ExternalLink,
  FileText,
} from 'lucide-react';

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
  'PURCHASE_BOOST': 'Support',
  'PURCHASE_TIP': 'Support',
  'SUPPORT_RH_FEE': 'Support RH Fee',
  'BOUNTY': 'Bounty',
  'BOUNTY_FEE': 'Bounty Fee',
  'WITHDRAWAL': 'Withdrawal',
  'DEPOSIT': 'Deposit',
} as const;

type DistributionType = keyof typeof DISTRIBUTION_TYPES;

interface TransactionItemProps {
  transaction: TransactionDTO;
}

export function TransactionItem({ 
  transaction, 
}: TransactionItemProps) {
  const getTransactionIcon = (transaction: TransactionDTO) => {
    const type = transaction.source?.distribution_type;
    const contentType = transaction.readable_content_type;
    
    // Handle withdrawals
    if (contentType === 'withdrawal') {
      return <ArrowUpFromLine className="h-4 w-4 text-gray-700" />;
    }
    
    // Handle fees
    if (contentType === 'bountyfee' || contentType === 'supportfee' || type?.includes('FEE')) {
      return <Percent className="h-4 w-4 text-gray-700" />;
    }
    
    // Handle bounties
    if (contentType === 'bounty' || type?.includes('BOUNTY')) {
      return <CheckCircle className="h-4 w-4 text-gray-700" />;
    }
    
    // Handle refunds
    if (type?.includes('REFUND') || transaction.source?.status === 'REFUNDED') {
      return <RotateCcw className="h-4 w-4 text-gray-700" />;
    }
    
    // Handle purchases and support fees
    if (contentType === 'purchase') {
      const purchaseType = transaction.source?.purchase_type;
      if (['BOOST', 'TIP'].includes(purchaseType || '')) {
        return <HandCoins className="h-4 w-4 text-gray-700" />;
      }
    }
    
    // Handle upvotes
    if (type?.includes('UPVOTED') || type?.includes('UPVOTE')) {
      return <ArrowBigUpDash className="h-4 w-4 text-gray-700" />;
    }
    
    // Default icons based on transaction amount
    if (parseFloat(transaction.amount) >= 0) {
      return <ArrowDownToLine className="h-4 w-4 text-gray-700" />;
    }
    
    return <ArrowUpFromLine className="h-4 w-4 text-gray-700" />;
  };

  const formatTransactionAmount = (transaction: TransactionDTO) => {
    const amount = parseFloat(transaction.amount);
    const formattedAmount = amount % 1 === 0 ? amount.toString() : amount.toFixed(2);
    return `${amount >= 0 ? '+' : ''}${formattedAmount} RSC`;
  };

  const getTransactionType = (transaction: TransactionDTO) => {
    // Handle withdrawals first
    if (transaction.readable_content_type === 'withdrawal') {
      return 'Withdrawal';
    }

    // Handle bounty and bounty fee cases first
    if (transaction.readable_content_type === 'bounty') {
      const bountyType = transaction.source?.bounty_type;
      return bountyType ? `Bounty: ${bountyType.charAt(0) + bountyType.slice(1).toLowerCase()}` : 'Bounty';
    }

    if (transaction.readable_content_type === 'bountyfee') {
      // If there's a related bounty type, show it
      const bountyType = transaction.source?.bounty_type;
      return bountyType ? 
        `Fee: ${bountyType.charAt(0) + bountyType.slice(1).toLowerCase()} Bounty` : 
        'Fee: Bounty';
    }

    // Handle purchases
    if (transaction.readable_content_type === 'purchase') {
      const purchaseType = transaction.source?.purchase_type;
      if (purchaseType === 'BOOST') {
        return DISTRIBUTION_TYPES['PURCHASE_BOOST'];
      } else if (purchaseType === 'TIP') {
        return DISTRIBUTION_TYPES['PURCHASE_TIP'];
      }
      return DISTRIBUTION_TYPES['PURCHASE'];
    }

    if (transaction.readable_content_type === 'supportfee') {
      return 'Fee: Support';
    }

    if (transaction?.source?.distribution_type) {
      const type = transaction.source.distribution_type as DistributionType;
      return DISTRIBUTION_TYPES[type] || type.split('_')
        .map(word => word.charAt(0) + word.slice(1).toLowerCase())
        .join(' ');
    }

    return 'Unknown Transaction';
  };

  const amount = parseFloat(transaction.amount);
  const isPositive = amount >= 0;
  
  // Calculate fees and net amount first
  const fee = transaction.source?.fee || '0';
  const netAmount = (amount - parseFloat(fee)).toFixed(2);
  
  // Format USD value with correct minus sign placement
  const formatUsdValue = (value: number) => {
    const absValue = Math.abs(value).toFixed(2);
    return value < 0 ? `-$${absValue}` : `$${absValue}`;
  };
  
  // Then calculate USD values
  const usdValue = formatUsdValue(amount);
  const netUsdValue = formatUsdValue(parseFloat(netAmount));

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getContentLink = (transaction: TransactionDTO) => {
    const truncateTitle = (title: string) => {
      return title.length > 50 ? `${title.substring(0, 47)}...` : title;
    };

    // Handle withdrawals and deposits with transaction hash
    if (
      ['withdrawal', 'deposit'].includes(transaction.readable_content_type) && 
      transaction.source?.transaction_hash
    ) {
      return {
        title: `View on Etherscan`,
        url: `https://etherscan.io/tx/${transaction.source.transaction_hash}`,
        isExternal: true
      };
    }

    // Handle bounty transactions with unified document
    if (
      transaction.readable_content_type === 'bounty' && 
      transaction.source?.unified_document
    ) {
      return {
        title: `Unified Doc #${transaction.source.unified_document}`,
        url: `/unified-document/${transaction.source.unified_document}`,
        isExternal: false
      };
    }

    // Check for paper title in source.source
    if (transaction.source?.source?.paper_title) {
      return {
        title: truncateTitle(transaction.source.source.paper_title),
        url: `/paper/${transaction.source.object_id}/`,
        isExternal: false
      };
    }

    // For other content types
    if (transaction.content_id) {
      return {
        title: transaction.content_title ? 
          truncateTitle(transaction.content_title) : 
          'View Content',
        url: `/${transaction.readable_content_type}/${transaction.content_id}/`,
        isExternal: false
      };
    }

    return null;
  };

  const getUserLink = (transaction: TransactionDTO) => {
    // Check if there's a giver in the source for upvotes and rewards
    if (
      transaction.source?.giver && 
      transaction.source?.distribution_type?.includes('UPVOTED')
    ) {
      return {
        userId: transaction.source.giver,
        url: `/user/${transaction.source.giver}`
      };
    }
    return null;
  };

  return (
    <div className="group">
      <div 
        className={`
          relative py-4 transition-all duration-200 rounded-lg px-6 -mx-4
          hover:shadow-sm hover:bg-gray-50/50 group
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <div className="flex items-center justify-center rounded-full p-2 
              bg-gray-50 group-hover:bg-white transition-all duration-200
              shadow-sm group-hover:shadow">
              {getTransactionIcon(transaction)}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900">{getTransactionType(transaction)}</p>
                {transaction.readable_content_type === 'withdrawal' && transaction.source?.paid_status && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-50">
                    {transaction.source.paid_status.charAt(0) + 
                     transaction.source.paid_status.slice(1).toLowerCase()}
                  </span>
                )}
                {transaction?.source?.status && transaction.readable_content_type !== 'withdrawal' && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-50">
                    {transaction.source.status}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                <span>{formatDateTime(transaction.created_date)}</span>
                
                {getContentLink(transaction) && (
                  <>
                    <span>•</span>
                    <a 
                      href={getContentLink(transaction)?.url}
                      target={getContentLink(transaction)?.isExternal ? "_blank" : undefined}
                      rel={getContentLink(transaction)?.isExternal ? "noopener noreferrer" : undefined}
                      className="hover:text-primary-400 transition-colors flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {getContentLink(transaction)?.title}
                      {getContentLink(transaction)?.isExternal ? (
                        <ExternalLink className="h-3 w-3" />
                      ) : (
                        <FileText className="h-3 w-3" />
                      )}
                    </a>
                  </>
                )}

                {getUserLink(transaction) && (
                  <>
                    <span>•</span>
                    <a 
                      href={getUserLink(transaction)?.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary-400 transition-colors flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      From User #{getUserLink(transaction)?.userId}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end min-w-[140px]">
            <div className="flex items-center justify-end w-full">
              <div className="flex flex-col items-end">
                <span className={`
                  text-base font-medium transition-colors duration-200
                  ${isPositive ? 'text-green-600 group-hover:text-green-700' : 'text-gray-900'}
                `}>
                  {formatTransactionAmount(transaction)}
                </span>
                <span className="text-xs text-gray-500 group-hover:text-gray-600">
                  {usdValue} USD
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
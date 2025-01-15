import { ApiClient } from './client'
import type { 
  TransactionAPIResponse, 
  UserBalanceResponse, 
  TransactionAPIRequest 
} from './types/transaction.dto'
import { formatTransactionAmount, formatUsdValue, formatRSC } from '@/utils/number'
import { formatTimestamp } from '@/utils/date'
import { 
  ArrowBigUpDash,
  ArrowUpFromLine,
  HandCoins,
  ArrowDownToLine,
  Trophy,
  Percent,
  HelpCircle,
  type LucideIcon
} from 'lucide-react'

interface TransactionTypeInfo {
  label: string
  icon: LucideIcon
}

export interface TransformedTransaction extends TransactionAPIRequest {
  formattedAmount: string
  formattedUsdValue: string
  formattedDate: string
  typeInfo: TransactionTypeInfo
  isPositive: boolean
}

export interface TransformedBalance {
  raw: number
  formatted: string
  formattedUsd: string
}

export class TransactionService {
  private static readonly BASE_PATH = '/api/transactions'
  private static readonly WITHDRAWAL_PATH = '/api/withdrawal'

  // Map of distribution types to display names
  private static readonly DISTRIBUTION_TYPES = {
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
  } as const

  // Map content_type IDs to display names and icons
  private static readonly CONTENT_TYPE_MAP: Record<number, TransactionTypeInfo> = {
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
  } as const

  private static getTransactionTypeInfo(tx: TransactionAPIRequest): TransactionTypeInfo {
    // First check if we have source type information
    if (tx.source?.purchase_type) {
      const sourceType = tx.source.purchase_type
      const label = this.DISTRIBUTION_TYPES[sourceType as keyof typeof this.DISTRIBUTION_TYPES]
      if (label) {
        return {
          label,
          icon: sourceType.includes('BOOST') || sourceType.includes('TIP') ? HandCoins : 
                sourceType === 'BOUNTY' ? Trophy :
                ArrowBigUpDash
        }
      }
    }

    // Then check content type map
    if (tx.content_type && this.CONTENT_TYPE_MAP[tx.content_type]) {
      return this.CONTENT_TYPE_MAP[tx.content_type]
    }

    // Finally fall back to readable content type or unknown
    return {
      label: tx.readable_content_type?.charAt(0).toUpperCase() + 
             tx.readable_content_type?.slice(1) || 'Unknown TX',
      icon: HelpCircle
    }
  }

  private static transformTransaction(tx: TransactionAPIRequest, exchangeRate: number): TransformedTransaction {
    const isPositive = parseFloat(tx.amount) >= 0
    return {
      ...tx,
      formattedAmount: formatTransactionAmount(tx.amount),
      formattedUsdValue: formatUsdValue(tx.amount, exchangeRate),
      formattedDate: formatTimestamp(tx.created_date),
      typeInfo: this.getTransactionTypeInfo(tx),
      isPositive
    }
  }

  private static transformBalance(balance: number, exchangeRate: number): TransformedBalance {
    return {
      raw: balance,
      formatted: formatRSC({ amount: balance }),
      formattedUsd: formatUsdValue(balance.toString(), exchangeRate)
    }
  }

  /**
   * Fetches and transforms transactions for the current user
   */
  static async getTransactions(page: number = 1, exchangeRate: number): Promise<{
    transactions: TransformedTransaction[]
    hasNextPage: boolean
  }> {
    const response = await ApiClient.get<TransactionAPIResponse>(
      `${this.BASE_PATH}/?page=${page}`
    )
    
    if (!response?.results) {
      throw new Error('Invalid response format')
    }

    return {
      transactions: response.results.map(tx => this.transformTransaction(tx, exchangeRate)),
      hasNextPage: !!response.next
    }
  }

  /**
   * Fetches and transforms the user's balance
   */
  static async getUserBalance(exchangeRate: number): Promise<TransformedBalance> {
    const response = await ApiClient.get<UserBalanceResponse>(`${this.WITHDRAWAL_PATH}/`)
    return this.transformBalance(response.user.balance, exchangeRate)
  }

  static async exportTransactionsCSV() {
    return ApiClient.getBlob(`${this.BASE_PATH}/turbotax_csv_export/`)
  }
} 
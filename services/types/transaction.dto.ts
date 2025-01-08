export interface TransactionAPIRequest {
  id: number;
  source?: TransactionSource;
  readable_content_type: string;
  content_title: string | null;
  content_id: number | null;
  content_slug: string | null;
  object_id: number;
  amount: string;
  created_date: string;
  updated_date: string;
  user: number;
  content_type: number;
  fee?: number;
  transaction_hash?: string;
}

export interface TransactionAPIResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: TransactionAPIRequest[];
}

export interface UserBalanceResponse {
  balance: number;
  user: {
    id: number;
    balance: number;
  };
}

export interface ExchangeRateResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{
    id: number;
    created_date: string;
    updated_date: string;
    rate: number;
    target_currency: string;
    price_source: string;
  }>;
}

export interface TransactionSource {
  purchase_type?: string;
  distribution_type?: string;
}

export function transformTransactionResponse(raw: unknown): TransactionAPIResponse {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid response format');
  }
  
  const response = raw as any;
  if (typeof response.count !== 'number' || 
      !Array.isArray(response.results) ||
      (response.next !== null && typeof response.next !== 'string') ||
      (response.previous !== null && typeof response.previous !== 'string')) {
    throw new Error('Invalid response format');
  }

  return {
    count: response.count,
    next: response.next,
    previous: response.previous,
    results: response.results.map(transformTransaction),
  };
}

export function transformTransaction(raw: unknown): TransactionAPIRequest {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid transaction format');
  }

  const tx = raw as any;
  if (typeof tx.id !== 'number' ||
      typeof tx.amount !== 'string' ||
      typeof tx.created_date !== 'string' ||
      typeof tx.updated_date !== 'string' ||
      typeof tx.user !== 'number' ||
      typeof tx.content_type !== 'number') {
    throw new Error('Invalid transaction format');
  }

  return {
    id: tx.id,
    source: tx.source,
    readable_content_type: tx.readable_content_type || '',
    content_title: tx.content_title,
    content_id: tx.content_id,
    content_slug: tx.content_slug,
    object_id: tx.object_id,
    amount: tx.amount,
    created_date: tx.created_date,
    updated_date: tx.updated_date,
    user: tx.user,
    content_type: tx.content_type,
    fee: tx.fee,
    transaction_hash: tx.transaction_hash,
  };
} 
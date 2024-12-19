export interface TransactionAPIRequest {
  id: number;
  source?: TransactionSource;
  readable_content_type: string;
  content_title: string | null;
  content_id: number | null;
  content_slug: string | null;
  object_id: number;
  amount: string;
  testnet_amount: string;
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
  results: any[];
}

export interface UserBalanceResponse {
  balance: number;
  user: {
    id: number;
    balance: number;
    // ... other user fields if needed
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
    real_rate: number;
    target_currency: string;
    price_source: string;
  }>;
}

export function transformTransactionResponse(raw: any): TransactionAPIResponse {
  return {
    count: raw.count,
    next: raw.next,
    previous: raw.previous,
    results: raw.results,
  }
}

export function transformTransaction(raw: any): any {
  return raw;
} 
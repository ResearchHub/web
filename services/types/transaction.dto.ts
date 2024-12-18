interface TransactionSource {
  distribution_type?: string;
  giver?: number;
  bounty_type?: string;
  status?: string;
  purchase_type?: string;
  fee?: string;
  paid_status?: string;
  transaction_hash?: string;
  to_address?: string;
  from_address?: string;
  source?: {
    paper_title?: string;
  };
  object_id?: number;
}

export interface TransactionDTO {
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

export interface TransactionResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: TransactionDTO[];
}

export function transformTransactionResponse(raw: any): TransactionResponse {
  return {
    results: raw.results.map(transformTransaction),
    count: raw.count,
    next: raw.next,
    previous: raw.previous,
  }
}

export function transformTransaction(raw: any): TransactionDTO {
  return {
    id: raw.id,
    source: raw.source ? transformTransactionSource(raw.source) : undefined,
    readable_content_type: raw.readable_content_type,
    content_title: raw.content_title,
    content_id: raw.content_id,
    content_slug: raw.content_slug,
    object_id: raw.object_id,
    amount: raw.amount,
    testnet_amount: raw.testnet_amount,
    created_date: raw.created_date,
    updated_date: raw.updated_date,
    user: raw.user,
    content_type: raw.content_type,
    fee: raw.fee,
    transaction_hash: raw.transaction_hash,
  }
}

function transformTransactionSource(raw: any): TransactionSource {
  return {
    distribution_type: raw.distribution_type,
    giver: raw.giver,
    bounty_type: raw.bounty_type,
    status: raw.status,
    purchase_type: raw.purchase_type,
    fee: raw.fee,
    paid_status: raw.paid_status,
    transaction_hash: raw.transaction_hash,
    to_address: raw.to_address,
    from_address: raw.from_address,
    source: raw.source ? {
      paper_title: raw.source.paper_title
    } : undefined,
    object_id: raw.object_id,
  }
} 
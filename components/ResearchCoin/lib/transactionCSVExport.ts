import type { TransactionAPIRequest } from '@/services/types/transaction.dto'
import { ExchangeRateService } from '@/services/exchangeRate.service'

type TransactionType = 'Buy' | 'Sale' | 'Convert' | 'Transfer' | 'Income' | 
  'Expense' | 'Deposit' | 'Withdrawal' | 'Mining' | 'Airdrop' | 'Staking' | 'Other';

const CONTENT_TYPE_MAP = {
  27: 'DISTRIBUTION',
  30: 'WITHDRAWAL',
  55: 'PURCHASE',
  61: 'SUPPORT',
  89: 'DEPOSIT',
  108: 'BOUNTY',
  110: 'BOUNTY_FEE',
  127: 'SUPPORT_FEE'
} as const;

// Helper function to map our transaction types to TurboTax types
function mapTransactionType(tx: TransactionAPIRequest): TransactionType {
  // First check content_type mapping
  const mappedType = tx.content_type ? CONTENT_TYPE_MAP[tx.content_type as keyof typeof CONTENT_TYPE_MAP] : null;
  if (mappedType) {
    switch (mappedType) {
      case 'DISTRIBUTION':
        return 'Income';
      case 'WITHDRAWAL':
        return 'Withdrawal';
      case 'DEPOSIT':
        return 'Deposit';
      case 'PURCHASE':
      case 'SUPPORT':
        return 'Other';
      case 'BOUNTY':
        return 'Income';
      case 'BOUNTY_FEE':
      case 'SUPPORT_FEE':
        return 'Expense';
    }
  }

  const type = tx.readable_content_type?.toLowerCase() || '';
  const distributionType = tx.source?.distribution_type?.toLowerCase() || '';

  // Income types
  if ([
    'editor_bounty',
    'paper_upvoted',
    'comment_upvoted',
    'research_upvoted',
    'rhcomment',
    'editor_contribution',
    'rhcomment_upvoted',
    'researchhub_post_upvoted',
    'mod_payment',
    'reply_comment'
  ].includes(type)) {
    return 'Income';
  }

  // Airdrop types
  if ([
    'stored_reward',
    'thread_reward',
    'paper_reward',
    'comment_reward'
  ].includes(type)) {
    return 'Airdrop';
  }

  // Expense types
  if ([
    'support_rh_fee',
    'bounty_fee',
    'supportfee'
  ].includes(type)) {
    return 'Expense';
  }

  // Basic transaction types
  switch (type) {
    case 'withdrawal':
      return 'Withdrawal';
    case 'deposit':
      return 'Deposit';
    case 'purchase':
    case 'purchase_boost':
    case 'purchase_tip':
      return 'Other';
    case 'bounty':
      return distributionType.includes('income') ? 'Income' : 'Other';
    case 'purchasing_power':
      return 'Other';
    default:
      return 'Other';
  }
}

// Update the rowData initialization to include better descriptions
function getTransactionDescription(tx: TransactionAPIRequest): string {
  const type = tx.readable_content_type;
  const distributionType = tx.source?.distribution_type;
  
  let description = tx.readable_content_type || '';
  
  // Add more context based on transaction type
  switch (type?.toLowerCase()) {
    case 'editor_bounty':
      description = 'Editor bounty reward';
      break;
    case 'paper_upvoted':
    case 'comment_upvoted':
    case 'research_upvoted':
    case 'rhcomment_upvoted':
    case 'researchhub_post_upvoted':
      description = `Upvote reward for ${type.replace('_upvoted', '').toLowerCase()}`;
      break;
    case 'stored_reward':
    case 'thread_reward':
    case 'paper_reward':
    case 'comment_reward':
      description = `Airdrop: ${type.replace('_reward', '')} reward`;
      break;
    case 'support_rh_fee':
    case 'bounty_fee':
      description = `Platform fee: ${type.replace('_fee', '')}`;
      break;
    // Add more specific descriptions as needed
  }

  return description;
}

/**
 * Attempts to process a transaction, returning undefined if the transaction is invalid
 */
function processTransaction(tx: TransactionAPIRequest, exchangeRate?: number) {
  try {
    // Format date exactly as specified in TurboTax requirements
    const date = new Date(tx.created_date);
    const formattedDate = date.toISOString()
      .replace('T', ' ')
      .slice(0, 19);

    const txType = mapTransactionType(tx);
    const amount = Math.abs(parseFloat(tx.amount));
    const amountFormatted = amount.toFixed(8);
    
    // Calculate market value - if no exchange rate is available, use $0.00
    const marketValue = exchangeRate !== undefined ? 
      (amount * exchangeRate).toFixed(2) : 
      '0.00';

    let rowData: Record<string, string> = {
      Date: formattedDate,
      Type: txType,
      'Sent Asset': '',
      'Sent Amount': '',
      'Received Asset': '',
      'Received Amount': '',
      'Fee Asset': tx.fee != null ? 'RSC' : '',
      'Fee Amount': tx.fee != null ? tx.fee.toFixed(8) : '',
      'Market Value Currency': 'USD', // Always set to USD since we're always calculating USD value
      'Market Value': `$${marketValue}`,
      Description: getTransactionDescription(tx),
      'Transaction Hash': tx.transaction_hash || '',
      'Transaction ID': tx.id?.toString() || '',
      'Raw Distribution Type': `${tx.readable_content_type || ''} | ${tx.source?.distribution_type || ''}`
    };

    // Populate sent/received fields based on transaction type
    const isPositive = parseFloat(tx.amount) > 0;
    switch (txType) {
      case 'Buy':
        rowData['Sent Asset'] = 'USD';
        rowData['Sent Amount'] = amountFormatted;
        rowData['Received Asset'] = 'RSC';
        rowData['Received Amount'] = amountFormatted;
        break;
      case 'Income':
      case 'Airdrop':
        rowData['Received Asset'] = 'RSC';
        rowData['Received Amount'] = amountFormatted;
        break;
      case 'Expense':
        rowData['Sent Asset'] = 'RSC';
        rowData['Sent Amount'] = amountFormatted;
        break;
      case 'Withdrawal':
        rowData['Sent Asset'] = 'RSC';
        rowData['Sent Amount'] = amountFormatted;
        break;
      case 'Deposit':
        rowData['Received Asset'] = 'RSC';
        rowData['Received Amount'] = amountFormatted;
        break;
      case 'Other':
        // Handle based on whether it's incoming or outgoing
        if (isPositive) {
          rowData['Received Asset'] = 'RSC';
          rowData['Received Amount'] = amountFormatted;
        } else {
          rowData['Sent Asset'] = 'RSC';
          rowData['Sent Amount'] = amountFormatted;
        }
        break;
    }

    return rowData;
  } catch (error) {
    console.error('Error processing transaction:', error, tx);
    return undefined;
  }
}

/**
 * Exports transactions to CSV format with USD values.
 * Uses ExchangeRateService to fetch historical exchange rates for each transaction.
 * Processes transactions in chunks to avoid overwhelming the API and provides
 * progress updates through the onProgress callback.
 * 
 * If exchange rates are unavailable for any transactions, they will be exported
 * with a $0.00 USD value and a warning will be added to the CSV.
 */
export async function exportTransactionsToCSV(
  transactions: TransactionAPIRequest[], 
  startDate: string, 
  endDate: string,
  onProgress?: (processed: number) => void
) {
  // If no transactions, don't create file
  if (!transactions.length) {
    return;
  }

  // Fetch exchange rates for all transactions
  const exchangeRates = new Map<string, number>();
  let failedRates = 0;
  let processedCount = 0;

  // Process transactions in chunks to avoid overwhelming the API
  const CHUNK_SIZE = 50;
  chunkLoop: for (let i = 0; i < transactions.length; i += CHUNK_SIZE) {
    const chunk = transactions.slice(i, i + CHUNK_SIZE);
    try {
      // Convert dates to ISO string for lookup
      const dates = chunk.map(tx => new Date(tx.created_date).toISOString());
      const rates = await ExchangeRateService.fetchRatesForDates(dates);
      
      // Merge rates into our map
      for (const [date, rate] of rates.entries()) {
        exchangeRates.set(date, rate);
      }

      // Update progress
      processedCount += chunk.length;
      onProgress?.(processedCount);
    } catch (error: any) {
      // Check if this is a 404 response, indicating no more pages
      if (error?.response?.status === 404) {
        console.log('No more exchange rates available (404), using $0.00 for remaining transactions');
        failedRates += transactions.length - i;
        break chunkLoop;  // Exit the loop immediately
      }
      
      console.error('Failed to fetch exchange rates for chunk:', error);
      failedRates += chunk.length;
      processedCount += chunk.length;
      onProgress?.(processedCount);
    }
  }

  // Debug exchange rates
  console.log('Exchange rates fetched:', exchangeRates.size, 'Failed rates:', failedRates);

  const headers = [
    'Date',
    'Type',
    'Sent Asset',
    'Sent Amount',
    'Received Asset',
    'Received Amount',
    'Fee Asset',
    'Fee Amount',
    'Market Value Currency',
    'Market Value',
    'Description',
    'Transaction Hash',
    'Transaction ID',
    'Raw Distribution Type'
  ];

  // Process transactions with exchange rates
  const rows = transactions
    .map(tx => {
      // Convert the date to ISO string for exchange rate lookup
      const txDate = new Date(tx.created_date);
      const isoDate = txDate.toISOString();
      const rate = exchangeRates.get(isoDate);
      
      console.log('Processing transaction:', {
        date: tx.created_date,
        isoDate,
        amount: tx.amount,
        rate
      });
      
      const rowData = processTransaction(tx, rate);
      return rowData;
    })
    .filter((rowData): rowData is Record<string, string> => rowData !== undefined)
    .map(rowData => {
      return headers.map(header => {
        const value = rowData[header];
        if (value === null || value === undefined) return '';
        if (String(value).includes(',') || String(value).includes('"') || String(value).includes('\n')) {
          return `"${String(value).replace(/"/g, '""')}"`;
        }
        return String(value);
      });
    });

  // Add warning rows if any transactions failed or rates were missing
  const warnings: string[][] = [];
  if (failedRates > 0) {
    warnings.push([
      `Warning: Exchange rates not available for ${failedRates} transaction(s). Using $0.00 as fallback.`,
      ...Array(headers.length - 1).fill('')
    ]);
  }

  const csvContent = [
    headers.join(','),
    ...warnings.map(row => row.join(',')),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Debug final CSV content
  console.log('First few rows of CSV:', csvContent.split('\n').slice(0, 5));

  try {
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const fileName = `rsc-transactions-${startDate}-to-${endDate}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error creating CSV file:', error);
    throw error;
  }
} 
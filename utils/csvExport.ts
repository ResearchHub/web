import { TransactionDTO } from '@/services/types/transaction.dto'

type TransactionType = 'Buy' | 'Sale' | 'Convert' | 'Transfer' | 'Income' | 
  'Expense' | 'Deposit' | 'Withdrawal' | 'Mining' | 'Airdrop' | 'Staking' | 'Other';

// Helper function to map our transaction types to TurboTax types
function mapTransactionType(tx: TransactionDTO): TransactionType {
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
function getTransactionDescription(tx: TransactionDTO): string {
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
function processTransaction(tx: TransactionDTO) {
  try {
    // Format date exactly as specified in TurboTax requirements
    const date = new Date(tx.created_date);
    const formattedDate = date.toISOString()
      .replace('T', ' ')
      .slice(0, 19);

    const txType = mapTransactionType(tx);
    const amount = Math.abs(parseFloat(tx.amount)).toFixed(8);

    let rowData: Record<string, string> = {
      Date: formattedDate,
      Type: txType,
      'Sent Asset': '',
      'Sent Amount': '',
      'Received Asset': '',
      'Received Amount': '',
      'Fee Asset': tx.fee != null ? 'RSC' : '',
      'Fee Amount': tx.fee != null ? tx.fee.toFixed(8) : '',
      'Market Value Currency': 'USD',
      'Market Value': '',
      Description: getTransactionDescription(tx),
      'Transaction Hash': tx.transaction_hash || '',
      'Transaction ID': '',
      'Raw Distribution Type': `${tx.readable_content_type || ''} | ${tx.source?.distribution_type || ''}`
    };

    // Populate sent/received fields based on transaction type
    switch (txType) {
      case 'Buy':
        rowData['Sent Asset'] = 'USD';
        rowData['Sent Amount'] = amount;
        rowData['Received Asset'] = 'RSC';
        rowData['Received Amount'] = amount;
        break;
      case 'Income':
      case 'Airdrop':
        rowData['Received Asset'] = 'RSC';
        rowData['Received Amount'] = amount;
        break;
      case 'Expense':
        rowData['Sent Asset'] = 'RSC';
        rowData['Sent Amount'] = amount;
        break;
      case 'Withdrawal':
        rowData['Sent Asset'] = 'RSC';
        rowData['Sent Amount'] = amount;
        break;
      case 'Deposit':
        rowData['Received Asset'] = 'RSC';
        rowData['Received Amount'] = amount;
        break;
      case 'Other':
        // Handle based on whether it's incoming or outgoing
        if (parseFloat(tx.amount) > 0) {
          rowData['Received Asset'] = 'RSC';
          rowData['Received Amount'] = amount;
        } else {
          rowData['Sent Asset'] = 'RSC';
          rowData['Sent Amount'] = amount;
        }
        break;
    }

    return rowData;
  } catch (error) {
    console.error('Error processing transaction:', error, tx);
    return undefined;
  }
}

export function exportTransactionsToCSV(
  transactions: TransactionDTO[], 
  startDate: string, 
  endDate: string
) {
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

  // Filter out any failed transaction processing
  const rows = transactions
    .map(tx => processTransaction(tx))
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

  // Add a warning row if any transactions failed
  const failedCount = transactions.length - rows.length;
  if (failedCount > 0) {
    const warningRow = [`Warning: ${failedCount} transaction(s) could not be processed`, ...Array(headers.length - 1).fill('')];
    rows.unshift(warningRow);
  }

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

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
} 
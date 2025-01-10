import { memo } from 'react';
import { TransactionListItem } from './TransactionListItem';
import type { TransactionAPIRequest } from '@/services/types/transaction.dto';

interface TransactionListProps {
  transactions: TransactionAPIRequest[];
  exchangeRate: number;
}

function TransactionListComponent({ transactions, exchangeRate }: TransactionListProps) {
  return (
    <div className="space-y-1">
      {transactions.map((transaction) => (
        <TransactionListItem
          key={transaction.id}
          transaction={transaction}
          exchangeRate={exchangeRate}
        />
      ))}
    </div>
  );
}

export const TransactionList = memo(TransactionListComponent); 
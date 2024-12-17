import { useState } from 'react';
import { TransactionDTO } from '@/services/types/transaction.dto';
import { TransactionItem } from './TransactionItem';
import { TransactionSkeleton } from './TransactionSkeleton';

interface TransactionListProps {
  transactions: TransactionDTO[];
  isLoading: boolean;
  error: string | null;
}

export function TransactionList({ transactions, isLoading, error }: TransactionListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleToggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (isLoading) {
    return <TransactionSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-4 text-gray-500">
        {error}
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {transactions.map((transaction, index) => (
        <div 
          key={`${transaction.id}-${index}`} 
          className="first:pt-0 pt-2"
        >
          <TransactionItem
            transaction={transaction}
            isExpanded={expandedId === transaction.id}
            onToggleExpand={handleToggleExpand}
          />
        </div>
      ))}
    </div>
  );
} 
import { useState } from 'react';
import { TransactionListItem } from './TransactionListItem';
import { TransactionSkeleton } from '@/components/skeletons/TransactionSkeleton';
interface TransactionListProps {
  transactions: any[];
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
          <TransactionListItem
            transaction={transaction}
            isExpanded={expandedId === transaction.id}
            onToggleExpand={handleToggleExpand}
          />
        </div>
      ))}
    </div>
  );
} 
'use client';

import { TransactionSkeleton } from '@/components/skeletons/TransactionSkeleton';
import { usePendingDeposits } from '@/hooks/usePendingDeposits';
import { PendingDepositItem } from './PendingDepositItem';
import { SectionCard } from './TransactionFeed';

const LOADING_SKELETON_COUNT = 2;

export function PendingDepositFeed() {
  const { deposits, isLoading } = usePendingDeposits();

  if (isLoading) {
    return (
      <SectionCard title="Pending Deposits">
        <div className="space-y-1">
          {[...Array(LOADING_SKELETON_COUNT)].map((_, index) => (
            <TransactionSkeleton key={index} />
          ))}
        </div>
      </SectionCard>
    );
  }

  if (deposits.length === 0) {
    return null;
  }

  return (
    <SectionCard title="Pending Deposits">
      <div className="space-y-1">
        {deposits.map((deposit) => (
          <PendingDepositItem key={deposit.id} deposit={deposit} />
        ))}
      </div>
    </SectionCard>
  );
}

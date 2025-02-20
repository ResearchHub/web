'use client';

import { useSession } from 'next-auth/react';

interface BalanceInfoProps {
  amount: number;
  showWarning?: boolean;
}

export function BalanceInfo({ amount, showWarning }: BalanceInfoProps) {
  const { data: session } = useSession();
  const userBalance = session?.user?.balance || 0;

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Current RSC Balance:</span>
        <span className="text-sm font-medium">{userBalance.toLocaleString()} RSC</span>
      </div>
      {showWarning && (
        <div className="mt-1 text-sm text-orange-600">
          {`You need ${(amount - userBalance).toLocaleString()} RSC more for this contribution`}
        </div>
      )}
    </div>
  );
}

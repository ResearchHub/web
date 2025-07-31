'use client';

import { useUser } from '@/contexts/UserContext';

interface BalanceInfoProps {
  amount: number;
  showWarning?: boolean;
  includeLockedBalance?: boolean;
}

export function BalanceInfo({
  amount,
  showWarning,
  includeLockedBalance = false,
}: BalanceInfoProps) {
  const { user } = useUser();
  const userBalance = user?.balance || 0;
  const lockedBalance = user?.lockedBalance || 0;
  const totalAvailableBalance = includeLockedBalance ? userBalance + lockedBalance : userBalance;

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Current RSC Balance:</span>
        <span className="text-sm font-medium">{totalAvailableBalance.toLocaleString()} RSC</span>
      </div>
      {showWarning && (
        <div className="mt-1 text-sm text-orange-600">
          {`You need ${(amount - totalAvailableBalance).toLocaleString()} RSC more for this contribution`}
        </div>
      )}
    </div>
  );
}

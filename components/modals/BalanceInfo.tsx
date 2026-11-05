'use client';

import { useUser } from '@/contexts/UserContext';
import { getAvailableAndPromotionalRscBalance } from '@/components/ResearchCoin/lib/promotionalBalance';

interface BalanceInfoProps {
  amount: number;
  showWarning?: boolean;
  includePromotionalBalance?: boolean;
}

export function BalanceInfo({
  amount,
  showWarning,
  includePromotionalBalance = false,
}: BalanceInfoProps) {
  const { user } = useUser();
  const totalAvailableBalance = includePromotionalBalance
    ? getAvailableAndPromotionalRscBalance(user)
    : (user?.balance ?? 0);

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

'use client';

import { useUser } from '@/contexts/UserContext';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { formatCurrency } from '@/utils/currency';

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
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const userBalance = user?.balance || 0;
  const lockedBalance = user?.lockedBalance || 0;
  const totalAvailableBalance = includeLockedBalance ? userBalance + lockedBalance : userBalance;

  const useUsd = showUSD && exchangeRate > 0;
  const primary = formatCurrency({ amount: totalAvailableBalance, showUSD: useUsd, exchangeRate });
  const secondary =
    exchangeRate > 0
      ? formatCurrency({ amount: totalAvailableBalance, showUSD: !useUsd, exchangeRate })
      : undefined;

  const deficit = amount - totalAvailableBalance;
  const deficitFormatted =
    deficit > 0 ? formatCurrency({ amount: deficit, showUSD: useUsd, exchangeRate }) : undefined;

  const primaryUnit = useUsd ? 'USD' : 'RSC';
  const primaryWithUnit = `${primary} ${primaryUnit}`;

  const secondaryUnit = useUsd ? 'RSC' : 'USD';
  const secondaryWithUnit = secondary ? `${secondary} ${secondaryUnit}` : undefined;

  const deficitWithUnit = deficitFormatted ? `${deficitFormatted} ${primaryUnit}` : undefined;

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Current RSC Balance:</span>
        <span className="text-sm font-medium">{primaryWithUnit}</span>
      </div>
      {secondaryWithUnit && (
        <div className="mt-1 text-xs text-gray-500 text-right">≈ {secondaryWithUnit}</div>
      )}
      {showWarning && deficitWithUnit && (
        <div className="mt-1 text-sm text-orange-600">
          {`You need ${deficitWithUnit} more for this contribution`}
        </div>
      )}
    </div>
  );
}

import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { formatRSC } from '@/utils/number';
import { cn } from '@/utils/styles';

interface BalanceDisplayProps {
  currentBalance: number;
  futureBalance: number;
  futureBalanceLabel: string;
  futureBalanceColor?: 'green' | 'red' | 'gray';
  showFutureBalance?: boolean;
}

export function BalanceDisplay({
  currentBalance,
  futureBalance,
  futureBalanceLabel,
  futureBalanceColor = 'gray',
  showFutureBalance = true,
}: BalanceDisplayProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Current Balance:</span>
        <div className="text-right flex items-center gap-2">
          <div className="flex items-center gap-2">
            <ResearchCoinIcon size={16} />
            <span className="text-sm font-semibold text-gray-900">
              {formatRSC({ amount: currentBalance })}
            </span>
            <span className="text-sm text-gray-500">RSC</span>
          </div>
        </div>
      </div>

      {showFutureBalance && (
        <>
          <div className="my-2 border-t border-gray-200" />
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{futureBalanceLabel}:</span>
            <div className="text-right flex items-center gap-2">
              <div className="flex items-center gap-2">
                <ResearchCoinIcon size={16} />
                <span
                  className={cn(
                    'text-sm font-semibold',
                    futureBalanceColor === 'green' && 'text-green-600',
                    futureBalanceColor === 'red' && 'text-red-600',
                    futureBalanceColor === 'gray' && 'text-gray-900'
                  )}
                >
                  {formatRSC({ amount: futureBalance })}
                </span>
                <span className="text-sm text-gray-500">RSC</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

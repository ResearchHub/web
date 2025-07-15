import type { FormattedTransaction } from './lib/types';
import Icon from '@/components/ui/icons/Icon';
import { cn } from '@/utils/styles';
import { colors } from '@/app/styles/colors';
import { Lock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface TransactionFeedItemProps {
  transaction: FormattedTransaction;
}

export function TransactionFeedItem({ transaction }: TransactionFeedItemProps) {
  const { icon } = transaction.typeInfo;

  // Use consistent neutral gray color for all icons
  const iconColor = colors.gray[600];

  return (
    <div className="group">
      <div className="relative py-3 rounded-lg px-4 -mx-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-3 w-full">
            <div className="w-[38px] h-[38px] flex items-center justify-center rounded-full bg-gray-50">
              <Icon name={icon} size={18} color={iconColor} />
            </div>

            <div className="flex-1">
              <div className="flex flex-col sm:!flex-row items-start sm:!items-center gap-2">
                <p className="font-medium text-gray-900">{transaction.typeInfo.label}</p>
              </div>
              <div className="text-xs text-gray-600 mt-0.5">{transaction.formattedDate}</div>
            </div>

            <div className="flex flex-col items-end min-w-0 sm:!min-w-[140px]">
              <div className="flex items-center justify-end w-full">
                <div className="flex flex-col items-end">
                  <span
                    className={cn(
                      'text-base font-medium truncate',
                      transaction.isPositive ? 'text-green-600' : 'text-gray-900',
                      transaction.isLocked && 'text-gray-500'
                    )}
                  >
                    {transaction.formattedAmount}
                  </span>
                  <span className="text-xs text-gray-500 truncate">
                    {transaction.formattedUsdValue}
                  </span>
                  {transaction.isLocked && (
                    <Badge variant="orange" size="sm" className="mt-1 flex items-center gap-1">
                      <Lock size={14} className="inline" /> Locked
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

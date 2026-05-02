import type { FormattedTransaction } from './lib/types';
import Icon from '@/components/ui/icons/Icon';
import { cn } from '@/utils/styles';
import { colors } from '@/app/styles/colors';
import { Badge } from '@/components/ui/Badge';
import { FundingCreditsTooltip } from '@/components/tooltips/FundingCreditsTooltip';

interface TransactionFeedItemProps {
  transaction: FormattedTransaction;
}

export function TransactionFeedItem({ transaction }: TransactionFeedItemProps) {
  const { icon, iconComponent: IconComponent } = transaction.typeInfo;

  // Use consistent neutral gray color for all icons
  const iconColor = colors.gray[600];

  return (
    <div className="group">
      <div className="relative py-3 rounded-lg px-4 -mx-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-3 w-full">
            <div className="w-[38px] h-[38px] flex items-center justify-center rounded-full bg-gray-50">
              {IconComponent ? (
                <IconComponent size={18} color={iconColor} />
              ) : (
                <Icon name={icon} size={18} color={iconColor} />
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-col sm:!flex-row items-start sm:!items-center gap-2">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">{transaction.typeInfo.label}</p>
                  {transaction.isLocked && !transaction.typeInfo.hideLockedBadge && (
                    <FundingCreditsTooltip>
                      <Badge
                        variant="primary"
                        size="default"
                        className="bg-blue-100 text-blue-700 border-0 font-normal px-2.5 py-0.5 cursor-help"
                      >
                        Funding only
                      </Badge>
                    </FundingCreditsTooltip>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-600 mt-0.5">{transaction.formattedDate}</div>
            </div>

            <div className="flex flex-col items-end min-w-0 sm:!min-w-[140px]">
              <div className="flex items-center justify-end w-full">
                <div className="flex flex-col items-end">
                  <span
                    className={cn(
                      'text-base font-medium truncate',
                      transaction.typeInfo.label === 'Deposit' ? 'text-green-600' : 'text-gray-900'
                    )}
                  >
                    {transaction.formattedAmount}
                  </span>
                  <span className="text-xs text-gray-500 truncate">
                    {transaction.formattedUsdValue}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

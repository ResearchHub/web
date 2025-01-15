import type { TransformedTransaction } from '@/services/transaction.service';

interface TransactionFeedItemProps {
  transaction: TransformedTransaction;
}

export function TransactionFeedItem({ transaction }: TransactionFeedItemProps) {
  const Icon = transaction.typeInfo.icon;

  return (
    <div className="group">
      <div className="relative py-3 transition-all duration-200 rounded-lg px-4 -mx-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-3 w-full">
            <div className="w-[38px] h-[38px] flex items-center justify-center rounded-full bg-gray-50">
              <Icon className="h-4 w-4 text-gray-600" strokeWidth={2} />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900">{transaction.typeInfo.label}</p>
              </div>
              <div className="text-xs text-gray-600 mt-0.5">
                {transaction.formattedDate}
              </div>
            </div>

            <div className="flex flex-col items-end min-w-[140px]">
              <div className="flex items-center justify-end w-full">
                <div className="flex flex-col items-end">
                  <span className={`
                    text-base font-medium transition-colors duration-200
                    ${transaction.isPositive ? 'text-green-600 group-hover:text-green-700' : 'text-gray-900'}
                  `}>
                    {transaction.formattedAmount}
                  </span>
                  <span className="text-xs text-gray-500 group-hover:text-gray-600">
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
import Link from 'next/link';
import type { FormattedTransaction } from './lib/types'; // Import the enhanced type
import { Avatar } from '@/components/ui/Avatar';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';

interface TransactionFeedItemProps {
  transaction: FormattedTransaction;
}

export function TransactionFeedItem({ transaction }: TransactionFeedItemProps) {
  const Icon = transaction.typeInfo.icon;

  const GiverInfo = () => {
    if (!transaction.giverInfo) return null;

    // Ensure giver ID is a valid number for AuthorTooltip/Avatar
    const giverIdAsNumber =
      typeof transaction.giverInfo.id === 'number' ? transaction.giverInfo.id : undefined;

    // If ID is not a valid number, don't render the giver info
    if (giverIdAsNumber === undefined) {
      console.warn('Giver ID is not a valid number:', transaction.giverInfo.id);
      return null;
    }

    // Placeholder alt text until tooltip loads real name
    const altText = `User ${giverIdAsNumber}`;

    return (
      <span className="text-xs text-gray-500 ml-1 inline-flex items-center gap-1">
        by
        <AuthorTooltip authorId={giverIdAsNumber}>
          {/* Wrap both Avatar and a subtle link inside the tooltip trigger */}
          <Link
            href={transaction.giverInfo.url}
            className="inline-flex items-center gap-1 hover:text-indigo-600 group/giver"
            onClick={(e) => e.stopPropagation()} // Prevent click from propagating to content link if nested
          >
            <Avatar authorId={giverIdAsNumber} alt={altText} size="xxs" />
            <span className="group-hover/giver:underline">{altText}</span>
          </Link>
        </AuthorTooltip>
      </span>
    );
  };

  const LabelContent = () => (
    <>
      {transaction.typeInfo.label}
      <GiverInfo />
    </>
  );

  return (
    <div className="group">
      <div className="relative py-3 transition-all duration-200 rounded-lg px-4 -mx-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-3 w-full">
            <div className="w-[38px] h-[38px] flex items-center justify-center rounded-full bg-gray-50">
              <Icon className="h-4 w-4 text-gray-600" strokeWidth={2} />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-1 flex-wrap">
                {' '}
                {/* Allow wrapping */}
                <p className="font-medium text-gray-900">
                  {transaction.contentUrl ? (
                    <Link
                      href={transaction.contentUrl}
                      className="hover:text-indigo-600 hover:underline"
                    >
                      <LabelContent />
                    </Link>
                  ) : (
                    <LabelContent />
                  )}
                </p>
              </div>
              <div className="text-xs text-gray-600 mt-0.5">{transaction.formattedDate}</div>
            </div>

            <div className="flex flex-col items-end min-w-[140px]">
              <div className="flex items-center justify-end w-full">
                <div className="flex flex-col items-end">
                  <span
                    className={`
                    text-base font-medium transition-colors duration-200
                    ${transaction.isPositive ? 'text-green-600 group-hover:text-green-700' : 'text-gray-900'}
                  `}
                  >
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

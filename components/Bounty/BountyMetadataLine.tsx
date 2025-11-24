import { formatDeadline } from '@/utils/date';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { RadiatingDot } from '@/components/ui/RadiatingDot';
import { ContentTypeBadge } from '@/components/ui/ContentTypeBadge';
import { Check, Clock, XCircle } from 'lucide-react';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { Tooltip } from '@/components/ui/Tooltip';
interface BountyMetadataLineProps {
  amount: number;
  expirationDate?: string;
  reviewPeriodEndDate?: string;
  status: 'OPEN' | 'CLOSED' | 'REVIEW_PERIOD' | 'EXPIRED' | 'CANCELLED';
  expiringSoon: boolean;
  className?: string;
  solutionsCount?: number;
  showDeadline?: boolean;
}

export const BountyMetadataLine = ({
  amount,
  expirationDate,
  reviewPeriodEndDate,
  status,
  expiringSoon,
  className = '',
  showDeadline = true,
}: BountyMetadataLineProps) => {
  const { showUSD } = useCurrencyPreference();

  const isOpen = status === 'OPEN';
  const isActive = status === 'OPEN' || status === 'REVIEW_PERIOD';

  const getDeadlineText = () => {
    switch (status) {
      case 'OPEN':
        return expirationDate ? formatDeadline(expirationDate) : 'No deadline';
      case 'REVIEW_PERIOD':
        if (reviewPeriodEndDate) {
          const deadline = formatDeadline(reviewPeriodEndDate);

          const reviewTransformations: Record<string, string | ((match: string) => string)> = {
            Ended: 'Review ended',
            'Ended today': 'Review ended today',
            'Ends today': 'Review ends today',
            'Ends tomorrow': 'Review ends tomorrow',
            'Ends in less than an hour': 'Review ends in less than an hour',
          };

          if (reviewTransformations[deadline]) {
            return reviewTransformations[deadline] as string;
          }

          const patterns: Array<[RegExp, (match: RegExpMatchArray) => string]> = [
            [/(\d+) days left/, (match) => `Review ends in ${match[1]} days`],
            [/^Ends in (\d+ hours?)$/, (match) => `Review ends in ${match[1]}`],
            [/^Ends (.+)$/, (match) => `Review ends ${match[1]}`],
          ];

          for (const [pattern, transform] of patterns) {
            const match = deadline.match(pattern);
            if (match) {
              return transform(match);
            }
          }

          return `Review ${deadline.toLowerCase()}`;
        }
        return 'Under Review';
      case 'CLOSED':
        return 'Completed';
      case 'EXPIRED':
        return 'Bounty Ended';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return 'Completed';
    }
  };

  const deadlineText = getDeadlineText();

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Badges and date in one row */}
      <div className="flex justify-between items-center w-full">
        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <ContentTypeBadge type="bounty" />
          <CurrencyBadge
            amount={amount}
            size="sm"
            variant={isOpen ? 'badge' : 'disabled'}
            currency={showUSD ? 'USD' : 'RSC'}
          />
        </div>

        {showDeadline && (
          <div className="flex items-center gap-2 text-sm">
            {isActive ? (
              <RadiatingDot
                size={12}
                dotSize={6}
                isRadiating={isActive}
                className="flex-shrink-0"
              />
            ) : status === 'EXPIRED' ? (
              <XCircle size={14} className="text-gray-500 flex-shrink-0" />
            ) : (
              <Check size={14} className="text-green-600 flex-shrink-0" />
            )}
            {status === 'REVIEW_PERIOD' ? (
              <Tooltip
                content={
                  <div className="flex items-start gap-3 text-left">
                    <div className="bg-orange-100 p-2 rounded-md flex items-center justify-center">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      Bounty creators get extra time after the deadline to review submissions and
                      award funds.
                    </div>
                  </div>
                }
                position="top"
                width="w-[360px]"
              >
                <span
                  className={`${isActive ? (expiringSoon ? 'text-orange-600 font-medium' : 'text-gray-700') : status === 'EXPIRED' ? 'text-gray-500' : 'text-green-700 font-medium'} cursor-help underline decoration-dotted underline-offset-2`}
                >
                  {deadlineText}
                </span>
              </Tooltip>
            ) : (
              <span
                className={`${isActive ? (expiringSoon ? 'text-orange-600 font-medium' : 'text-gray-700') : status === 'EXPIRED' ? 'text-gray-500' : 'text-green-700 font-medium'}`}
              >
                {deadlineText}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

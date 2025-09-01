import { formatDeadline } from '@/utils/date';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { RadiatingDot } from '@/components/ui/RadiatingDot';
import { ContentTypeBadge } from '@/components/ui/ContentTypeBadge';
import { Check } from 'lucide-react';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';

interface BountyMetadataLineProps {
  amount?: number;
  expirationDate?: string;
  isOpen: boolean;
  expiringSoon: boolean;
  className?: string;
  solutionsCount?: number;
  showDeadline?: boolean;
  showAmount?: boolean;
}

export const BountyMetadataLine = ({
  amount,
  expirationDate,
  isOpen,
  expiringSoon,
  className = '',
  showDeadline = true,
  showAmount = true,
}: BountyMetadataLineProps) => {
  const { showUSD } = useCurrencyPreference();
  // Format the deadline text
  const deadlineText = isOpen
    ? expirationDate
      ? formatDeadline(expirationDate)
      : 'No deadline'
    : 'Completed';

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Badges and date in one row */}
      <div className="flex justify-between items-center w-full">
        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <ContentTypeBadge type="bounty" />
          {showAmount && amount !== undefined && (
            <CurrencyBadge
              amount={amount}
              size="sm"
              variant={isOpen ? 'badge' : 'disabled'}
              currency={showUSD ? 'USD' : 'RSC'}
            />
          )}
        </div>

        {showDeadline && (
          <div className="flex items-center gap-2 text-sm">
            {isOpen ? (
              <RadiatingDot size={12} dotSize={6} isRadiating={isOpen} className="flex-shrink-0" />
            ) : (
              <Check size={14} className="text-green-600 flex-shrink-0" />
            )}
            <span
              className={`${isOpen ? (expiringSoon ? 'text-orange-600 font-medium' : 'text-gray-700') : 'text-green-700 font-medium'}`}
            >
              {deadlineText}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

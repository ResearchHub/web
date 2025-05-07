import { formatDeadline } from '@/utils/date';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { RadiatingDot } from '@/components/ui/RadiatingDot';
import { ContentTypeBadge } from '@/components/ui/ContentTypeBadge';
import { Check } from 'lucide-react';

interface BountyMetadataLineProps {
  amount: number;
  expirationDate?: string;
  isOpen: boolean;
  expiringSoon: boolean;
  className?: string;
  solutionsCount?: number;
}

export const BountyMetadataLine = ({
  amount,
  expirationDate,
  isOpen,
  expiringSoon,
  className = '',
}: BountyMetadataLineProps) => {
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
          <CurrencyBadge amount={amount} size="sm" variant={isOpen ? 'badge' : 'disabled'} />
        </div>

        {/* Deadline with RadiatingDot or Check icon */}
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
      </div>
    </div>
  );
};

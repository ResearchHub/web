import { formatDeadline } from '@/utils/date';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { RadiatingDot } from '@/components/ui/RadiatingDot';
import { ContentTypeBadge } from '@/components/ui/ContentTypeBadge';
import { Check, XCircle } from 'lucide-react';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { BountyStatus } from '@/types/bounty';

interface BountyMetadataLineProps {
  amount: number;
  expirationDate?: string;
  isOpen: boolean;
  expiringSoon: boolean;
  className?: string;
  solutionsCount?: number;
  showDeadline?: boolean;
  bountyStatus?: BountyStatus;
  /**
   * If true, the amount is already in the target currency and should not be converted.
   * Useful when the caller has pre-calculated the amount (e.g., Foundation bounty flat fee).
   */
  skipConversion?: boolean;
}

export const BountyMetadataLine = ({
  amount,
  expirationDate,
  isOpen,
  expiringSoon,
  className = '',
  showDeadline = true,
  bountyStatus,
  skipConversion = false,
}: BountyMetadataLineProps) => {
  const { showUSD } = useCurrencyPreference();

  // Helper to determine the deadline text
  const getDeadlineText = () => {
    if (bountyStatus === 'ASSESSMENT') return 'Assessment Period';
    if (bountyStatus === 'EXPIRED') return 'Expired';
    if (bountyStatus === 'CANCELLED') return 'Cancelled';
    if (isOpen) {
      return expirationDate ? formatDeadline(expirationDate) : 'No deadline';
    }
    return 'Completed';
  };

  const deadlineText = getDeadlineText();
  const isInactive = bountyStatus === 'EXPIRED' || bountyStatus === 'CANCELLED';

  // Helper to determine the status icon
  const renderStatusIcon = () => {
    if (isOpen) {
      return <RadiatingDot size={12} dotSize={6} isRadiating={isOpen} className="flex-shrink-0" />;
    }
    if (isInactive) {
      return <XCircle size={14} className="text-gray-400 flex-shrink-0" />;
    }
    return <Check size={14} className="text-green-600 flex-shrink-0" />;
  };

  // Helper to determine the status text color
  const getStatusColorClass = () => {
    if (isOpen) {
      return expiringSoon ? 'text-orange-600 font-medium' : 'text-gray-700';
    }
    if (isInactive) {
      return 'text-gray-500 italic';
    }
    return 'text-green-700 font-medium';
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Badges and date in one row */}
      <div className="flex justify-between items-center w-full">
        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <ContentTypeBadge type="bounty" className={isInactive ? 'opacity-50' : ''} />
          <CurrencyBadge
            amount={amount}
            size="sm"
            variant={isOpen ? 'badge' : 'disabled'}
            currency={showUSD ? 'USD' : 'RSC'}
            skipConversion={skipConversion}
            className={isInactive ? 'grayscale opacity-60' : ''}
          />
        </div>

        {showDeadline && (
          <div className="flex items-center gap-2 text-sm">
            {renderStatusIcon()}
            <span className={getStatusColorClass()}>{deadlineText}</span>
          </div>
        )}
      </div>
    </div>
  );
};

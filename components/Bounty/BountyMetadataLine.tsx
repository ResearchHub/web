import { formatDeadline } from '@/utils/date';
import { RSCBadge } from '@/components/ui/RSCBadge';
import { RadiatingDot } from '@/components/ui/RadiatingDot';
import { ContentTypeBadge } from '@/components/ui/ContentTypeBadge';

interface BountyMetadataLineProps {
  bountyType?: string;
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
          <RSCBadge amount={amount} size="sm" />
        </div>

        {/* Deadline with RadiatingDot */}
        <div className="flex items-center gap-2 text-sm">
          <RadiatingDot size={12} dotSize={6} isRadiating={isOpen} className="flex-shrink-0" />
          <span className={`${expiringSoon ? 'text-orange-600 font-medium' : 'text-gray-700'}`}>
            {deadlineText}
          </span>
          {expiringSoon && (
            <span className="text-xs font-medium bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">
              Expiring Soon
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

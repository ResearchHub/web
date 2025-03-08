import { Clock, Coins, Star, Trophy } from 'lucide-react';
import { formatDeadline } from '@/utils/date';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faClock } from '@fortawesome/pro-light-svg-icons';
import { Badge } from '@/components/ui/Badge';
import { RSCBadge } from '@/components/ui/RSCBadge';

interface BountyMetadataLineProps {
  bountyType?: string;
  amount: number;
  expirationDate?: string;
  isOpen: boolean;
  expiringSoon: boolean;
  className?: string;
}

export const BountyMetadataLine = ({
  bountyType,
  amount,
  expirationDate,
  isOpen,
  expiringSoon,
  className = '',
}: BountyMetadataLineProps) => {
  // Format the bounty type for display
  const getBountyTypeDisplay = (type?: string) => {
    if (!type) return 'Bounty';

    switch (type) {
      case 'REVIEW':
        return 'Peer Review Bounty';
      case 'QUESTION':
        return 'Question Bounty';
      case 'GENERAL':
        return 'General Bounty';
      default:
        return `${type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()} Bounty`;
    }
  };

  // Format the deadline text
  const deadlineText = isOpen
    ? expirationDate
      ? formatDeadline(expirationDate)
      : 'No deadline'
    : 'Completed';

  // Determine badge variant based on bounty type
  const getBadgeVariant = () => {
    if (bountyType === 'REVIEW') return 'bounty';
    return 'default';
  };

  // Determine badge size based on bounty type
  const getBadgeSize = () => {
    if (bountyType === 'REVIEW') return 'sm';
    return 'default';
  };

  return (
    <div
      className={`flex justify-between items-center text-[15px] flex-wrap font-normal ${className}`}
    >
      {/* Bounty Type with appropriate icon - using Badge component */}
      <div className="flex items-center gap-2">
        <Badge
          variant={getBadgeVariant()}
          size={getBadgeSize()}
          className="flex items-center gap-1.5 px-2.5 py-1"
        >
          <Trophy className="h-3.5 w-3.5 text-gray-500" />
          <span className="font-medium text-xs">{getBountyTypeDisplay(bountyType)}</span>
        </Badge>
        <RSCBadge
          amount={amount}
          variant="badge"
          size="md"
          label="RSC"
          showText={true}
          showExchangeRate={true}
        />
      </div>

      {/* Deadline and RSC amount */}
      <div className="flex items-center gap-3">
        {/* Deadline */}
        <div className="flex items-center gap-2">
          <FontAwesomeIcon
            icon={faClock}
            className={`h-4 w-4 ${expiringSoon ? 'text-orange-600' : 'text-gray-600'}`}
          />
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

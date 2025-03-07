import { Clock, Star } from 'lucide-react';
import { formatDeadline } from '@/utils/date';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faClock } from '@fortawesome/pro-solid-svg-icons';

interface BountyMetadataLineProps {
  bountyType?: string;
  amount: number;
  expirationDate?: string;
  isOpen: boolean;
  expiringSoon: boolean;
}

export const BountyMetadataLine = ({
  bountyType,
  amount,
  expirationDate,
  isOpen,
  expiringSoon,
}: BountyMetadataLineProps) => {
  // Format the bounty type for display
  const getBountyTypeDisplay = (type?: string) => {
    if (!type) return 'Bounty';

    switch (type) {
      case 'REVIEW':
        return 'Peer Review';
      case 'QUESTION':
        return 'Question';
      case 'GENERAL':
        return 'General';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    }
  };

  return (
    <div className="flex items-center text-[15px] text-gray-700 gap-5 flex-wrap font-normal">
      {/* Bounty Type with appropriate icon */}
      <div className="flex items-center gap-2.5">
        {bountyType === 'REVIEW' ? (
          <Star className="h-4 w-4 text-gray-600 fill-gray-600" />
        ) : (
          <FontAwesomeIcon icon={faTrophy} className="h-4 w-4 text-gray-600" />
        )}
        <span className="text-gray-700">{getBountyTypeDisplay(bountyType)} bounty</span>
      </div>

      <span className="text-gray-400 font-normal">•</span>

      {/* Deadline */}
      <div className="flex items-center gap-2.5">
        <FontAwesomeIcon icon={faClock} className="h-4 w-4 text-gray-600" />
        <span className={`${expiringSoon ? 'text-orange-600' : 'text-gray-700'}`}>
          {isOpen ? (expirationDate ? formatDeadline(expirationDate) : 'No deadline') : 'Completed'}
          {expiringSoon && (
            <span className="ml-1 text-xs font-medium bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">
              Expiring Soon
            </span>
          )}
        </span>
      </div>

      <span className="text-gray-400 font-normal">•</span>

      {/* RSC Amount - moved to the end */}
      <div className="flex items-center gap-1.5">
        <ResearchCoinIcon size={16} color="#F97316" />
        <span className="text-orange-500">{amount} RSC</span>
      </div>
    </div>
  );
};

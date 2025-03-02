import { Contributor } from '@/components/Bounty/lib/bountyUtil';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy } from '@fortawesome/pro-light-svg-icons';
import { Clock } from 'lucide-react';
import { formatDeadline } from '@/utils/date';
import { formatContributorNames } from '@/components/Bounty/lib/bountyUtil';

interface BountyMetadataProps {
  contributors: Contributor[];
  expirationDate?: string;
  isOpen: boolean;
  expiringSoon: boolean;
  onShowContributors: () => void;
}

export const BountyMetadata = ({
  contributors,
  expirationDate,
  isOpen,
  expiringSoon,
  onShowContributors,
}: BountyMetadataProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Left column - Created by */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faTrophy} className="h-3.5 w-3.5 text-gray-600" />
          <div className="text-sm font-semibold text-gray-600">Created by</div>
        </div>
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <AvatarStack
              items={contributors.map(({ profile }) => ({
                src: profile.profileImage || '',
                alt: profile.fullName,
                tooltip: profile.fullName,
              }))}
              size="xs"
              maxItems={3}
              spacing={-8}
            />
            <button
              onClick={onShowContributors}
              className="text-sm -mt-2 text-gray-700 hover:text-gray-900 hover:underline"
            >
              {formatContributorNames(contributors)}
            </button>
          </div>
        </div>
      </div>

      {/* Right column - Deadline */}
      <div
        className={`bg-gray-50 p-4 rounded-lg ${expiringSoon ? 'border border-orange-300' : ''}`}
      >
        <div className="flex items-center gap-2">
          <Clock className={`h-3.5 w-3.5 ${expiringSoon ? 'text-orange-500' : 'text-gray-600'}`} />
          <div
            className={`text-sm font-semibold ${expiringSoon ? 'text-orange-700' : 'text-gray-600'}`}
          >
            Deadline
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-gray-700">
          <span className={`text-sm ${expiringSoon ? 'font-medium text-orange-600' : ''}`}>
            {isOpen
              ? expirationDate
                ? formatDeadline(expirationDate)
                : 'No deadline'
              : 'Completed'}
          </span>
          {expiringSoon && (
            <span className="ml-1 text-xs font-medium bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">
              Expiring Soon
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

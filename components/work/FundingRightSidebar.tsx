import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { Eye, MessageSquare, Star } from 'lucide-react';
import { FundraiseStats } from '@/components/FundraiseStats';
interface FundingRightSidebarProps {
  work: Work;
  metadata: WorkMetadata;
}

export const FundingRightSidebar = ({ work, metadata }: FundingRightSidebarProps) => {
  return (
    <div className="p-4">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">Funding Progress</h2>

      {metadata.fundraising && <FundraiseStats fundraise={metadata.fundraising} />}

      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Review Score</span>
          </div>
          <span className="text-sm font-medium text-gray-900">{work.metrics.reviewScore}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Comments</span>
          </div>
          <span className="text-sm font-medium text-gray-900">{work.metrics.comments}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Reviews</span>
          </div>
          <span className="text-sm font-medium text-gray-900">{work.metrics.reviews}</span>
        </div>
      </div>
    </div>
  );
};

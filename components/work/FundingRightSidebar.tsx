import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { Eye, MessageSquare, Star } from 'lucide-react';

interface FundingRightSidebarProps {
  work: Work;
  metadata: WorkMetadata;
}

export const FundingRightSidebar = ({ work, metadata }: FundingRightSidebarProps) => {
  return (
    <div className="p-4">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">Funding Progress</h2>

      {metadata.fundraising && (
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                ${metadata.fundraising.amountRaised.usd.toLocaleString()}
              </span>
              <span className="text-gray-600">
                ${metadata.fundraising.goalAmount.usd.toLocaleString()}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full"
                style={{
                  width: `${(metadata.fundraising.amountRaised.usd / metadata.fundraising.goalAmount.usd) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Contributors */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Contributors</span>
              <span className="text-sm font-medium text-gray-900">
                {metadata.fundraising.contributors.numContributors}
              </span>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Status</span>
            <span className="text-sm font-medium text-gray-900">{metadata.fundraising.status}</span>
          </div>
        </div>
      )}

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

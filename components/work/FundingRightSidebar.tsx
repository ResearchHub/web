import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { Eye, Link2, MessageSquare, Star } from 'lucide-react';
import { FundraiseStats } from '@/components/FundraiseStats';
import Link from 'next/link';
interface FundingRightSidebarProps {
  work: Work;
  metadata: WorkMetadata;
}

export const FundingRightSidebar = ({ work, metadata }: FundingRightSidebarProps) => {
  return (
    <div className="p-4">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">Funding Progress</h2>

      {metadata.fundraising && <FundraiseStats fundraise={metadata.fundraising} />}

      <div className="mt-8 mb-8 space-y-4">
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
      {/* TODO: Should not we reuse the existing WorkRightSidebar? adding DOI here manually */}
      {/* DOI Section */}
      {work.doi && (
        <section>
          <div className="flex items-center space-x-2 mb-4">
            <Link2 className="h-5 w-5 text-gray-500" />
            <h2 className="text-base font-semibold text-gray-900">DOI</h2>
          </div>
          <Link
            href={`https://doi.org/${work.doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
          >
            <span>{work.doi}</span>
          </Link>
        </section>
      )}
    </div>
  );
};

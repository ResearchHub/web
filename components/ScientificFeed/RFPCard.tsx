'use client';

import { AvatarStack } from '@/components/ui/AvatarStack';
import { FeedCardBase } from './FeedCardBase';
import { RFPCard as RFPCardType } from '@/data/mockFeedData';
import { Button } from '@/components/ui/Button';

interface RFPCardProps {
  rfp: RFPCardType;
}

export function RFPCard({ rfp }: RFPCardProps) {
  const formatAuthors = (authors: RFPCardType['authors']) => {
    if (authors.length === 0) return '';
    if (authors.length === 1) return `${authors[0].firstName} ${authors[0].lastName}`;
    if (authors.length === 2)
      return `${authors[0].firstName} ${authors[0].lastName}, ${authors[1].firstName} ${authors[1].lastName}`;
    if (authors.length === 3)
      return `${authors[0].firstName} ${authors[0].lastName}, ${authors[1].firstName} ${authors[1].lastName} … ${authors[2].firstName} ${authors[2].lastName}`;

    const first = authors[0];
    const second = authors[1];
    const third = authors[2];
    return `${first.firstName} ${first.lastName}, ${second.firstName} ${second.lastName} … ${third.firstName} ${third.lastName}`;
  };

  return (
    <FeedCardBase
      comments={rfp.comments}
      bookmarked={rfp.bookmarked}
      // engagedUsers={rfp.engagedUsers}
    >

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2 leading-snug">{rfp.title}</h3>

      {/* Institution */}
      {rfp.institution && (
        <div className="text-sm text-gray-600 mb-2">{rfp.institution}</div>
      )}

      {/* Authors & Date */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="text-sm text-gray-800">{formatAuthors(rfp.authors)}</span>
        <span className="text-gray-400">•</span>
        <span className="text-sm text-gray-500">{rfp.createdDate}</span>
      </div>

      {/* RFP Details Callout */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs text-gray-600 mb-1">Total Budget</div>
            <div className="text-xl font-bold text-gray-900">
              ${(rfp.budget / 1000000).toFixed(1)}M
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-600 mb-1">Deadline</div>
            <div className="text-sm font-semibold text-gray-900">{rfp.deadline}</div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-blue-200 pt-2">
          <div className="flex items-center justify-between">
            {/* Applicants */}
            <div className="flex items-center gap-2">
              {rfp.applicants.length > 0 && (
                <>
                  <AvatarStack
                    items={rfp.applicants.map((a) => ({
                      src: a.avatar,
                      alt: a.name,
                      tooltip: a.name,
                    }))}
                    size="xs"
                    maxItems={6}
                    showExtraCount
                    spacing={-6}
                  />
                  <span className="text-xs text-gray-700">
                    {rfp.applicants.length}{' '}
                    {rfp.applicants.length === 1 ? 'applicant' : 'applicants'}
                  </span>
                </>
              )}
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-2">
              <Button size="md" variant="outlined">
                Details
              </Button>
              <Button size="md" variant="default">
                Apply
              </Button>
            </div>
          </div>
        </div>
      </div>
    </FeedCardBase>
  );
}


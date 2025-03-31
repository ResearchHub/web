'use client';

import { FC } from 'react';
import { cn } from '@/utils/styles';
import { ReviewerAvatar } from './ReviewerAvatar';
import { ReviewStatus } from '@/store/authorStore';

export interface Reviewer {
  id: number | null;
  name: string;
  image: string | null;
  status: ReviewStatus;
  comment?: string;
  date?: string;
}

interface ReviewerBadgeProps {
  reviewers: Reviewer[];
  className?: string;
}

export const ReviewerBadge: FC<ReviewerBadgeProps> = ({ reviewers, className }) => {
  if (reviewers.length === 0) {
    return null;
  }

  return (
    <div className={cn('mt-2', className)}>
      <div className="flex flex-col space-y-2">
        <div className="flex space-x-2">
          {reviewers.map((reviewer, index) => {
            const tooltipContent = (
              <div className="text-left">
                <div className="font-medium mb-1">{reviewer.name}</div>
                <div className="text-xs mb-2">
                  {getStatusText(reviewer.status)}
                  {reviewer.date && ` • ${reviewer.date}`}
                </div>
                {reviewer.comment && (
                  <div className="text-xs italic border-l-2 border-gray-300 pl-2 mt-1">
                    "{reviewer.comment}"
                  </div>
                )}
              </div>
            );

            return (
              <ReviewerAvatar
                key={index}
                src={reviewer.image}
                name={reviewer.name}
                status={reviewer.status}
                authorId={reviewer.id || undefined}
                tooltipContent={tooltipContent}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Helper function to get status text
function getStatusText(status: ReviewStatus): string {
  switch (status) {
    case 'approved':
      return 'Approved';
    case 'needs_changes':
      return 'Requested Changes';
    case 'rejected':
      return 'Rejected';
    case 'pending':
      return 'Review in Progress';
    case 'unassigned':
      return 'Waiting for Assignment';
    default:
      return 'Unknown Status';
  }
}

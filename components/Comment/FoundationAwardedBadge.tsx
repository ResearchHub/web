'use client';

import { FC } from 'react';
import { CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';

interface FoundationAwardedBadgeProps {
  isAssessed?: boolean;
  authorUserId?: number | string;
}

/** "Awarded" on a peer review the Foundation editors approved; the AI reviewer's never count. */
export const FoundationAwardedBadge: FC<FoundationAwardedBadgeProps> = ({
  isAssessed,
  authorUserId,
}) => {
  const aiReviewUserId = process.env.NEXT_PUBLIC_AI_REVIEW_USER_ID;
  const isAiReviewer = aiReviewUserId != null && String(authorUserId ?? '') === aiReviewUserId;
  if (!isAssessed || isAiReviewer) return null;

  return (
    <Tooltip
      content={
        <div className="flex items-start gap-3 text-left">
          <CheckCircle className="h-10 w-10 text-green-600" />
          <div>Reviewed and approved by the ResearchHub Foundation Editor Team.</div>
        </div>
      }
      position="top"
      width="w-[320px]"
    >
      <Badge variant="success" className="cursor-pointer gap-1.5 border-green-600 py-1">
        <CheckCircle className="h-4 w-4" />
        Awarded
      </Badge>
    </Tooltip>
  );
};

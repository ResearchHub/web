'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Bot, ChevronRight } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation, faCircleCheck } from '@fortawesome/pro-solid-svg-icons';
import { SidebarHeader } from '@/components/ui/SidebarHeader';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { cn } from '@/utils/styles';
import { useAIReviewMock } from './AIReviewMockContext';
import { totalIssueCount, issueLabel } from './scoring';
import { reviewersFromIds } from './collectReviewers';

interface AIReviewSidebarSectionProps {
  reviewsUrl: string;
  className?: string;
}

export function AIReviewSidebarSection({ reviewsUrl, className }: AIReviewSidebarSectionProps) {
  const { data } = useAIReviewMock();

  const totalIssues = totalIssueCount(data.categories);
  const { consensusReview } = data;

  const reviewerAvatars = useMemo(() => {
    const reviewers = reviewersFromIds(consensusReview.reviewerIds, data.reviewers);
    return reviewers.map((r) => ({
      src: r.profileImage || '',
      alt: r.fullName,
      authorId: r.authorProfileId,
      tooltip: r.fullName,
    }));
  }, [consensusReview.reviewerIds, data.reviewers]);

  const href = `${reviewsUrl}${reviewsUrl.includes('?') ? '&' : '?'}review=ai`;

  return (
    <div className={cn(className)}>
      <SidebarHeader
        title="AI Review"
        className="mb-3"
        action={<Bot className="w-4 h-4 text-gray-900" aria-hidden />}
      />

      <div className="rounded-lg border border-gray-200 bg-gradient-to-b from-white to-gray-50/80 p-3 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium mb-2">
          <FontAwesomeIcon
            icon={totalIssues === 0 ? faCircleCheck : faCircleExclamation}
            className={cn(
              'w-3.5 h-3.5',
              totalIssues === 0 ? 'text-emerald-500' : 'text-orange-400'
            )}
          />
          <span className={totalIssues === 0 ? 'text-emerald-800' : 'text-orange-800'}>
            {issueLabel(totalIssues)}
          </span>
        </div>
        <p className="text-[11px] text-gray-500 leading-relaxed mb-2">ResearchHub AI Peer Review</p>
        {reviewerAvatars.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-medium text-gray-500 uppercase">Reviewed by</span>
            <AvatarStack
              items={reviewerAvatars}
              size="xxs"
              maxItems={4}
              spacing={-6}
              showExtraCount
              showLabel={false}
            />
          </div>
        )}
        <Link
          href={href}
          scroll={false}
          className="flex items-center justify-between gap-2 rounded-md bg-gray-900 text-white text-sm font-medium px-3 py-2 hover:bg-gray-800 transition-colors"
        >
          <span>See Review</span>
          <ChevronRight className="w-4 h-4 shrink-0 opacity-80" />
        </Link>
      </div>
    </div>
  );
}

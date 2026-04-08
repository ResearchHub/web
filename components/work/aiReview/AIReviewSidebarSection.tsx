'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
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
    // Bot avatar as inline SVG data URI (sparkles icon on primary bg)
    const aiAvatar = {
      src: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="20" fill="%233971FF"/><path d="M20 10l1.5 4.5L26 16l-4.5 1.5L20 22l-1.5-4.5L14 16l4.5-1.5L20 10z" fill="white"/><path d="M27 22l.8 2.2L30 25l-2.2.8L27 28l-.8-2.2L24 25l2.2-.8L27 22z" fill="white" opacity=".7"/></svg>')}`,
      alt: 'ResearchHub AI',
      tooltip: 'ResearchHub AI',
    };
    const reviewers = reviewersFromIds(consensusReview.reviewerIds, data.reviewers);
    const humans = reviewers.map((r) => ({
      src: r.profileImage || '',
      alt: r.fullName,
      authorId: r.authorProfileId,
      tooltip: r.fullName,
    }));
    return [aiAvatar, ...humans];
  }, [consensusReview.reviewerIds, data.reviewers]);

  const href = `${reviewsUrl}${reviewsUrl.includes('?') ? '&' : '?'}review=ai`;

  return (
    <div className={cn(className)}>
      <SidebarHeader title="AI Review" className="mb-3" />

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <FontAwesomeIcon
              icon={totalIssues === 0 ? faCircleCheck : faCircleExclamation}
              className={cn('w-3.5 h-3.5', totalIssues === 0 ? 'text-emerald-400' : 'text-red-400')}
            />
            <span className={totalIssues === 0 ? 'text-emerald-600' : 'text-red-500'}>
              {issueLabel(totalIssues)}
            </span>
          </div>
          {reviewerAvatars.length > 0 && (
            <AvatarStack
              items={reviewerAvatars}
              size="xxs"
              maxItems={5}
              spacing={-6}
              showExtraCount
              showLabel={false}
            />
          )}
        </div>
        <Link
          href={href}
          scroll={false}
          className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          <span>Read review</span>
          <ChevronRight className="w-4 h-4 shrink-0" />
        </Link>
      </div>
    </div>
  );
}

'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight, Sparkles } from 'lucide-react';
import { SidebarHeader } from '@/components/ui/SidebarHeader';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { cn } from '@/utils/styles';
import { useUser } from '@/contexts/UserContext';
import { AIReviewSpectrumBar } from './AIReviewSpectrumBar';
import { useAIReviewMock } from './AIReviewMockContext';
import { overallSpectrumPercent } from './scoring';
import { collectReviewerIdsForCategories, reviewersFromIds } from './collectReviewers';

interface AIReviewSidebarSectionProps {
  reviewsUrl: string;
  className?: string;
}

export function AIReviewSidebarSection({ reviewsUrl, className }: AIReviewSidebarSectionProps) {
  const { data, userValidations } = useAIReviewMock();
  const { user } = useUser();

  const overall = overallSpectrumPercent(data.categories);

  const topAvatars = useMemo(() => {
    const ids = collectReviewerIdsForCategories(data.categories);
    const items = reviewersFromIds(ids, data.reviewers).map((r) => ({
      src: r.profileImage || '',
      alt: r.fullName,
      authorId: r.authorProfileId,
      tooltip: r.fullName,
    }));
    if (user?.authorProfile && Object.keys(userValidations).length > 0) {
      return [
        {
          src: user.authorProfile.profileImage || '',
          alt: 'You',
          authorId: user.authorProfile.id,
          tooltip: 'You validated checklist items',
        },
        ...items,
      ];
    }
    return items;
  }, [data.categories, data.reviewers, user?.authorProfile, userValidations]);

  const href = `${reviewsUrl}${reviewsUrl.includes('?') ? '&' : '?'}review=ai`;

  return (
    <div className={cn(className)}>
      <SidebarHeader
        title="AI Review"
        className="mb-3"
        action={<Sparkles className="w-4 h-4 text-violet-500" aria-hidden />}
      />

      <div className="rounded-lg border border-gray-200 bg-gradient-to-b from-white to-gray-50/80 p-3 shadow-sm">
        <AIReviewSpectrumBar percent={overall} showLabel={false} className="mb-3" />
        <p className="text-[11px] text-gray-500 leading-relaxed mb-2">
          {data.categories.length} high-level categories with AI scoring and checklist validation;
          summaries reference this mock proposal.
        </p>
        {topAvatars.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-medium text-gray-500 uppercase">Reviewed by</span>
            <AvatarStack
              items={topAvatars}
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
          <span>Open full AI review</span>
          <ChevronRight className="w-4 h-4 shrink-0 opacity-80" />
        </Link>
      </div>
    </div>
  );
}

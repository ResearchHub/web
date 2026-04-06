'use client';

import { useMemo } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Tooltip } from '@/components/ui/Tooltip';
import type { ChecklistItemDefinition } from './types';
import { ChecklistValueBadge } from './ChecklistValueBadge';
import { PeerReviewAvatarCluster } from './PeerReviewAvatarCluster';
import { useAIReviewMock } from './AIReviewMockContext';
import { useUser } from '@/contexts/UserContext';

interface AIReviewChecklistRowProps {
  item: ChecklistItemDefinition;
}

export function AIReviewChecklistRow({ item }: AIReviewChecklistRowProps) {
  const { data, userValidations } = useAIReviewMock();
  const { user } = useUser();

  const clusterItems = useMemo(
    () =>
      item.humanReviews
        .map((review) => ({
          review,
          reviewer: data.reviewers[review.reviewerId],
        }))
        .filter((x) => x.reviewer),
    [item.humanReviews, data.reviewers]
  );

  const mine = userValidations[item.id];
  const profile = user?.authorProfile;

  return (
    <div className="border-b border-gray-100 pb-3 mb-3 last:border-0 last:pb-0 last:mb-0">
      <div className="flex items-center" style={{ gap: 15 }}>
        {/* Label */}
        <p className="text-sm text-gray-900 flex-1 min-w-0 leading-snug">{item.label}</p>

        {/* AI column — fixed width, left-aligned to match header */}
        <div className="shrink-0" style={{ width: 72 }}>
          <ChecklistValueBadge value={item.aiValue} />
        </div>

        {/* Human column — fixed width, left-aligned to match header */}
        <div className="flex items-center shrink-0" style={{ width: 120 }}>
          <PeerReviewAvatarCluster items={clusterItems} maxShown={4} />
          {mine && profile && (
            <Tooltip
              content={
                <div className="text-left text-xs">
                  <div className="font-semibold">Your validation</div>
                  <div className="mt-1">
                    <ChecklistValueBadge value={mine.value} className="text-[10px]" />
                  </div>
                  {mine.note ? <p className="mt-2 text-gray-700">{mine.note}</p> : null}
                </div>
              }
              position="top"
              width="w-72"
            >
              <div className="relative inline-flex" style={{ marginLeft: -8 }}>
                <Avatar
                  src={profile.profileImage}
                  alt={profile.fullName || 'You'}
                  size="xs"
                  authorId={profile.id}
                  className="ring-2 ring-primary-200"
                  disableTooltip
                />
                <span className="absolute -bottom-0.5 -right-0.5 rounded-full ring-2 ring-white bg-primary-500 text-white flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3" strokeWidth={2.5} />
                </span>
              </div>
            </Tooltip>
          )}
          {mine && !profile && <span className="text-[11px] text-gray-600 ml-1">You</span>}
        </div>
      </div>
    </div>
  );
}

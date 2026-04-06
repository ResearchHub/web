'use client';

import { CheckCircle2, CircleAlert } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/utils/styles';
import type { ChecklistHumanReview, MockReviewer } from './types';

export interface PeerReviewAvatarClusterItem {
  review: ChecklistHumanReview;
  reviewer: MockReviewer;
}

interface PeerReviewAvatarClusterProps {
  items: PeerReviewAvatarClusterItem[];
  size?: 'xxs' | 'xs' | 'sm';
  className?: string;
  maxShown?: number;
}

export function PeerReviewAvatarCluster({
  items,
  size = 'xs',
  className,
  maxShown = 3,
}: PeerReviewAvatarClusterProps) {
  if (items.length === 0) return null;

  const spacing = -8;
  const shown = items.slice(0, maxShown);
  const extra = items.length - maxShown;

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-3 h-3';
  const badgeSize = size === 'sm' ? '-bottom-0.5 -right-0.5' : '-bottom-0.5 -right-0.5';

  return (
    <div className={cn('inline-flex items-center', className)}>
      <div className="inline-flex">
        {shown.map((item, index) => {
          const { reviewer, review } = item;
          const tooltip = (
            <div className="text-left max-w-xs">
              <div className="font-semibold text-gray-900">{reviewer.fullName}</div>
              <div className="text-xs text-gray-600 mt-0.5">
                {review.agreesWithAi ? 'Agrees with AI assessment' : 'Disputes AI assessment'}
              </div>
              {review.note ? (
                <p className="mt-2 text-xs text-gray-700 leading-snug">{review.note}</p>
              ) : null}
            </div>
          );

          return (
            <Tooltip key={`${reviewer.id}-${index}`} content={tooltip} position="top" width="w-80">
              <div
                className="relative inline-flex cursor-default"
                style={{
                  marginLeft: index === 0 ? undefined : spacing,
                  zIndex: shown.length - index,
                }}
              >
                <Avatar
                  src={reviewer.profileImage}
                  alt={reviewer.fullName}
                  size={size}
                  authorId={reviewer.authorProfileId}
                  className="ring-2 ring-white"
                  disableTooltip
                />
                <span
                  className={cn(
                    'absolute rounded-full ring-2 ring-white flex items-center justify-center',
                    badgeSize,
                    review.agreesWithAi ? 'bg-emerald-500 text-white' : 'bg-orange-400 text-white'
                  )}
                >
                  {review.agreesWithAi ? (
                    <CheckCircle2 className={iconSize} strokeWidth={2.5} />
                  ) : (
                    <CircleAlert className={iconSize} strokeWidth={2.5} />
                  )}
                </span>
              </div>
            </Tooltip>
          );
        })}

        {extra > 0 && (
          <div className="relative inline-flex" style={{ marginLeft: spacing, zIndex: 0 }}>
            <Tooltip
              content={
                <ul className="text-xs space-y-1 text-left">
                  {items.slice(maxShown).map((it) => (
                    <li key={it.reviewer.id}>{it.reviewer.fullName}</li>
                  ))}
                </ul>
              }
              position="top"
              width="w-48"
            >
              <Avatar
                src={null}
                alt={`+${extra}`}
                size={size}
                className="ring-2 ring-white bg-gray-100"
                disableTooltip
                label={`+${extra}`}
                labelClassName="font-semibold text-[10px]"
              />
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
}

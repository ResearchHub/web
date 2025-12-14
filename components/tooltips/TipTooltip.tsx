'use client';

import React from 'react';
import { Tip } from '@/types/tip';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/icons/Icon';
import { formatRSC } from '@/utils/number';

interface TipTooltipProps {
  tips: Tip[];
  awardedBountyAmount?: number;
  totalAwarded: number;
}

const MAX_VISIBLE_TIPS = 5;

export function TipTooltip({ tips, awardedBountyAmount, totalAwarded }: TipTooltipProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const visibleTips = tips.slice(0, MAX_VISIBLE_TIPS);
  const hasMoreTips = tips.length > MAX_VISIBLE_TIPS;
  const hasBountyAwards = (awardedBountyAmount || 0) > 0;

  return (
    <div className="space-y-3 text-left" onClick={handleClick}>
      {/* Header with total awarded amount */}
      <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
        <Icon name="tipRSC" size={20} />
        <span className="font-semibold text-gray-900">Total Awarded</span>
        <span className="ml-auto text-lg font-bold text-gray-900">
          {formatRSC({ amount: totalAwarded, shorten: true })} RSC
        </span>
      </div>

      {/* Tips list */}
      {tips.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Tips ({tips.length})
          </div>
          {visibleTips.map((tip, index) => (
            <div key={`tip-${tip.user.id}-${index}`} className="flex items-center gap-3">
              <Avatar
                src={tip.user.authorProfile?.profileImage}
                alt={tip.user.fullName}
                size="sm"
                authorId={tip.user.authorProfile?.id}
                disableTooltip={true}
              />
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-gray-900 truncate text-left">
                  {tip.user.fullName}
                </p>
                {tip.user.authorProfile?.headline && (
                  <p className="text-xs text-gray-500 truncate text-left">
                    {tip.user.authorProfile.headline}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full flex-shrink-0">
                <span className="text-sm font-semibold text-gray-900">
                  {formatRSC({ amount: tip.amount, shorten: true })} RSC
                </span>
              </div>
            </div>
          ))}
          {hasMoreTips && (
            <p className="text-xs text-gray-500 text-center pt-1">
              +{tips.length - MAX_VISIBLE_TIPS} more tip
              {tips.length - MAX_VISIBLE_TIPS !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}

      {/* Bounty Awards section */}
      {hasBountyAwards && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Bounty Awards
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              {/* Visual centering adjustment */}
              <Icon name="earn1" size={16} className="translate-x-px translate-y-px" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-gray-900 truncate text-left">Bounty Award</p>
            </div>
            <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full flex-shrink-0">
              <span className="text-sm font-semibold text-gray-900">
                {formatRSC({ amount: awardedBountyAmount || 0, shorten: true })} RSC
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

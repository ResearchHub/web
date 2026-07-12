'use client';

import { FC, ReactNode } from 'react';
import { useUser } from '@/contexts/UserContext';
import {
  ResearchCoinSnapshot,
  ResearchCoinSnapshotSkeleton,
} from '@/components/ResearchCoin/ResearchCoinSnapshot';

interface FundingHeroPanelProps {
  /**
   * The page's primary action rendered beneath the snapshot (e.g. the
   * "open a funding opportunity" or "submit proposal" CTA). Passed in so the
   * same snapshot pattern can be shared across the Fund and Proposals pages.
   */
  primaryCta: ReactNode;
}

/**
 * Hero right-rail panel for the Fund/Proposals pages. Surfaces the two pools of
 * money the user can fund science with (RSC balance + funding credits) above
 * the page's primary CTA. The whole snapshot card is clickable, revealing a
 * menu of where each pool is managed. Hidden entirely while auth resolves to
 * prevent layout shifts from the snapshot appearing and disappearing.
 */
export const FundingHeroPanel: FC<FundingHeroPanelProps> = ({ primaryCta }) => {
  const { user, isLoading: isLoadingUser } = useUser();

  return (
    <div className="relative z-40 flex w-full flex-col gap-3 sm:w-72">
      {isLoadingUser ? (
        <ResearchCoinSnapshotSkeleton />
      ) : user ? (
        <ResearchCoinSnapshot interactive />
      ) : null}

      {primaryCta}
    </div>
  );
};

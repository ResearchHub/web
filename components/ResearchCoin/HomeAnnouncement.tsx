'use client';

import { DraftWithAICard, DraftWithAIToast } from '@/components/AIMode/DraftWithAICard';
import { FundingCreditsCard, FundingCreditsToast, usePromoIsLive } from './FundingCreditsCard';

/**
 * The home feed's announcement: the Funding Credits card while that promo
 * runs, then the Draft with AI card again. Nothing until mounted, so neither
 * flashes in before the date is known.
 */
export function HomeAnnouncementCard({ className }: { readonly className?: string }) {
  const isLive = usePromoIsLive();
  if (isLive === null) return null;
  return isLive ? (
    <FundingCreditsCard className={className} />
  ) : (
    <DraftWithAICard className={className} />
  );
}

/** The toast form of the same, from the tablet breakpoint up. */
export function HomeAnnouncementToast() {
  const isLive = usePromoIsLive();
  if (isLive === null) return null;
  return isLive ? <FundingCreditsToast /> : <DraftWithAIToast />;
}

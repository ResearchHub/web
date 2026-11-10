'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { getAvailableAndPromotionalRscBalance } from '@/components/ResearchCoin/lib/promotionalBalance';
import type { User } from '@/types/user';

export type HomePromoAudience = 'everyone' | 'rsc_holders';

/**
 * Links aimed at people who may hold ResearchCoin carry `?audience=rsc`.
 * Nothing else tells us that a signed-out visitor holds any.
 */
const AUDIENCE_PARAM = 'audience';
const RSC_HOLDERS_VALUE = 'rsc';
/** Remembered, so the visitor still counts after leaving the link's page and coming back. */
const STORAGE_KEY = 'rh:home-promo-audience';

function arrivedAsRscHolder(): boolean {
  const isFromLink =
    new URLSearchParams(window.location.search).get(AUDIENCE_PARAM) === RSC_HOLDERS_VALUE;
  try {
    if (isFromLink) localStorage.setItem(STORAGE_KEY, RSC_HOLDERS_VALUE);
    return isFromLink || localStorage.getItem(STORAGE_KEY) === RSC_HOLDERS_VALUE;
  } catch {
    // Private mode / blocked storage: the link still counts for this visit.
    return isFromLink;
  }
}

/** Someone already earning has nothing to start, so the deposit pitch would be noise. */
function isAlreadyEarning(user: User | null): boolean {
  return !!user?.isStakingOptedIn && getAvailableAndPromotionalRscBalance(user) > 0;
}

/**
 * Which promo the homepage shows. Null until that is known, so one never
 * flashes in before another replaces it. Settled once per page view: signing in
 * from a promo's button must not swap the promo out from under the modal that
 * button opens.
 */
export function useHomePromoAudience(): HomePromoAudience | null {
  const { user, isLoading: isUserLoading } = useUser();
  const [audience, setAudience] = useState<HomePromoAudience | null>(null);

  useEffect(() => {
    if (audience) return;
    if (!arrivedAsRscHolder()) {
      setAudience('everyone');
      return;
    }
    if (isUserLoading) return;
    setAudience(isAlreadyEarning(user) ? 'everyone' : 'rsc_holders');
  }, [audience, user, isUserLoading]);

  return audience;
}

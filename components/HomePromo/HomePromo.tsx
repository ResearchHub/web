'use client';

import type { ComponentType } from 'react';
import { DraftWithAIPromo } from './DraftWithAIPromo';
import { EndowmentDepositPromo } from './EndowmentDepositPromo';
import type { HomePromoSlotProps } from './HomePromoFrame';
import { useHomePromoAudience, type HomePromoAudience } from './useHomePromoAudience';

const PROMO_BY_AUDIENCE: Record<HomePromoAudience, ComponentType<HomePromoSlotProps>> = {
  everyone: DraftWithAIPromo,
  rsc_holders: EndowmentDepositPromo,
};

/** One promo at a time on the homepage, picked by who the visitor is. */
export function HomePromo() {
  const audience = useHomePromoAudience();

  if (!audience) return null;

  const Promo = PROMO_BY_AUDIENCE[audience];

  return (
    <>
      {/* Phones; from the tablet breakpoint up it is the toast instead. */}
      <Promo variant="card" className="mb-6 tablet:!hidden" />
      <Promo variant="toast" />
    </>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { formatCountdownRemaining } from '@/utils/date';
import type { ReviewAvailability } from '@/types/user';

const COOLDOWN_DAYS = 4;
const COOLDOWN_INTERVAL_MS = 60_000;

function deriveState(availability: ReviewAvailability | null) {
  if (!availability) return { canReview: true, formattedTimeRemaining: null };
  const { isPast, formatted } = formatCountdownRemaining(availability.availableAt);
  return { canReview: isPast || availability.canReview, formattedTimeRemaining: formatted };
}

export function useReviewCooldown(reviewAvailability: ReviewAvailability | null) {
  const [localAvailability, setLocalAvailability] = useState<ReviewAvailability | null>(null);
  const effective = localAvailability ?? reviewAvailability;
  const [state, setState] = useState(() => deriveState(effective));

  const startCooldown = useCallback(() => {
    const end = new Date();
    end.setDate(end.getDate() + COOLDOWN_DAYS);
    setLocalAvailability({ canReview: false, availableAt: end.toISOString() });
  }, []);

  useEffect(() => {
    const derived = deriveState(effective);
    setState(derived);
    if (derived.canReview) return;

    const interval = setInterval(() => {
      const next = deriveState(effective);
      setState(next);
      if (next.canReview) clearInterval(interval);
    }, COOLDOWN_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [effective]);

  return { ...state, startCooldown };
}

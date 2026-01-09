import { useState, useEffect, useCallback } from 'react';
import { formatCountdownRemaining } from '@/utils/date';
import { ReviewService } from '@/services/review.service';
import type { ReviewAvailability } from '@/types/review';

const COOLDOWN_DAYS = 4;

function deriveState(availability: ReviewAvailability | null) {
  if (!availability) return { canReview: true, timeRemaining: null };
  const { isPast, formatted } = formatCountdownRemaining(availability.availableAt);
  return { canReview: isPast || availability.canReview, timeRemaining: formatted };
}

export function useReviewCooldown(enabled: boolean) {
  const [availability, setAvailability] = useState<ReviewAvailability | null>(null);
  const [localAvailability, setLocalAvailability] = useState<ReviewAvailability | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const effective = localAvailability ?? availability;
  const [state, setState] = useState(() => deriveState(effective));

  const startCooldown = useCallback(() => {
    const end = new Date();
    end.setDate(end.getDate() + COOLDOWN_DAYS);
    setLocalAvailability({ canReview: false, availableAt: end.toISOString() });
  }, []);

  useEffect(() => {
    if (!enabled) return;

    setIsLoading(true);
    ReviewService.getAvailability()
      .then(setAvailability)
      .catch(() => setAvailability(null))
      .finally(() => setIsLoading(false));
  }, [enabled]);

  useEffect(() => {
    setState(deriveState(effective));
  }, [effective]);

  return { ...state, isLoading, startCooldown };
}

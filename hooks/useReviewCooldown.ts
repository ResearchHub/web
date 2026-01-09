import { useState, useEffect, useCallback } from 'react';
import { formatCountdownRemaining } from '@/utils/date';
import { ReviewService } from '@/services/review.service';
import type { ReviewAvailability } from '@/types/review';

const COOLDOWN_DAYS = 4;

export function useReviewCooldown(enabled: boolean) {
  const [availability, setAvailability] = useState<ReviewAvailability | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);

  const { isPast, formatted: timeRemaining } = formatCountdownRemaining(
    availability?.availableAt ?? null
  );
  const canReview = !availability || isPast || availability.canReview;

  const startCooldown = useCallback(() => {
    const end = new Date();
    end.setDate(end.getDate() + COOLDOWN_DAYS);
    setAvailability({ canReview: false, availableAt: end.toISOString() });
  }, []);

  useEffect(() => {
    if (!enabled) return;

    ReviewService.getAvailability()
      .then(setAvailability)
      .catch(() => setAvailability(null))
      .finally(() => setIsLoading(false));
  }, [enabled]);

  return { canReview, timeRemaining, isLoading, startCooldown };
}

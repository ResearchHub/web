import { useState, useEffect, useCallback } from 'react';
import { formatCountdownRemaining } from '@/utils/date';
import { ReviewService } from '@/services/review.service';
import type { ReviewAvailability } from '@/types/review';

export function useReviewCooldown(enabled: boolean) {
  const [availability, setAvailability] = useState<ReviewAvailability | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { isPast, formatted: timeRemaining } = formatCountdownRemaining(
    availability?.availableAt ?? null
  );

  const canReview = availability ? availability.canReview || isPast : false;

  const refetchAvailability = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await ReviewService.getAvailability();
      setAvailability(data);
    } catch {
      setAvailability(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      refetchAvailability();
    }
  }, [enabled, refetchAvailability]);

  return { canReview, timeRemaining, isLoading, refetchAvailability };
}

import { useState, useEffect, useRef, useCallback } from 'react';
import { formatCountdownRemaining } from '@/utils/date';

interface ReviewCooldownState {
  canReview: boolean;
  formattedTimeRemaining: string | null;
}

interface UseReviewCooldownReturn extends ReviewCooldownState {
  startCooldown: () => void;
}

const COOLDOWN_DAYS = 4;
const COOLDOWN_INTERVAL_MS = 60_000;

function calculateState(nextAvailableReviewTime: string | null): ReviewCooldownState {
  const { isPast, formatted } = formatCountdownRemaining(nextAvailableReviewTime);
  return { canReview: isPast, formattedTimeRemaining: formatted };
}

export function useReviewCooldown(nextAvailableReviewTime: string | null): UseReviewCooldownReturn {
  const [state, setState] = useState(() => calculateState(nextAvailableReviewTime));
  const [localCooldownTime, setLocalCooldownTime] = useState<string | null>(null);
  const prevTimeRef = useRef(nextAvailableReviewTime);

  const effectiveTime = localCooldownTime ?? nextAvailableReviewTime;

  // Start cooldown immediately after successful review submission
  const startCooldown = useCallback(() => {
    const cooldownEnd = new Date();
    cooldownEnd.setDate(cooldownEnd.getDate() + COOLDOWN_DAYS);
    const cooldownTimeISO = cooldownEnd.toISOString();
    setLocalCooldownTime(cooldownTimeISO);
    setState(calculateState(cooldownTimeISO));
  }, []);

  useEffect(() => {
    // Only recalculate immediately if the prop changed (not on initial mount)
    if (prevTimeRef.current !== effectiveTime) {
      prevTimeRef.current = effectiveTime;
      setState(calculateState(effectiveTime));
    }

    if (state.canReview) return;

    const interval = setInterval(() => {
      const newState = calculateState(effectiveTime);
      setState(newState);
      if (newState.canReview) clearInterval(interval);
    }, COOLDOWN_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [effectiveTime, state.canReview]);

  return { ...state, startCooldown };
}

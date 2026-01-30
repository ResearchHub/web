'use client';

import { FC, useRef, useCallback, useEffect, useState } from 'react';
import { cn } from '@/utils/styles';

interface FundingImpactPreviewProps {
  /** Current amount raised in USD */
  currentAmountUsd: number;
  /** Goal amount in USD */
  goalAmountUsd: number;
  /** User's potential contribution in USD */
  previewAmountUsd: number;
  /** Callback when user drags the slider to change amount */
  onAmountChange?: (amount: number) => void;
  /** Whether the amount was set via slider (linear) vs input (scaled) */
  isSliderControlled?: boolean;
  /** Optional class name */
  className?: string;
}

/**
 * Funding progress widget showing:
 * - Interactive progress bar with slider to adjust contribution
 * - Animated striped preview segment
 * - Amount raised with preview of new total
 * - Goal amount
 * Shows green when fully funded.
 */
export const FundingImpactPreview: FC<FundingImpactPreviewProps> = ({
  currentAmountUsd,
  goalAmountUsd,
  previewAmountUsd,
  onAmountChange,
  isSliderControlled = false,
  className,
}) => {
  const barRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Calculate percentages
  const currentPercentage = Math.min(100, (currentAmountUsd / goalAmountUsd) * 100);
  const remainingPercentage = 100 - currentPercentage;
  const actualPreviewPercentage = Math.min(
    remainingPercentage,
    (previewAmountUsd / goalAmountUsd) * 100
  );

  // Apply visual scaling for small contributions ONLY when set via input (not slider)
  // Scales based on goal size: less amplification for small goals (accuracy),
  // more amplification for large goals (feel-good factor)
  const scalePercentage = (actualPct: number): number => {
    if (actualPct <= 0) return 0;

    // Goal size thresholds for scaling behavior
    const smallGoalThreshold = 2000; // Below this, use minimal scaling (more accurate)
    const largeGoalThreshold = 10000; // Above this, use maximum scaling

    // Calculate goal factor (0 = small goal, 1 = large goal)
    const goalFactor = Math.max(
      0,
      Math.min(1, (goalAmountUsd - smallGoalThreshold) / (largeGoalThreshold - smallGoalThreshold))
    );

    // Minimum visible percentage for any contribution (ensures visibility)
    // Smaller for small goals (5%), larger for large goals (8%)
    const minVisiblePct = 5 + goalFactor * 3;

    // Amplification factor: 1.3x for small goals, 2.5x for large goals
    const minAmplification = 1.3;
    const maxAmplification = 2.5;
    const amplification = minAmplification + goalFactor * (maxAmplification - minAmplification);

    // Apply amplification but cap the boost to prevent extreme exaggeration
    // Max boost is 10 percentage points above actual
    const maxBoost = 10 + goalFactor * 5; // 10-15pp max boost based on goal size
    const amplifiedPct = Math.min(actualPct * amplification, actualPct + maxBoost);

    // Return the larger of minimum visible or amplified, but never exceed 100%
    return Math.min(100, Math.max(minVisiblePct, amplifiedPct));
  };

  // Use scaled visual when amount was set via input, linear when set via slider
  const visualPreviewPercentage =
    isSliderControlled || isDragging
      ? actualPreviewPercentage
      : previewAmountUsd > 0
        ? Math.min(scalePercentage(actualPreviewPercentage), remainingPercentage)
        : 0;

  // Total percentage for thumb position (always uses visual percentage so thumb matches bar)
  const totalPercentage = currentPercentage + visualPreviewPercentage;

  // Check if fully funded (based on actual amounts)
  const isFullyFunded = currentPercentage + actualPreviewPercentage >= 100;

  // Calculate new total with user's contribution
  const newTotal = currentAmountUsd + previewAmountUsd;

  // Calculate intensity (0-1) based on how much of the remaining goal user is contributing
  // This drives visual effects: animation speed, glow, and color
  const remainingGoal = goalAmountUsd - currentAmountUsd;
  const contributionRatio = remainingGoal > 0 ? Math.min(1, previewAmountUsd / remainingGoal) : 0;
  // Use easing for more dramatic effect at higher contributions
  const intensity = Math.pow(contributionRatio, 0.7);

  // Animation speed: constant 1s
  const animationDuration = 1;

  // Glow intensity: subtle at low amounts, prominent at high
  const glowOpacity = intensity * 0.6;
  const glowSpread = 2 + intensity * 6;

  // Format currency
  const formatAmount = (amount: number) =>
    amount.toLocaleString('en-US', { maximumFractionDigits: 0 });

  // Calculate percentage from cursor position
  const getPercentageFromPosition = useCallback((clientX: number): number => {
    if (!barRef.current) return 0;
    const rect = barRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    return Math.max(0, Math.min(100, (x / rect.width) * 100));
  }, []);

  // Calculate amount from percentage (snaps to 1% increments)
  const calculateAmountFromPercentage = useCallback(
    (percentage: number) => {
      if (!onAmountChange) return;

      const remainingGoal = goalAmountUsd - currentAmountUsd;
      if (percentage <= currentPercentage) {
        onAmountChange(0);
      } else {
        // Snap to 1% increments of the total goal
        const contributionPercentage = percentage - currentPercentage;
        const snappedPercentage = Math.round(contributionPercentage);
        const amount = (snappedPercentage / 100) * goalAmountUsd;
        onAmountChange(Math.round(Math.min(amount, remainingGoal)));
      }
    },
    [currentAmountUsd, currentPercentage, goalAmountUsd, onAmountChange]
  );

  // Mouse/touch handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!onAmountChange) return;
      const pct = getPercentageFromPosition(e.clientX);
      setIsDragging(true);
      calculateAmountFromPercentage(pct);
    },
    [getPercentageFromPosition, calculateAmountFromPercentage, onAmountChange]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!onAmountChange) return;
      const pct = getPercentageFromPosition(e.touches[0].clientX);
      setIsDragging(true);
      calculateAmountFromPercentage(pct);
    },
    [getPercentageFromPosition, calculateAmountFromPercentage, onAmountChange]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const pct = getPercentageFromPosition(e.clientX);
      calculateAmountFromPercentage(pct);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const pct = getPercentageFromPosition(e.touches[0].clientX);
      calculateAmountFromPercentage(pct);
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, getPercentageFromPosition, calculateAmountFromPercentage]);

  return (
    <div className={cn('rounded-xl border border-gray-200 p-4 space-y-3', className)}>
      {/* Widget title */}
      <div className="text-sm font-medium text-gray-700">Funding impact</div>

      {/* CSS for animated stripes keyframes */}
      <style jsx>{`
        @keyframes stripe-move {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 42px 0;
          }
        }
      `}</style>

      {/* Progress bar with slider */}
      <div
        ref={barRef}
        className={cn(
          'relative w-full h-4 bg-gray-200 rounded-lg overflow-visible select-none',
          onAmountChange && 'cursor-pointer'
        )}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Track container */}
        <div className="absolute inset-0 rounded-lg overflow-hidden">
          <div className="h-full flex">
            {/* Current progress segment - solid, green if fully funded */}
            <div
              className={cn(
                'h-full transition-all',
                isDragging ? 'duration-0' : 'duration-300',
                isFullyFunded ? 'bg-green-500' : 'bg-orange-500'
              )}
              style={{ width: `${currentPercentage}%` }}
            />
            {/* Preview segment - animated striped pattern with intensity-based color */}
            {previewAmountUsd > 0 && (
              <div
                className={cn('h-full', isDragging ? '' : 'transition-all duration-300')}
                style={{
                  width: `${visualPreviewPercentage}%`,
                  // Color gradient: amber (low) → gold (mid) → green (high/full)
                  backgroundColor: isFullyFunded
                    ? '#22c55e' // green-500
                    : intensity < 0.5
                      ? `hsl(${38 + intensity * 20}, 92%, ${55 + intensity * 10}%)` // amber → gold
                      : `hsl(${48 + (intensity - 0.5) * 100}, ${70 + (1 - intensity) * 22}%, ${55 + intensity * 10}%)`, // gold → green
                  // Animated stripes with dynamic speed based on intensity
                  backgroundImage: `repeating-linear-gradient(
                    -45deg,
                    transparent,
                    transparent 10px,
                    rgba(255, 255, 255, 0.3) 10px,
                    rgba(255, 255, 255, 0.3) 20px
                  )`,
                  animation: `stripe-move ${animationDuration}s linear infinite`,
                  // Glow effect that intensifies with contribution
                  boxShadow: isFullyFunded
                    ? `0 0 ${glowSpread}px rgba(34, 197, 94, ${glowOpacity})`
                    : `0 0 ${glowSpread}px rgba(245, 158, 11, ${glowOpacity})`,
                }}
              />
            )}
          </div>
        </div>

        {/* Slider thumb with intensity-based styling */}
        {onAmountChange && (
          <div
            className={cn(
              'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full border-2 border-white',
              isDragging ? 'scale-110' : 'transition-all duration-300'
            )}
            style={{
              left: `${totalPercentage}%`,
              backgroundColor: isFullyFunded
                ? '#22c55e' // green-500
                : previewAmountUsd > 0
                  ? intensity < 0.5
                    ? `hsl(${38 + intensity * 20}, 92%, 45%)` // amber → gold
                    : `hsl(${48 + (intensity - 0.5) * 100}, ${70 + (1 - intensity) * 22}%, 45%)` // gold → green
                  : '#f97316', // orange-500
              boxShadow:
                previewAmountUsd > 0
                  ? `0 2px 4px rgba(0,0,0,0.2), 0 0 ${glowSpread + 2}px ${
                      isFullyFunded
                        ? `rgba(34, 197, 94, ${glowOpacity + 0.2})`
                        : `rgba(245, 158, 11, ${glowOpacity + 0.2})`
                    }`
                  : '0 2px 4px rgba(0,0,0,0.2)',
            }}
          />
        )}
      </div>

      {/* Amount labels with intensity-based text color */}
      <div className="flex items-baseline justify-between text-sm">
        <div>
          {previewAmountUsd > 0 ? (
            <span
              className="font-semibold transition-colors"
              style={{
                color: isFullyFunded
                  ? '#16a34a' // green-600
                  : intensity < 0.5
                    ? '#d97706' // amber-600
                    : intensity < 0.8
                      ? '#ca8a04' // yellow-600 (gold)
                      : '#65a30d', // lime-600 (approaching green)
              }}
            >
              ${formatAmount(newTotal)}
            </span>
          ) : (
            <span className="font-semibold text-gray-900">${formatAmount(currentAmountUsd)}</span>
          )}
          <span className="text-gray-500"> raised</span>
          {previewAmountUsd > 0 && (
            <span className="text-gray-400 text-xs ml-1">
              (was ${formatAmount(currentAmountUsd)})
            </span>
          )}
        </div>
        <div className="text-gray-500">
          <span className="font-medium text-gray-700">${formatAmount(goalAmountUsd)}</span> goal
        </div>
      </div>
    </div>
  );
};

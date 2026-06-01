import { FC } from 'react';
import { cn } from '@/utils/styles';

interface RadiatingDotProps {
  color?: string;
  size?: 'sm' | 'md';
  isRadiating?: boolean;
  // When true, render an expanding ring that pulses outward from the dot,
  // signalling active/ongoing activity (e.g. "explanation in progress").
  // Defaults to the lighter `animate-pulse` behaviour for backward compat.
  ring?: boolean;
  className?: string;
}

export const RadiatingDot: FC<RadiatingDotProps> = ({
  color = 'bg-blue-500',
  size = 'md',
  isRadiating = true,
  ring = false,
  className,
}) => {
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  if (ring) {
    return (
      <span className={cn('relative inline-flex items-center justify-center', dotSize, className)}>
        {isRadiating && (
          <span
            className={cn(
              'absolute inline-flex rounded-full opacity-60 animate-radiate',
              dotSize,
              color
            )}
          />
        )}
        <span className={cn('relative inline-block rounded-full', dotSize, color)} />
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-block rounded-full',
        dotSize,
        isRadiating && 'animate-pulse',
        color,
        className
      )}
    />
  );
};

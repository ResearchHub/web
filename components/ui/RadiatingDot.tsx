import { FC } from 'react';
import { cn } from '@/utils/styles';

interface RadiatingDotProps {
  color?: string;
  size?: 'sm' | 'md';
  isRadiating?: boolean;
  className?: string;
}

export const RadiatingDot: FC<RadiatingDotProps> = ({
  color = 'bg-blue-500',
  size = 'md',
  isRadiating = true,
  className,
}) => {
  return (
    <span
      className={cn(
        'inline-block rounded-full',
        size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2',
        isRadiating && 'animate-pulse',
        color,
        className
      )}
    />
  );
};

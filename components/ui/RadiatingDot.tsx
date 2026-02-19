'use client';

import { FC } from 'react';
import { cn } from '@/utils/styles';

interface RadiatingDotProps {
  /**
   * Color of the center dot
   */
  color?: string;
  /**
   * Color of the radiating circles
   */
  radiateColor?: string;
  /**
   * Color of the outer ring
   */
  ringColor?: string;
  /**
   * Size of the component in pixels
   * @default 16 (4 in Tailwind units)
   */
  size?: number;
  /**
   * Size of the center dot in pixels
   * @default 8 (2 in Tailwind units)
   */
  dotSize?: number;
  /**
   * Whether the dot should be radiating
   * @default true
   */
  isRadiating?: boolean;
  /**
   * Optional CSS class name
   */
  className?: string;
}

export const RadiatingDot: FC<RadiatingDotProps> = ({
  color = 'bg-blue-500',
  radiateColor = 'bg-blue-400',
  ringColor = 'border-blue-200',
  size = 16,
  dotSize = 8,
  isRadiating = true,
  className,
}) => {
  const containerStyle = { width: `${size}px`, height: `${size}px` };
  const dotStyle = { width: `${dotSize}px`, height: `${dotSize}px` };

  if (!isRadiating) {
    return (
      <div className={cn('flex items-center justify-center', className)} style={dotStyle}>
        <div className={cn('rounded-full w-full h-full', color)} />
      </div>
    );
  }

  return (
    <div
      className={cn('relative flex items-center justify-center', className)}
      style={containerStyle}
    >
      <div
        className={cn('absolute rounded-full border', ringColor)}
        style={containerStyle}
      />
      <div
        className={cn('absolute rounded-full opacity-70 animate-radiate', radiateColor)}
        style={dotStyle}
      />
      <div
        className={cn('absolute rounded-full opacity-70 animate-radiate', radiateColor)}
        style={{ ...dotStyle, animationDelay: '1.25s' }}
      />
      <div className={cn('absolute rounded-full z-10', color)} style={dotStyle} />
    </div>
  );
};

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
  size = 16, // 4 in Tailwind units
  dotSize = 8, // 2 in Tailwind units
  isRadiating = true,
  className,
}) => {
  // Convert pixel sizes to inline styles
  const containerStyle = { width: `${size}px`, height: `${size}px` };
  const dotStyle = { width: `${dotSize}px`, height: `${dotSize}px` };

  return (
    <div
      className={cn('relative flex items-center justify-center', className)}
      style={containerStyle}
    >
      {isRadiating ? (
        <>
          {/* Static outer ring */}
          <div
            className={cn('absolute rounded-full border', ringColor)}
            style={containerStyle}
          ></div>

          {/* Radiating circles - multiple instances for a more continuous effect */}
          <div
            className={cn('absolute rounded-full opacity-70 animate-radiate', radiateColor)}
            style={dotStyle}
          ></div>
          <div
            className={cn('absolute rounded-full opacity-70 animate-radiate', radiateColor)}
            style={{ ...dotStyle, animationDelay: '1.25s' }}
          ></div>

          {/* Static inner dot */}
          <div className={cn('absolute rounded-full z-10', color)} style={dotStyle}></div>
        </>
      ) : (
        <div className={cn('rounded-full', color)} style={dotStyle}></div>
      )}
    </div>
  );
};

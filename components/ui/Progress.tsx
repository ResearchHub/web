'use client';

import { FC } from 'react';
import clsx from 'clsx';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  variant?: 'default' | 'success' | 'gray' | 'primary';
  size?: 'xs' | 'sm' | 'md';
}

export const Progress: FC<ProgressProps> = ({
  value,
  max = 100,
  className,
  variant = value === max ? 'success' : 'default',
  size = 'md',
}) => {
  const percentage = Math.min(100, (value / max) * 100);

  const sizeClasses = {
    xs: 'h-1.5',
    sm: 'h-2',
    md: 'h-2.5',
  };

  return (
    <div className={clsx('w-full bg-gray-200 rounded-lg', sizeClasses[size], className)}>
      <div
        className={clsx(
          'rounded-lg transition-all duration-300',
          sizeClasses[size],
          variant === 'success'
            ? 'bg-green-500'
            : variant === 'gray'
              ? 'bg-gray-400'
              : 'bg-primary-600'
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

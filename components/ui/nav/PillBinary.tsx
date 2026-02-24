'use client';

import { FC } from 'react';
import { cn } from '@/utils/styles';
import { PillSize, pillSizeClasses } from './pillSize';

export interface PillBinaryProps {
  label: string;
  active: boolean;
  onChange: (active: boolean) => void;
  size?: PillSize;
  className?: string;
}

export const PillBinary: FC<PillBinaryProps> = ({
  label,
  active,
  onChange,
  size = 'sm',
  className,
}) => {
  return (
    <button
      type="button"
      onClick={() => onChange(!active)}
      className={cn(
        'inline-flex items-center rounded-full font-semibold transition-all duration-150 select-none whitespace-nowrap',
        pillSizeClasses[size],
        active ? 'bg-gray-900 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        className
      )}
    >
      {label}
    </button>
  );
};

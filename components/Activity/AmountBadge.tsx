'use client';

import { FC, ReactNode } from 'react';
import { cn } from '@/utils/styles';

const TONES = {
  green: 'bg-green-100 text-green-800',
  orange: 'bg-orange-100 text-orange-700',
} as const;

interface AmountBadgeProps {
  tone?: keyof typeof TONES;
  className?: string;
  children: ReactNode;
}

export const AmountBadge: FC<AmountBadgeProps> = ({ tone = 'green', className, children }) => (
  <span
    className={cn(
      'inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[13px] font-semibold leading-tight',
      TONES[tone],
      className
    )}
  >
    {children}
  </span>
);

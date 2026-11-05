'use client';

import { ReactNode } from 'react';
import { RSCBalanceTooltip } from '@/components/tooltips/RSCBalanceTooltip';

interface AvailableBalanceTooltipProps {
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  wrapperClassName?: string;
}

export function AvailableBalanceTooltip({
  children,
  position = 'top',
  wrapperClassName,
}: Readonly<AvailableBalanceTooltipProps>) {
  return (
    <RSCBalanceTooltip title="Available" position={position} wrapperClassName={wrapperClassName}>
      {children}
    </RSCBalanceTooltip>
  );
}

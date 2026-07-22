'use client';

import { ReactNode } from 'react';
import { RSCBalanceTooltip } from '@/components/tooltips/RSCBalanceTooltip';

interface ResearchCoinTooltipProps {
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  wrapperClassName?: string;
}

export function ResearchCoinTooltip({
  children,
  position = 'top',
  wrapperClassName,
}: Readonly<ResearchCoinTooltipProps>) {
  return (
    <RSCBalanceTooltip title="ResearchCoin" position={position} wrapperClassName={wrapperClassName}>
      {children}
    </RSCBalanceTooltip>
  );
}

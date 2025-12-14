'use client';

import { FC, ReactNode } from 'react';
import { Tooltip } from './Tooltip';
import { formatExactTime } from '@/utils/date';

interface DeadlineExactTimeTooltipProps {
  deadlineIso?: string;
  children: ReactNode;
}

export const DeadlineExactTimeTooltip: FC<DeadlineExactTimeTooltipProps> = ({
  deadlineIso,
  children,
}) => {
  if (!deadlineIso) {
    return children;
  }

  return (
    <Tooltip content={formatExactTime(deadlineIso)} position="top" className="z-[10000]">
      <span className="cursor-help">{children}</span>
    </Tooltip>
  );
};

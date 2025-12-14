'use client';

import { FC, ReactNode } from 'react';
import { Tooltip } from './Tooltip';
import { formatExactTime } from '@/utils/date';

interface DeadlineExactTimeTooltipProps {
  deadlineIso?: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  highZIndex?: boolean;
}

export const DeadlineExactTimeTooltip: FC<DeadlineExactTimeTooltipProps> = ({
  deadlineIso,
  children,
  position = 'top',
  className,
  highZIndex = false,
}) => {
  if (!deadlineIso) {
    return <>{children}</>;
  }

  return (
    <Tooltip
      content={formatExactTime(deadlineIso)}
      position={position}
      wrapperClassName={className}
      className={highZIndex ? 'z-[10000]' : undefined}
    >
      <span className="cursor-help">{children}</span>
    </Tooltip>
  );
};

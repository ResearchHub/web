'use client';

import { FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck } from '@fortawesome/pro-solid-svg-icons';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/utils/styles';

interface JournalStatusBadgeProps {
  status: 'published' | 'in-review';
  className?: string;
  showTooltip?: boolean;
}

export const JournalStatusBadge: FC<JournalStatusBadgeProps> = ({
  status,
  className = '',
  showTooltip = true,
}) => {
  // In Review badge with yellow dot
  if (status === 'in-review') {
    const badge = (
      <span
        className={cn(
          'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-amber-50 text-amber-700   border  border-amber-300  ',
          className
        )}
      >
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-amber-500"></span>
        In Review
      </span>
    );

    if (!showTooltip) {
      return badge;
    }

    return (
      <Tooltip
        content={
          <div className="flex items-start gap-3 text-left">
            <div className="bg-amber-100 p-2 rounded-md flex items-center justify-center">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
            </div>
            <div>Paper is currently undergoing peer review.</div>
          </div>
        }
        position="top"
        width="w-[360px]"
      >
        {badge}
      </Tooltip>
    );
  }

  // Published badge with Font Awesome solid check icon
  if (status === 'published') {
    const badge = (
      <span
        className={cn(
          'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-emerald-50 text-emerald-700   border  border-emerald-400',
          className
        )}
      >
        <FontAwesomeIcon icon={faCircleCheck} className="mr-1 h-3.5 w-3.5" />
        Published
      </span>
    );

    if (!showTooltip) {
      return badge;
    }

    return (
      <Tooltip
        content={
          <div className="flex items-start gap-3 text-left">
            <div className="bg-emerald-100 p-2 rounded-md flex items-center justify-center">
              <FontAwesomeIcon icon={faCircleCheck} className="h-5 w-5 text-emerald-600" />
            </div>
            <div>Papers that have undergone peer review and been formally published.</div>
          </div>
        }
        position="top"
        width="w-[360px]"
      >
        {badge}
      </Tooltip>
    );
  }

  // Should never reach here due to type constraints
  return null;
};

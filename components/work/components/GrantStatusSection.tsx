'use client';

import { Work } from '@/types/work';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import { isDeadlineInFuture } from '@/utils/date';
import { GRANT_STATUS_CONFIG, GrantStatus } from '@/types/grant';

interface GrantStatusSectionProps {
  work: Work;
}

export const GrantStatusSection = ({ work }: GrantStatusSectionProps) => {
  const grant = work.note?.post?.grant;
  const status: GrantStatus = grant?.status ?? 'CLOSED';
  const config = GRANT_STATUS_CONFIG[status];

  if (!grant?.endDate) {
    return (
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-2">Status</h3>
        <div className="flex items-center gap-2 text-gray-800 text-sm">
          <span className={`h-2 w-2 rounded-full ${config.dotClass} inline-block`} />
          <span>{config.label}</span>
        </div>
      </div>
    );
  }

  const endDate = new Date(grant.endDate);
  const isActive = status === 'OPEN' && (grant.endDate ? isDeadlineInFuture(grant.endDate) : true);

  return (
    <div>
      <h3 className="text-base font-semibold text-gray-900 mb-2">Status</h3>
      <div className="flex items-center gap-2 text-gray-800 text-sm">
        <span className={`h-2 w-2 rounded-full ${config.dotClass} inline-block`} />
        <span>{config.label}</span>
      </div>
      {isActive && (
        <div className="text-sm text-gray-600 mt-1">
          <div className="flex items-center gap-1">
            <Clock size={14} className="text-gray-500" />
            <span>
              Closes {format(endDate, 'MMMM d, yyyy')} at {format(endDate, 'h:mm a')}
            </span>
          </div>
        </div>
      )}
      {(status === 'CLOSED' || (status === 'OPEN' && !isActive)) && (
        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
          <Clock size={14} className="text-gray-500" />
          <span>
            Closed on {format(endDate, 'MMMM d, yyyy')} at {format(endDate, 'h:mm a')}
          </span>
        </div>
      )}
    </div>
  );
};

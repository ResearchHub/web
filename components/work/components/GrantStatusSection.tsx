'use client';

import { Work } from '@/types/work';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import { isDeadlineInFuture } from '@/utils/date';
import { RollingDeadlineInfo } from './RollingDeadlineInfo';

interface GrantStatusSectionProps {
  work: Work;
}

export const GrantStatusSection = ({ work }: GrantStatusSectionProps) => {
  const endDate = work.note?.post?.grant?.endDate
    ? new Date(work.note?.post?.grant?.endDate)
    : null;
  const isActive =
    work.note?.post?.grant?.status === 'OPEN' &&
    (work.note?.post?.grant?.endDate ? isDeadlineInFuture(work.note?.post?.grant?.endDate) : true);

  return (
    <div>
      <h3 className="text-base font-semibold text-gray-900 mb-2">Status</h3>
      <div className="flex items-center gap-2 text-gray-800 text-sm">
        <span
          className={`h-2 w-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-400'} inline-block`}
        />
        <span>{isActive ? 'Accepting Applications' : 'Closed'}</span>
      </div>
      {/* Rolling deadline for open grants */}
      {isActive && <RollingDeadlineInfo className="mt-1" />}
      {!isActive && endDate && (
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

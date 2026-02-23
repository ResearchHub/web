'use client';

import { Work } from '@/types/work';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import { isDeadlineInFuture } from '@/utils/date';
import { RadiatingDot } from '@/components/ui/RadiatingDot';

interface GrantStatusSectionProps {
  work: Work;
}

export const GrantStatusSection = ({ work }: GrantStatusSectionProps) => {
  // Handle missing deadline gracefully
  if (!work.note?.post?.grant?.endDate) {
    return (
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-2">Status</h3>
        <div className="flex items-center gap-2 text-gray-800 text-sm">
          <RadiatingDot color="bg-gray-400" isRadiating={false} dotSize={8} />
          <span>Unknown</span>
        </div>
      </div>
    );
  }

  const endDate = new Date(work.note?.post?.grant?.endDate);
  const isActive =
    work.note?.post?.grant?.status === 'OPEN' &&
    (work.note?.post?.grant?.endDate ? isDeadlineInFuture(work.note?.post?.grant?.endDate) : true);

  return (
    <div>
      <h3 className="text-base font-semibold text-gray-900 mb-2">Status</h3>
      <div className="flex items-center gap-2 text-gray-800 text-sm">
        <RadiatingDot
          color={isActive ? 'bg-emerald-500' : 'bg-gray-400'}
          radiateColor="bg-emerald-400"
          ringColor="border-emerald-200"
          isRadiating={isActive}
          size={12}
          dotSize={8}
        />
        <span>{isActive ? 'Accepting Applications' : 'Closed'}</span>
      </div>
      {/* Deadline information for open grants */}
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
      {!isActive && (
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

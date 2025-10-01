'use client';

import { Work } from '@/types/work';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import dayjs from 'dayjs';

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
          <span className="h-2 w-2 rounded-full bg-gray-400 inline-block" />
          <span>Unknown</span>
        </div>
      </div>
    );
  }

  const endDate = new Date(work.note?.post?.grant?.endDate);
  const isClosedByDate = dayjs(endDate).isBefore(dayjs(), 'day');
  const isOpen = work.note?.post?.grant?.status === 'OPEN' && !isClosedByDate;

  return (
    <div>
      <h3 className="text-base font-semibold text-gray-900 mb-2">Status</h3>
      <div className="flex items-center gap-2 text-gray-800 text-sm">
        <span
          className={`h-2 w-2 rounded-full ${isOpen ? 'bg-emerald-500' : 'bg-gray-400'} inline-block`}
        />
        <span>{isOpen ? 'Accepting Applications' : 'Closed'}</span>
      </div>
      {/* Deadline information for open grants */}
      {isOpen && (
        <div className="text-sm text-gray-600 mt-1">
          <div className="flex items-center gap-1">
            <Clock size={14} className="text-gray-500" />
            <span>
              Closes {format(endDate, 'MMMM d, yyyy')} at {format(endDate, 'h:mm a')}
            </span>
          </div>
        </div>
      )}
      {!isOpen && (
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

'use client';

import { Work } from '@/types/work';
import { format } from 'date-fns';
import { Clock, RefreshCw } from 'lucide-react';
import { isDeadlineInFuture } from '@/utils/date';
import { SidebarHeader } from '@/components/ui/SidebarHeader';

interface GrantDetailsSectionProps {
  work: Work;
}

export const GrantDetailsSection = ({ work }: GrantDetailsSectionProps) => {
  const endDate = work.note?.post?.grant?.endDate ? new Date(work.note.post.grant.endDate) : null;

  const isActive =
    work.note?.post?.grant?.status === 'OPEN' &&
    (endDate ? isDeadlineInFuture(work.note.post.grant.endDate) : true);

  return (
    <div>
      <SidebarHeader title="Details" />
      <div className="space-y-1.5 text-sm text-gray-700">
        <div className="flex items-center gap-1.5">
          <RefreshCw className="h-3.5 w-3.5 text-gray-500" />
          <span>Rolling Funding</span>
        </div>
        {endDate && (
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-gray-500" />
            <span>
              {isActive
                ? `Closes ${format(endDate, 'MMMM d, yyyy')}`
                : `Closed on ${format(endDate, 'MMMM d, yyyy')}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

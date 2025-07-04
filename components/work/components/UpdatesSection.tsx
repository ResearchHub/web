'use client';

import { Bell } from 'lucide-react';
import { ProgressUpdates } from '@/components/ui/ProgressUpdates';
import { calculateUpdateRate } from '@/components/Fund/lib/FundUtils';
import { UpdateRateBadge } from '@/components/ui/badges/UpdateRateBadge';

interface Update {
  id: number;
  createdDate: string;
  content?: any;
}

interface UpdatesSectionProps {
  updates: Update[];
  startDate?: string; // Project start date
  className?: string;
}

export const UpdatesSection = ({ updates = [], startDate, className }: UpdatesSectionProps) => {
  if (updates.length === 0 && !startDate) {
    return null;
  }

  const updateRate = calculateUpdateRate(updates);

  return (
    <section className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-gray-500" />
          <h2 className="text-base font-semibold text-gray-900">Author Updates</h2>
        </div>
        <div className="flex items-center gap-2">
          <UpdateRateBadge updateRate={updateRate} />
        </div>
      </div>

      <ProgressUpdates updates={updates} />
    </section>
  );
};

'use client';

import { Bell } from 'lucide-react';
import { ProgressUpdates } from '@/components/ui/ProgressUpdates';

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
  return (
    <section className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-gray-500" />
          <h2 className="text-base font-semibold text-gray-900">Author Updates</h2>
        </div>
      </div>

      <ProgressUpdates updates={updates} startDate={startDate} />
    </section>
  );
};

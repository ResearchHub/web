'use client';

import { FC } from 'react';
import { Activity } from 'lucide-react';
import { cn } from '@/utils/styles';

interface ActivitySidebarProps {
  className?: string;
}

export const ActivitySidebar: FC<ActivitySidebarProps> = ({ className }) => {
  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 p-6', className)}>
      <div className="flex items-center gap-2 mb-4">
        <Activity size={18} className="text-gray-400" />
        <h2 className="text-lg font-semibold text-gray-900">Activity</h2>
      </div>

      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <Activity size={24} className="text-gray-400" />
        </div>
        <p className="text-sm text-gray-500">Activity feed coming soon</p>
        <p className="text-xs text-gray-400 mt-1">See recent contributions and updates</p>
      </div>
    </div>
  );
};

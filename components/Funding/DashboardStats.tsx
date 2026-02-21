'use client';

import { FC } from 'react';
import { BarChart3 } from 'lucide-react';
import { cn } from '@/utils/styles';

interface DashboardStatsProps {
  className?: string;
}

export const DashboardStats: FC<DashboardStatsProps> = ({ className }) => {
  return (
    <div className={cn('rounded-xl border border-gray-200 p-6', className)}>
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={18} className="text-gray-400" />
        <h2 className="text-lg font-semibold text-gray-900">Stats</h2>
      </div>

      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <BarChart3 size={24} className="text-gray-400" />
        </div>
        <p className="text-sm text-gray-500">Stats coming soon</p>
      </div>
    </div>
  );
};

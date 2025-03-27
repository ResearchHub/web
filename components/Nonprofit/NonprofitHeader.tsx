'use client';

import { Building, HelpCircle } from 'lucide-react';
import { cn } from '@/utils/styles';

interface NonprofitHeaderProps {
  readOnly?: boolean;
  showEndaomentInfo: boolean;
  onInfoClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function NonprofitHeader({
  readOnly = false,
  showEndaomentInfo,
  onInfoClick,
}: NonprofitHeaderProps) {
  return (
    <div className="mb-2">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Building className="h-4 w-4 text-gray-700" />
        <h3 className="text-[15px] font-semibold tracking-tight text-gray-900">
          {readOnly ? 'Nonprofit Organization' : 'Find a Nonprofit'}
        </h3>
        <button
          className={cn(
            'p-1 rounded-full hover:bg-gray-100',
            showEndaomentInfo ? 'text-primary-600 bg-gray-100' : 'text-gray-400 hover:text-gray-600'
          )}
          onClick={onInfoClick}
          type="button"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

import React from 'react';
import { Filter, Info } from 'lucide-react';

interface FilterSummaryBarProps {
  activeFilterCount: number;
  onClearAll: () => void;
}

export function FilterSummaryBar({ activeFilterCount, onClearAll }: FilterSummaryBarProps) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-3 mb-4 -mx-4 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium">
            {activeFilterCount === 0
              ? 'Showing all papers'
              : `${activeFilterCount} filter${activeFilterCount === 1 ? '' : 's'} active`}
          </span>
          {activeFilterCount === 0 && (
            <div className="group relative">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute left-0 top-6 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 rotate-45"></div>
                When no categories are selected, papers from all research areas will be shown in
                your feed.
              </div>
            </div>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={onClearAll}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}

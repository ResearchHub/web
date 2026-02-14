'use client';

import { FC } from 'react';
import { cn } from '@/utils/styles';

export type BrowseView = 'opportunities' | 'orgs';

interface BrowseToggleProps {
  activeView: BrowseView;
  onChangeView: (view: BrowseView) => void;
}

const options: { value: BrowseView; label: string }[] = [
  { value: 'opportunities', label: 'Opportunities' },
  { value: 'orgs', label: 'Organizations' },
];

export const BrowseToggle: FC<BrowseToggleProps> = ({ activeView, onChangeView }) => {
  return (
    <div className="inline-flex items-center bg-gray-100 rounded-lg p-0.5">
      {options.map((opt) => {
        const isActive = activeView === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChangeView(opt.value)}
            className={cn(
              'px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200',
              isActive
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

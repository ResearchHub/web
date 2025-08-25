'use client';

import { Button } from '@/components/ui/Button';
import { Dropdown, DropdownItem } from '@/components/ui/form/Dropdown';
import { cn } from '@/utils/styles';
import { ChevronDown } from 'lucide-react';
import type { ListVisibility } from '@/types/userList';

interface UserListFiltersProps {
  currentVisibility?: ListVisibility;
  onVisibilityChange: (visibility: ListVisibility | undefined) => void;
  className?: string;
}

export const UserListFilters = ({
  currentVisibility,
  onVisibilityChange,
  className,
}: UserListFiltersProps) => {
  const getVisibilityLabel = (visibility: ListVisibility) => {
    switch (visibility) {
      case 'PRIVATE':
        return 'Private';
      case 'SHARED':
        return 'Shared';
      case 'PUBLIC':
        return 'Public';
      default:
        return 'All Lists';
    }
  };

  const handleVisibilityChange = (value: string) => {
    if (value === 'all') {
      onVisibilityChange(undefined);
    } else {
      onVisibilityChange(value as ListVisibility);
    }
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-4', className)}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Filter by:</span>
        <Dropdown
          trigger={
            <div className="flex items-center justify-between w-48 px-3 py-2 border border-gray-200 rounded-lg bg-white">
              <span>{currentVisibility ? getVisibilityLabel(currentVisibility) : 'All Lists'}</span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </div>
          }
        >
          <DropdownItem onClick={() => handleVisibilityChange('all')}>All Lists</DropdownItem>
          <DropdownItem onClick={() => handleVisibilityChange('PRIVATE')}>Private</DropdownItem>
          <DropdownItem onClick={() => handleVisibilityChange('SHARED')}>Shared</DropdownItem>
          <DropdownItem onClick={() => handleVisibilityChange('PUBLIC')}>Public</DropdownItem>
        </Dropdown>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Sort by:</span>
        <Dropdown
          trigger={
            <div className="flex items-center justify-between w-40 px-3 py-2 border border-gray-200 rounded-lg bg-white">
              <span>Recently Updated</span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </div>
          }
        >
          <DropdownItem onClick={() => {}}>Recently Updated</DropdownItem>
          <DropdownItem onClick={() => {}}>Recently Created</DropdownItem>
          <DropdownItem onClick={() => {}}>Name A-Z</DropdownItem>
          <DropdownItem onClick={() => {}}>Most Items</DropdownItem>
        </Dropdown>
      </div>
    </div>
  );
};

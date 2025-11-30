'use client';

import { UserList } from '@/components/UserList/lib/user-list';
import { formatItemCount } from '@/components/UserList/lib/listUtils';
import { Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { formatTimeAgo } from '@/utils/date';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { useState } from 'react';

interface UserListRowProps {
  readonly list: UserList;
  readonly onEdit: (list: UserList) => void;
  readonly onDelete: (list: UserList) => void;
}

export const UserListRow = ({ list, onEdit, onDelete }: UserListRowProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Link
      href={`/list/${list.id}`}
      className="group grid grid-cols-[1fr_auto] sm:!grid-cols-[3fr_2fr_2fr_1fr_auto] gap-4 items-center px-4 py-3 rounded-md hover:bg-gray-100 transition-colors border-b border-transparent hover:border-gray-200"
    >
      <div className="flex flex-col min-w-0">
        <span className="font-medium text-gray-900 truncate">{list.name}</span>
        <span className="text-xs text-gray-500 sm:!hidden">
          {formatItemCount(list)} • {formatTimeAgo(list.updatedDate)}
        </span>
      </div>
      <span className="hidden sm:!block text-sm text-gray-500 truncate">
        {formatTimeAgo(list.createdDate)}
      </span>
      <span className="hidden sm:!block text-sm text-gray-500 truncate">
        {formatTimeAgo(list.updatedDate)}
      </span>
      <span className="hidden sm:!block text-sm text-gray-500">{formatItemCount(list)}</span>
      <div className="flex items-center justify-end opacity-100 sm:!opacity-0 sm:group-hover:!opacity-100 transition-opacity">
        <BaseMenu
          trigger={
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          }
          align="end"
          open={isMenuOpen}
          onOpenChange={setIsMenuOpen}
        >
          <BaseMenuItem
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsMenuOpen(false);
              onEdit(list);
            }}
            className="flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit</span>
          </BaseMenuItem>
          <BaseMenuItem
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsMenuOpen(false);
              onDelete(list);
            }}
            className="flex items-center gap-2 text-red-600 hover:!text-red-600"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </BaseMenuItem>
        </BaseMenu>
      </div>
    </Link>
  );
};

export const UserListRowSkeleton = () => (
  <div className="px-4 py-3 grid grid-cols-[1fr_auto] sm:!grid-cols-[3fr_2fr_2fr_1fr_auto] gap-4 items-center animate-pulse">
    <Skeleton className="h-5 w-1/3" />
    <Skeleton className="hidden sm:!block h-4 w-1/4" />
    <Skeleton className="hidden sm:!block h-4 w-1/4" />
    <Skeleton className="hidden sm:!block h-4 w-16" />
    <div className="w-10" />
  </div>
);

export const UserListTableHeader = () => (
  <div className="hidden sm:!grid grid-cols-[3fr_2fr_2fr_1fr_auto] gap-4 items-center px-4 py-3 text-sm font-medium text-gray-700 border-b border-gray-200">
    <span>Name</span>
    <span>Created Date</span>
    <span>Last Updated</span>
    <span># Items</span>
    <div className="w-10" />
  </div>
);

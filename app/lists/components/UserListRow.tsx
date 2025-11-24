'use client';

import { UserList } from '@/components/UserList/lib/user-list';
import { formatItemCount } from '@/components/UserList/lib/listUtils';
import { Edit2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { formatTimeAgo } from '@/utils/date';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';

interface UserListRowProps {
  list: UserList;
  onEdit: (list: UserList) => void;
  onDelete: (list: UserList) => void;
}

export const UserListRow = ({ list, onEdit, onDelete }: UserListRowProps) => (
  <Link
    href={`/list/${list.id}`}
    className="group grid grid-cols-[1fr_auto] sm:!grid-cols-[4fr_2fr_1fr_auto] gap-4 items-center px-4 py-3 rounded-md hover:bg-gray-100 transition-colors border-b border-transparent hover:border-gray-200"
  >
    <div className="flex flex-col min-w-0">
      <span className="font-medium text-gray-900 truncate">{list.name}</span>
      <span className="text-xs text-gray-500 sm:!hidden">
        {formatItemCount(list)} • {formatTimeAgo(list.updated_date)}
      </span>
    </div>
    <span className="hidden sm:!block text-sm text-gray-500 truncate">
      {formatTimeAgo(list.updated_date)}
    </span>
    <span className="hidden sm:!block text-sm text-gray-500 text-right tabular-nums">
      {formatItemCount(list)}
    </span>
    <div className="flex items-center justify-end gap-1 opacity-100 sm:!opacity-0 sm:group-hover:!opacity-100 transition-opacity">
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onEdit(list);
        }}
        className="text-gray-500 hover:text-gray-900"
      >
        <Edit2 className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete(list);
        }}
        className="text-gray-500 hover:text-red-600"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  </Link>
);

export const UserListRowSkeleton = () => (
  <div className="px-4 py-3 grid grid-cols-[1fr_auto] sm:!grid-cols-[4fr_2fr_1fr_auto] gap-4 items-center animate-pulse">
    <Skeleton className="h-5 w-1/3" />
    <Skeleton className="hidden sm:!block h-4 w-1/4" />
    <Skeleton className="hidden sm:!block h-4 w-10 ml-auto" />
    <div className="w-16" />
  </div>
);

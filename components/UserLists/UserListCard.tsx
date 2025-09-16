'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UserListCardMenu } from './UserListCardMenu';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Eye, EyeOff, Users, Lock, Calendar, FileText, MoreVertical } from 'lucide-react';
import type { UserList, UpdateUserListParams } from '@/types/userList';
import { cn } from '@/utils/styles';

interface UserListCardProps {
  list: UserList;
  onUpdate: (listId: string, params: UpdateUserListParams) => Promise<void>;
  onDelete: (listId: string) => Promise<void>;
}

export const UserListCard = ({ list, onUpdate, onDelete }: UserListCardProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getVisibilityIcon = () => {
    switch (list.visibility) {
      case 'PUBLIC':
        return <Eye className="h-4 w-4" />;
      case 'SHARED':
        return <Users className="h-4 w-4" />;
      case 'PRIVATE':
        return <Lock className="h-4 w-4" />;
      default:
        return <EyeOff className="h-4 w-4" />;
    }
  };

  const getVisibilityLabel = () => {
    switch (list.visibility) {
      case 'PUBLIC':
        return 'Public';
      case 'SHARED':
        return 'Shared';
      case 'PRIVATE':
        return 'Private';
      default:
        return 'Unknown';
    }
  };

  const getVisibilityColor = () => {
    switch (list.visibility) {
      case 'PUBLIC':
        return 'bg-green-100 text-green-800';
      case 'SHARED':
        return 'bg-blue-100 text-blue-800';
      case 'PRIVATE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="group relative bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md">
      {/* Card Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <Link href={`/lists/${list.id}`} className="block hover:no-underline">
              <h3 className="text-lg font-semibold text-gray-900 truncate hover:text-blue-600 transition-colors">
                {list.title}
              </h3>
            </Link>
            {list.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{list.description}</p>
            )}
          </div>

          {/* Menu Button */}
          <div className="relative ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>

            {isMenuOpen && (
              <UserListCardMenu
                list={list}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onClose={() => setIsMenuOpen(false)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="px-4 pb-4">
        {/* Tags */}
        {list.tags && list.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {list.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="primary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {list.tags.length > 3 && (
              <Badge variant="primary" className="text-xs">
                +{list.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>{list.itemCount} items</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(list.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>

          <Badge className={cn('text-xs', getVisibilityColor())}>
            <div className="flex items-center gap-1">
              {getVisibilityIcon()}
              {getVisibilityLabel()}
            </div>
          </Badge>
        </div>
      </div>

      {/* Card Actions */}
      <div className="px-4 pb-4">
        <div className="flex gap-2">
          <Link href={`/lists/${list.id}`} className="flex-1">
            <Button variant="outlined" className="w-full">
              View List
            </Button>
          </Link>
          {list.isEditable && (
            <Link href={`/lists/${list.id}/edit`}>
              <Button variant="outlined" size="sm">
                Edit
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

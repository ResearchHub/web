'use client';

import { useState } from 'react';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { Button } from '@/components/ui/Button';
import { Edit, Trash2, Share, Copy, MoreVertical } from 'lucide-react';
import type { UserList, UpdateUserListParams } from '@/types/userList';

interface UserListCardMenuProps {
  list: UserList;
  onUpdate: (listId: string, params: UpdateUserListParams) => Promise<void>;
  onDelete: (listId: string) => Promise<void>;
  onClose: () => void;
}

export const UserListCardMenu = ({ list, onUpdate, onDelete, onClose }: UserListCardMenuProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(list.id?.toString() || '');
      setIsDeleteDialogOpen(false);
      onClose();
    } catch (error) {
      console.error('Failed to delete list:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/lists/${list.id}`;
    navigator.clipboard.writeText(url);
    onClose();
  };

  return (
    <>
      <BaseMenu
        trigger={
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        }
        align="end"
        className="w-48"
      >
        <BaseMenuItem onClick={() => window.open(`/lists/${list.id}`, '_blank')}>
          <Edit className="mr-2 h-4 w-4" />
          Edit List
        </BaseMenuItem>

        <BaseMenuItem onClick={handleCopyLink}>
          <Copy className="mr-2 h-4 w-4" />
          Copy Link
        </BaseMenuItem>

        {list.isEditable && (
          <BaseMenuItem onClick={() => window.open(`/lists/${list.id}/share`, '_blank')}>
            <Share className="mr-2 h-4 w-4" />
            Share List
          </BaseMenuItem>
        )}

        {list.isEditable && (
          <>
            <div className="h-px bg-gray-200 my-1" />
            <BaseMenuItem
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete List
            </BaseMenuItem>
          </>
        )}
      </BaseMenu>

      {/* TODO: Add confirmation dialog when component is available */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md">
            <h3 className="text-lg font-semibold mb-2">Delete List</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{list.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outlined"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

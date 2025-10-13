'use client';

import { KeyboardEvent, MouseEvent, useCallback, useState } from 'react';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { List } from '@/services/list.service';
import { Card } from '@/components/ui/Card';
import { Check, Pencil, Trash2 } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { useUser } from '@/contexts/UserContext';
import { ID } from '@/types/root';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { LIST_NAME_MAX_LENGTH } from '@/components/modals/SaveToListModal';
import { useDeleteList, useUpdateList } from '@/hooks/useList';
import { TitleSection } from '@/components/Feed/BaseFeedItem';

type ListCardNameProps = {
  list: List;
  refresh: () => Promise<void>;
  listPath?: string;
};

type ListCardProps = {
  list: List;
  authorId: ID;
  refreshLists: () => Promise<void>;
};

export function ListCardSkeleton() {
  return (
    <div className="h-16 bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex flex-row items-center justify-between">
        {/* Left side - mimics ListCardName */}
        <div className="flex flex-row items-center justify-between gap-4">
          {/* Rename button */}
          <div className="flex items-center rounded-lg space-x-2 py-1.5 px-1.5">
            <div className="h-3.5 w-3.5 bg-gray-200 rounded animate-pulse" />
          </div>
          {/* List name */}
          <div className="h-6 w-32 md:h-7 md:w-40 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Right side - mimics delete button (always show since we don't know ownership during loading) */}
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-md">
            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ListCardName({ list, refresh, listPath = '' }: ListCardNameProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const { updateList, isLoading: isUpdating } = useUpdateList();

  const navToList = useCallback(
    (e: MouseEvent) => {
      if (!listPath) return;

      e.preventDefault();
      e.stopPropagation();

      router.push(listPath);
    },
    [listPath, router]
  );

  const renameList = useCallback(async () => {
    await updateList({ id: list.id, name: newName });

    refresh();
  }, [list.id, newName, refresh]);

  const onCheckClick = useCallback(() => {
    setIsEditing(false);

    if (!newName || newName === list.name) {
      return;
    }

    void renameList();
  }, [newName, list.name, renameList]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();

        onCheckClick();
      } else if (e.key === 'Escape') {
        e.preventDefault();

        setIsEditing(false);
        setNewName('');
      }
    },
    [onCheckClick]
  );

  if (isEditing) {
    return (
      <div className="flex flex-row items-center justify-between gap-4">
        <Tooltip content="Save" delay={300}>
          <button
            onClick={onCheckClick}
            className="flex items-center rounded-lg space-x-2 py-1.5 px-1.5 bg-green-100 text-green-500 hover:bg-green-200 hover:text-green-600"
            disabled={isUpdating}
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        </Tooltip>
        <Input
          placeholder={list.name}
          onChange={(e) => setNewName(e.target.value.trim())}
          onKeyDown={handleKeyDown}
          maxLength={LIST_NAME_MAX_LENGTH}
          disabled={isUpdating}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-row items-center justify-between gap-4">
      <Tooltip content="Rename" delay={300}>
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center rounded-lg space-x-2 py-1.5 px-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
          disabled={isUpdating}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </Tooltip>
      <div onClick={navToList}>
        <TitleSection
          title={list.name}
          className={`mb-0 ${listPath ? 'hover:text-blue-600 cursor-pointer' : ''}`}
        />
      </div>
    </div>
  );
}

export default function ListCard({ list, authorId, refreshLists }: ListCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const { user } = useUser();
  const owner = user?.authorProfile?.id === authorId;
  const isMobile = useIsMobile();
  const deleteColor = isMobile ? 'text-red-400' : 'text-red-600 hover:text-red-800 hover:bg-red-50';
  const { deleteList: deleteListFn, isLoading: isDeletingList } = useDeleteList();

  const deleteList = useCallback(async () => {
    await deleteListFn({ id: list.id });

    refreshLists();
  }, [list.id, refreshLists]);

  return (
    <Card>
      <div className="flex flex-row items-center justify-between">
        <ListCardName
          list={list}
          refresh={refreshLists}
          listPath={`/author/${authorId}/list/${list.id}`}
        />
        {owner && (
          <div className="flex items-center space-x-2">
            <Tooltip content="Delete list" delay={300}>
              <Button
                variant="outlined"
                size="sm"
                onClick={() => executeAuthenticatedAction(() => setShowDeleteModal(true))}
                className={`p-2 ${deleteColor} rounded-md transition-colors`}
                disabled={isDeletingList}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Tooltip>
            <ConfirmModal
              isOpen={showDeleteModal}
              onClose={() => {
                setShowDeleteModal(false);
              }}
              onConfirm={deleteList}
              title={list.name}
              message="Are your sure you want to delete this list?"
              confirmText="Yes, delete"
              cancelText="Cancel"
              confirmButtonClass="bg-red-600 hover:bg-red-700"
              cancelButtonClass="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            />
          </div>
        )}
      </div>
    </Card>
  );
}

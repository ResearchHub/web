'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { BaseModal } from '@/components/ui/BaseModal';
import { Input } from '@/components/ui/form/Input';
import { Loader } from '@/components/ui/Loader';
import { useUserListsContext } from '@/components/UserList/lib/UserListsContext';
import { useIsInList } from '@/components/UserList/lib/hooks/useIsInList';
import { UserListOverview } from '@/components/UserList/lib/user-list';
import { Plus } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/pro-light-svg-icons';
import { faBookmark as faBookmarkSolid } from '@fortawesome/pro-solid-svg-icons';
import { toast } from 'react-hot-toast';
import { ListService } from '@/components/UserList/lib/services/list.service';
import { Skeleton } from '@/components/ui/Skeleton';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';

interface AddToListModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly unifiedDocumentId: number;
}

function ListLoadingSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, skeletonIndex) => (
        <div
          key={'list-skeleton-load-' + skeletonIndex}
          className="flex items-center gap-3 p-3 rounded-lg border border-gray-200"
        >
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-5 w-32 flex-1" />
        </div>
      ))}
    </div>
  );
}

function ListEmptyState({ onFocus }: { readonly onFocus: () => void }) {
  return (
    <div className="text-center py-8">
      <p className="text-gray-600 mb-4">You don't have any lists yet.</p>
      <Button onClick={onFocus} variant="outlined" className="gap-2">
        <Plus className="w-4 h-4" />
        Create Your First List
      </Button>
    </div>
  );
}

interface ListCreateFormProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onSubmit: () => void;
  readonly onCancel: () => void;
  readonly isLoading: boolean;
  readonly inputRef?: React.RefObject<HTMLInputElement>;
}

function ListCreateForm({
  value,
  onChange,
  onSubmit,
  onCancel,
  isLoading,
  inputRef,
}: Readonly<ListCreateFormProps>) {
  function handleEnterKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
    const isEnterKey = event.key === 'Enter';
    const hasValue = value.trim().length > 0;

    if (isEnterKey && hasValue) {
      event.preventDefault();
      event.stopPropagation();
      onSubmit();
    }
  }

  const isSubmitDisabled = value.trim().length === 0;

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Create New List</h3>
      <Input
        ref={inputRef}
        placeholder="List name"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleEnterKeyPress}
        className="mb-3"
      />
      <div className="flex gap-2">
        <LoadingButton
          onClick={onSubmit}
          disabled={isSubmitDisabled}
          size="sm"
          isLoading={isLoading}
          loadingText="Creating..."
        >
          Create
        </LoadingButton>
        <Button onClick={onCancel} variant="outlined" size="sm">
          Cancel
        </Button>
      </div>
    </div>
  );
}

interface ListSelectItemProps {
  readonly list: UserListOverview;
  readonly isChecked: boolean;
  readonly isRemoving: boolean;
  readonly onToggle: () => void;
}

function ListSelectItem({ list, isChecked, isRemoving, onToggle }: Readonly<ListSelectItemProps>) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={isRemoving}
      className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors text-left hover:bg-gray-50 ${
        isRemoving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 truncate">{list.name}</div>
      </div>
      {isRemoving ? (
        <Loader size="sm" />
      ) : (
        <FontAwesomeIcon
          icon={isChecked ? faBookmarkSolid : faBookmark}
          className={`w-5 h-5 transition-colors ${isChecked ? 'text-gray-900' : 'text-gray-400'}`}
        />
      )}
    </button>
  );
}

function sortListsByDocumentMembership(
  allLists: UserListOverview[],
  listIdsContainingDocument: number[]
): UserListOverview[] {
  const listsAlreadyContainingDocument: UserListOverview[] = [];
  const listsNotYetContainingDocument: UserListOverview[] = [];

  for (const list of allLists) {
    if (listIdsContainingDocument.includes(list.listId)) {
      listsAlreadyContainingDocument.push(list);
    } else {
      listsNotYetContainingDocument.push(list);
    }
  }

  return [...listsAlreadyContainingDocument, ...listsNotYetContainingDocument];
}

export function AddToListModal({
  isOpen,
  onClose,
  unifiedDocumentId,
}: Readonly<AddToListModalProps>) {
  const { listDetails, isLoading, refetch, listIdsContainingDocument } = useIsInList(
    isOpen ? unifiedDocumentId : null
  );
  const { createList } = useUserListsContext();

  const [newListName, setNewListName] = useState('');
  const [isCreatingNewList, setIsCreatingNewList] = useState(false);
  const [togglingListId, setTogglingListId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const createInputRef = useRef<HTMLInputElement>(null);

  const openCreateFormAndFocus = () => {
    setShowCreateForm(true);
    setTimeout(() => createInputRef.current?.focus(), 0);
  };

  const closeCreateForm = () => {
    setShowCreateForm(false);
    setNewListName('');
  };

  useEffect(() => {
    if (isOpen) {
      closeCreateForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleCreateList = async () => {
    const trimmedListName = newListName.trim();
    if (trimmedListName.length === 0) return;

    setIsCreatingNewList(true);
    try {
      await createList({ name: trimmedListName }, false);
      closeCreateForm();
      refetch();
    } catch (error) {
      toast.error(extractApiErrorMessage(error, 'Failed to create list'));
      console.error('Failed to create list:', error);
    } finally {
      setIsCreatingNewList(false);
    }
  };

  const handleAddToList = async (listId: number) => {
    const listToAddTo = listDetails.find((list) => list.listId === listId);
    if (!listToAddTo) return;

    setTogglingListId(listId);
    try {
      await ListService.addItemToListApi(listId, unifiedDocumentId);
      toast.success(`Added to "${listToAddTo.name}"`);
      refetch();
    } catch (error) {
      toast.error(extractApiErrorMessage(error, `Failed to add to "${listToAddTo.name}"`));
      console.error('Failed to add to list:', error);
    } finally {
      setTogglingListId(null);
    }
  };

  const handleRemoveFromList = async (listId: number) => {
    const listToRemoveFrom = listDetails.find((list) => list.listId === listId);
    const documentInList = listToRemoveFrom?.unifiedDocuments?.find(
      (doc) => doc.unifiedDocumentId === unifiedDocumentId
    );

    if (!documentInList?.listItemId || !listToRemoveFrom) return;

    setTogglingListId(listId);
    try {
      await ListService.removeItemFromListApi(listId, documentInList.listItemId);
      toast.success(`Removed from "${listToRemoveFrom.name}"`);
      refetch();
    } catch (error) {
      toast.error(
        extractApiErrorMessage(error, `Failed to remove from "${listToRemoveFrom.name}"`)
      );
      console.error('Failed to remove item from list:', error);
    } finally {
      setTogglingListId(null);
    }
  };

  const sortedLists = sortListsByDocumentMembership(listDetails, listIdsContainingDocument);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add to List"
      maxWidth="max-w-2xl"
      padding="p-6"
    >
      <div className="md:!min-w-[500px] md:!max-w-[500px]">
        {isLoading && <ListLoadingSkeleton />}

        {!isLoading && listDetails.length === 0 && !showCreateForm && (
          <ListEmptyState onFocus={openCreateFormAndFocus} />
        )}

        {!isLoading && (listDetails.length > 0 || showCreateForm) && (
          <>
            {showCreateForm && (
              <ListCreateForm
                value={newListName}
                onChange={setNewListName}
                onSubmit={handleCreateList}
                onCancel={closeCreateForm}
                isLoading={isCreatingNewList}
                inputRef={createInputRef}
              />
            )}

            {!showCreateForm && (
              <>
                <div className="space-y-2 max-h-[50vh] md:!max-h-72 overflow-y-auto">
                  {sortedLists.map((list) => {
                    const isInList = listIdsContainingDocument.includes(list.listId);
                    return (
                      <ListSelectItem
                        key={list.listId}
                        list={list}
                        isChecked={isInList}
                        isRemoving={togglingListId === list.listId}
                        onToggle={() =>
                          isInList
                            ? handleRemoveFromList(list.listId)
                            : handleAddToList(list.listId)
                        }
                      />
                    );
                  })}
                </div>

                <div className="border-t border-gray-200 mt-4 mb-4" />

                <Button
                  onClick={openCreateFormAndFocus}
                  variant="outlined"
                  className="w-full gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create New List
                </Button>
              </>
            )}
          </>
        )}
      </div>
    </BaseModal>
  );
}

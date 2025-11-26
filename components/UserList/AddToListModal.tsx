'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { BaseModal } from '@/components/ui/BaseModal';
import { Input } from '@/components/ui/form/Input';
import { Checkbox } from '@/components/ui/form/Checkbox';
import { Loader } from '@/components/ui/Loader';
import { useUserListsContext } from '@/components/UserList/lib/UserListsContext';
import { useIsInList } from '@/components/UserList/lib/hooks/useIsInList';
import { UserListOverview } from '@/components/UserList/lib/user-list';
import { Plus, Trash2, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ListService } from '@/components/UserList/lib/services/list.service';
import { pluralizeSuffix } from '@/utils/stringUtils';
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
  readonly isInList: boolean;
  readonly isRemoving: boolean;
  readonly onToggle: (checked: boolean) => void;
  readonly onRemove: (event: React.MouseEvent) => void;
}

function ListSelectItem({
  list,
  isChecked,
  isInList,
  isRemoving,
  onToggle,
  onRemove,
}: Readonly<ListSelectItemProps>) {
  return (
    <label
      className={`flex items-center gap-3 w-full p-3 rounded-lg border cursor-pointer transition-colors ${
        isChecked
          ? 'border-rhBlue-500 bg-rhBlue-50'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <Checkbox checked={isChecked} onCheckedChange={onToggle} />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 truncate">{list.name}</div>
        {isInList && (
          <div className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1 sm:!hidden">
            <Check className="w-3 h-3" />
            Already in list
          </div>
        )}
      </div>
      {isInList && (
        <>
          <div className="hidden sm:!flex items-center gap-1 text-xs text-green-600 font-medium">
            <Check className="w-3 h-3" />
            Already in list
          </div>
          <Button
            type="button"
            onClick={onRemove}
            disabled={isRemoving}
            variant="ghost"
            size="icon"
            className="flex-shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Remove"
          >
            {isRemoving ? <Loader size="sm" /> : <Trash2 className="w-4 h-4" />}
          </Button>
        </>
      )}
    </label>
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

  const [selectedListIds, setSelectedListIds] = useState<number[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isCreatingNewList, setIsCreatingNewList] = useState(false);
  const [removingListId, setRemovingListId] = useState<number | null>(null);
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
      setSelectedListIds(listIdsContainingDocument);
      closeCreateForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleAddToSelectedLists = async () => {
    if (selectedListIds.length === 0) return;
    setIsAdding(true);

    try {
      const listIdsToAdd = selectedListIds.filter((id) => !listIdsContainingDocument.includes(id));
      const additionResults = await Promise.allSettled(
        listIdsToAdd.map((id) => ListService.addItemToListApi(id, unifiedDocumentId))
      );
      const failedCount = additionResults.filter((result) => result.status === 'rejected').length;
      const successCount = additionResults.length - failedCount;

      if (successCount > 0) {
        toast.success(`Added to ${successCount} list${pluralizeSuffix(successCount)}`);
      }
      if (failedCount > 0) {
        toast.error(`Failed to add to ${failedCount} list${pluralizeSuffix(failedCount)}`);
      }

      refetch();
      onClose();
    } finally {
      setIsAdding(false);
    }
  };

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

  const handleAddToList = (listId: number) => {
    setSelectedListIds((previousSelectedListIds) => [...previousSelectedListIds, listId]);
  };

  const handleRemoveFromListSelection = (listId: number) => {
    setSelectedListIds((previousSelectedListIds) =>
      previousSelectedListIds.filter((id) => id !== listId)
    );
  };

  const handleRemoveFromList = async (listId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    const listToRemoveFrom = listDetails.find((list) => list.listId === listId);
    const documentInList = listToRemoveFrom?.unifiedDocuments?.find(
      (doc) => doc.unifiedDocumentId === unifiedDocumentId
    );

    if (!documentInList?.listItemId || !listToRemoveFrom) return;

    setRemovingListId(listId);
    try {
      await ListService.removeItemFromListApi(listId, documentInList.listItemId);
      toast.success(`Removed from "${listToRemoveFrom.name}"`);
      setSelectedListIds((previousSelectedListIds) =>
        previousSelectedListIds.filter((id) => id !== listId)
      );
      refetch();
    } catch (error) {
      toast.error(
        extractApiErrorMessage(error, `Failed to remove from "${listToRemoveFrom.name}"`)
      );
      console.error('Failed to remove item from list:', error);
    } finally {
      setRemovingListId(null);
    }
  };

  const sortedLists = sortListsByDocumentMembership(listDetails, listIdsContainingDocument);
  const numberOfNewListsToAddTo = selectedListIds.filter(
    (id) => !listIdsContainingDocument.includes(id)
  ).length;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add to List"
      maxWidth="max-w-2xl"
      padding="p-6"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outlined" onClick={onClose} disabled={isAdding}>
            Cancel
          </Button>
          <LoadingButton
            onClick={handleAddToSelectedLists}
            disabled={numberOfNewListsToAddTo === 0}
            isLoading={isAdding}
            loadingText="Adding..."
          >
            {numberOfNewListsToAddTo > 0
              ? `Add to ${numberOfNewListsToAddTo} List${pluralizeSuffix(numberOfNewListsToAddTo)}`
              : 'Add to List'}
          </LoadingButton>
        </div>
      }
    >
      <div className="md:!min-w-[500px] md:!max-w-[500px]">
        <p className="text-sm text-gray-600 mb-6">Select one or more lists to save this item</p>

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
                  {sortedLists.map((list) => (
                    <ListSelectItem
                      key={list.listId}
                      list={list}
                      isChecked={selectedListIds.includes(list.listId)}
                      isInList={listIdsContainingDocument.includes(list.listId)}
                      isRemoving={removingListId === list.listId}
                      onToggle={(isChecked) =>
                        isChecked
                          ? handleAddToList(list.listId)
                          : handleRemoveFromListSelection(list.listId)
                      }
                      onRemove={(event) => handleRemoveFromList(list.listId, event)}
                    />
                  ))}
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

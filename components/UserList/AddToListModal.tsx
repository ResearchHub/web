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
import { sortListsByDocumentMembership } from '@/components/UserList/lib/listUtils';
import Link from 'next/link';
import { cn } from '@/utils/styles';

interface AddToListModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly unifiedDocumentId: number;
}

const MOBILE_MODAL_HEIGHT_OFFSET = 200;
const MOBILE_LIST_MAX_HEIGHT_OFFSET = 205;

const TOAST_MESSAGES = {
  ITEM_ADDED: 'Item added.',
  ITEM_REMOVED: 'Item removed',
  FAILED_TO_CREATE_LIST: 'Failed to create list',
  FAILED_TO_ADD_TO_LIST: 'Failed to add to list',
  FAILED_TO_REMOVE_ITEM: 'Failed to remove item',
};

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

function CreateListButton({
  onClick,
  fullWidth = false,
}: {
  readonly onClick: () => void;
  readonly fullWidth?: boolean;
}) {
  return (
    <Button onClick={onClick} className={cn('gap-2', fullWidth && 'w-full')}>
      <Plus className="w-4 h-4" />
      Create List
    </Button>
  );
}

function ListEmptyState({ onFocus }: { readonly onFocus: () => void }) {
  return (
    <div className="text-center w-full">
      <FontAwesomeIcon icon={faBookmark} className="w-12 h-12 text-gray-300 mb-3" />
      <p className="text-gray-600 mb-4">You don't have any lists yet.</p>
      <CreateListButton onClick={onFocus} />
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

export function AddToListModal({
  isOpen,
  onClose,
  unifiedDocumentId,
}: Readonly<AddToListModalProps>) {
  const { listDetails, isLoading, listIdsContainingDocument } = useIsInList(
    isOpen ? unifiedDocumentId : null
  );
  const { createList, addDocumentToList, removeDocumentFromList } = useUserListsContext();

  const [newListName, setNewListName] = useState('');
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [togglingListId, setTogglingListId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const createInputRef = useRef<HTMLInputElement>(null);
  const [sortedLists, setSortedLists] = useState<UserListOverview[]>([]);

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

  useEffect(() => {
    if (!isLoading && listDetails.length > 0) {
      setSortedLists(sortListsByDocumentMembership(listDetails, listIdsContainingDocument));
    } else if (listDetails.length === 0) {
      setSortedLists([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const handleCreateList = async () => {
    const trimmedListName = newListName.trim();
    if (trimmedListName.length === 0) return;

    setIsCreatingList(true);
    try {
      await createList({ name: trimmedListName }, true);
      closeCreateForm();
    } catch (error) {
      toast.error(extractApiErrorMessage(error, TOAST_MESSAGES.FAILED_TO_CREATE_LIST));
      console.error('Failed to create list:', error);
    } finally {
      setIsCreatingList(false);
    }
  };

  const handleAddToList = async (listId: number) => {
    const listToAddTo = listDetails.find((list) => list.listId === listId);
    if (!listToAddTo) return;

    setTogglingListId(listId);
    try {
      const response = await ListService.addItemToListApi(listId, unifiedDocumentId);
      addDocumentToList(listId, unifiedDocumentId, response.id);

      const listUrl = `/list/${listId}`;
      toast.success(
        (t) => (
          <div className="flex items-center gap-2">
            <span className="text-gray-900">{TOAST_MESSAGES.ITEM_ADDED}</span>
            <Link
              href={listUrl}
              onClick={(e) => {
                e.stopPropagation();
                toast.dismiss(t.id);
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View List
            </Link>
          </div>
        ),
        { duration: 4000 }
      );
    } catch (error) {
      toast.error(extractApiErrorMessage(error, TOAST_MESSAGES.FAILED_TO_ADD_TO_LIST));
      console.error('Failed to add to list:', error);
    } finally {
      setTogglingListId(null);
    }
  };

  const handleRemoveFromList = async (listId: number) => {
    const listToRemoveFrom = listDetails.find((list) => list.listId === listId);
    if (!listToRemoveFrom) return;

    const documentInList = listToRemoveFrom.unifiedDocuments.find(
      (doc) => doc.unifiedDocumentId === unifiedDocumentId
    );

    if (!documentInList?.listItemId) return;

    setTogglingListId(listId);
    try {
      await ListService.removeItemFromListApi(listId, documentInList.listItemId);
      removeDocumentFromList(listId, unifiedDocumentId);
      toast.success(TOAST_MESSAGES.ITEM_REMOVED);
    } catch (error) {
      toast.error(extractApiErrorMessage(error, TOAST_MESSAGES.FAILED_TO_REMOVE_ITEM));
      console.error('Failed to remove item:', error);
    } finally {
      setTogglingListId(null);
    }
  };

  const listsToDisplay = sortedLists.length > 0 ? sortedLists : listDetails;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Save to…"
      maxWidth="max-w-2xl"
      padding="p-6"
    >
      <div
        className={cn(
          'md:!min-w-[500px] md:!max-w-[500px]',
          !isLoading &&
            listDetails.length === 0 &&
            !showCreateForm &&
            `h-[calc(100vh-${MOBILE_MODAL_HEIGHT_OFFSET}px)] md:!h-auto md:!min-h-[150px] flex items-center justify-center`
        )}
      >
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
                isLoading={isCreatingList}
                inputRef={createInputRef}
              />
            )}

            {!showCreateForm && (
              <>
                <div
                  className={`space-y-2 overflow-y-auto max-h-[calc(100vh-${MOBILE_LIST_MAX_HEIGHT_OFFSET}px)] pb-4 md:!pb-0 md:!max-h-72`}
                >
                  {listsToDisplay.map((list) => {
                    const isInList = listIdsContainingDocument.includes(list.listId);
                    const isCurrentlyToggling = togglingListId === list.listId;

                    return (
                      <ListSelectItem
                        key={list.listId}
                        list={list}
                        isChecked={isInList}
                        isRemoving={isCurrentlyToggling}
                        onToggle={() =>
                          isInList
                            ? handleRemoveFromList(list.listId)
                            : handleAddToList(list.listId)
                        }
                      />
                    );
                  })}
                </div>

                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6 md:!relative md:!p-0 md:!border-t-0 md:!mt-4">
                  <CreateListButton onClick={openCreateFormAndFocus} fullWidth />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </BaseModal>
  );
}

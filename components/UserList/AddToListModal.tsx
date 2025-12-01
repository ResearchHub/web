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
import { Plus, ArrowLeft, ExternalLink } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-regular-svg-icons';
import { faBookmark as faBookmarkSolid } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';
import { ListService } from '@/components/UserList/lib/services/list.service';
import { Skeleton } from '@/components/ui/Skeleton';
import { extractApiErrorMessage, idMatch } from '@/services/lib/serviceUtils';
import { sortListsByDocumentMembership } from '@/components/UserList/lib/listUtils';
import Link from 'next/link';
import { cn } from '@/utils/styles';
import { ID } from '@/types/root';

interface AddToListModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly unifiedDocumentId: ID;
}

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
  inputRef,
}: Readonly<Omit<ListCreateFormProps, 'isLoading' | 'onCancel'>>) {
  function handleEnterKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
    const isEnterKey = event.key === 'Enter';
    const hasValue = value.trim().length > 0;

    if (isEnterKey && hasValue) {
      event.preventDefault();
      event.stopPropagation();
      onSubmit();
    }
  }

  return (
    <Input
      ref={inputRef}
      placeholder="List name"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={handleEnterKeyPress}
    />
  );
}

interface ListSelectItemProps {
  readonly list: UserListOverview;
  readonly listIdsContainingDocument: ID[];
  readonly isRemoving: boolean;
  readonly onToggle: () => void;
}

function ListSelectItem({
  list,
  listIdsContainingDocument,
  isRemoving,
  onToggle,
}: Readonly<ListSelectItemProps>) {
  const isInList = listIdsContainingDocument.includes(list.id);

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={isRemoving}
      className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors text-left hover:bg-gray-50 ${
        isRemoving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className="font-medium text-gray-900 truncate">{list.name}</span>
        <Link
          href={`/list/${list.id}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
      {isRemoving ? (
        <Loader size="sm" />
      ) : (
        <FontAwesomeIcon
          icon={isInList ? faBookmarkSolid : faBookmark}
          className={`w-5 h-5 transition-colors ${isInList ? 'text-gray-900' : 'text-gray-400'}`}
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
  const { overviewLists, isLoading, listIdsContainingDocument } = useIsInList(
    isOpen ? unifiedDocumentId : null
  );
  const { createList, addDocumentToList, removeDocumentFromList } = useUserListsContext();

  const [newListName, setNewListName] = useState('');
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [togglingListId, setTogglingListId] = useState<ID | null>(null);
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
    if (isOpen && !isLoading && overviewLists.length > 0) {
      setSortedLists(sortListsByDocumentMembership(overviewLists, listIdsContainingDocument));
    } else if (!isOpen) {
      setSortedLists([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isLoading]);

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

  const handleAddToList = async (id: ID) => {
    const listToAddTo = overviewLists.find((list) => idMatch(list.id, id));
    if (!listToAddTo) return;

    setTogglingListId(id);
    try {
      const response = await ListService.addItemToListApi(id, unifiedDocumentId);
      addDocumentToList(id, unifiedDocumentId, response.id);

      const listUrl = `/list/${id}`;
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

  const handleRemoveFromList = async (id: ID) => {
    const listToRemoveFrom = overviewLists.find((list) => idMatch(list.id, id));
    if (!listToRemoveFrom) return;

    const documentInList = listToRemoveFrom.unifiedDocuments.find(
      (doc) => doc.unifiedDocumentId === unifiedDocumentId
    );

    if (!documentInList?.listItemId) return;

    setTogglingListId(id);
    try {
      await ListService.removeItemFromListApi(id, documentInList.listItemId);
      removeDocumentFromList(id, unifiedDocumentId);

      toast.success(
        (t) => (
          <div className="flex items-center gap-2">
            <span className="text-gray-900">{TOAST_MESSAGES.ITEM_REMOVED}</span>
            <button
              onClick={async (e) => {
                e.stopPropagation();
                toast.dismiss(t.id);
                await handleAddToList(id);
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Undo
            </button>
          </div>
        ),
        { duration: 4000 }
      );
    } catch (error) {
      toast.error(extractApiErrorMessage(error, TOAST_MESSAGES.FAILED_TO_REMOVE_ITEM));
      console.error('Failed to remove item:', error);
    } finally {
      setTogglingListId(null);
    }
  };

  const listsToDisplay = sortedLists.length > 0 ? sortedLists : overviewLists;

  const modalTitle = showCreateForm ? 'Create List' : 'Save to…';

  const headerAction = showCreateForm ? (
    <button
      onClick={closeCreateForm}
      className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 -ml-2"
    >
      <ArrowLeft className="w-4 h-4" />
    </button>
  ) : undefined;

  const footer = () => {
    if (showCreateForm) {
      return (
        <LoadingButton
          onClick={handleCreateList}
          disabled={newListName.trim().length === 0}
          isLoading={isCreatingList}
          loadingText="Creating..."
          className="w-full"
        >
          Create
        </LoadingButton>
      );
    }
    if (!isLoading && overviewLists.length > 0) {
      return <CreateListButton onClick={openCreateFormAndFocus} fullWidth />;
    }
    return undefined;
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      headerAction={headerAction}
      maxWidth="max-w-2xl"
      padding="p-6"
      className="!h-[100dvh] md:!h-auto"
      footer={footer()}
    >
      <div
        className={cn(
          'md:!min-w-[500px] md:!max-w-[500px]',
          !isLoading &&
            overviewLists.length === 0 &&
            !showCreateForm &&
            'flex items-center justify-center min-h-[150px]'
        )}
      >
        {isLoading && <ListLoadingSkeleton />}

        {!isLoading && overviewLists.length === 0 && !showCreateForm && (
          <ListEmptyState onFocus={openCreateFormAndFocus} />
        )}

        {!isLoading && (overviewLists.length > 0 || showCreateForm) && (
          <>
            {showCreateForm && (
              <ListCreateForm
                value={newListName}
                onChange={setNewListName}
                onSubmit={handleCreateList}
                inputRef={createInputRef}
              />
            )}

            {!showCreateForm && (
              <div className="space-y-2 md:!max-h-96 overflow-y-auto">
                {listsToDisplay.map((list) => {
                  const isInList = listIdsContainingDocument.includes(list.id);
                  const isCurrentlyToggling = idMatch(togglingListId, list.id);

                  return (
                    <ListSelectItem
                      key={list.id}
                      list={list}
                      listIdsContainingDocument={listIdsContainingDocument}
                      isRemoving={isCurrentlyToggling}
                      onToggle={() =>
                        isInList ? handleRemoveFromList(list.id) : handleAddToList(list.id)
                      }
                    />
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </BaseModal>
  );
}

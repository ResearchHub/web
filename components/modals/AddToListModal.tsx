'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { ListModal } from './ListModal';
import { Input } from '@/components/ui/form/Input';
import { Checkbox } from '@/components/ui/form/Checkbox';
import { useUserListsContext } from '@/contexts/UserListsContext';
import { useIsInList } from '@/hooks/useIsInList';
import { SimplifiedUserList } from '@/types/user-list';
import { Loader2, Plus, Trash2, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { extractApiErrorMessage } from '@/utils/apiError';
import { ListService } from '@/services/list.service';
import { pluralizeSuffix } from '@/utils/stringUtils';

interface AddToListModalProps {
  isOpen: boolean;
  onClose: () => void;
  unifiedDocumentId: number;
  onItemAdded?: () => void;
  listDetails?: SimplifiedUserList[];
  isLoadingListDetails?: boolean;
  refetchListDetails?: () => void;
}

export function AddToListModal({
  isOpen,
  onClose,
  unifiedDocumentId,
  onItemAdded,
  listDetails: preFetchedListDetails,
  isLoadingListDetails: preFetchedIsLoading,
  refetchListDetails: preFetchedRefetch,
}: AddToListModalProps) {
  const {
    listDetails: checkLists,
    isLoading: isLoadingCheckLists,
    refetch: refetchCheckLists,
    listIds: listsContainingItem,
  } = useIsInList(isOpen ? unifiedDocumentId : null);

  const { createList, fetchLists } = useUserListsContext();

  const lists = preFetchedListDetails || checkLists;
  const listsLoading = preFetchedIsLoading ?? isLoadingCheckLists;
  const refetchLists = preFetchedRefetch || refetchCheckLists;

  const [selectedListIds, setSelectedListIds] = useState<Set<number>>(new Set());
  const [isAdding, setIsAdding] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [removingListId, setRemovingListId] = useState<number | null>(null);
  const hasFetchedRef = useRef(false);

  const refreshAllLists = useCallback(() => {
    refetchLists();
    fetchLists();
  }, [refetchLists, fetchLists]);

  const updateSelectedLists = useCallback((listId: number, add: boolean) => {
    setSelectedListIds((prev) => {
      const next = new Set(prev);
      if (add) next.add(listId);
      else next.delete(listId);
      return next;
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSelectedListIds(new Set(listsContainingItem));
      if (!hasFetchedRef.current) {
        refetchLists();
        hasFetchedRef.current = true;
      }
    } else {
      setSelectedListIds(new Set());
      hasFetchedRef.current = false;
    }
  }, [isOpen, listsContainingItem, refetchLists]);

  const handleToggleList = (listId: number, checked: boolean) => {
    updateSelectedLists(listId, checked);
  };

  const handleAddToList = async () => {
    if (selectedListIds.size === 0) return;

    setIsAdding(true);
    const listIdsArray = Array.from(selectedListIds);
    const listsToAdd = listIdsArray.filter((id) => !listsContainingItem.has(id));
    const alreadyInLists = listIdsArray.filter((id) => listsContainingItem.has(id));

    try {
      const results = await Promise.allSettled(
        listsToAdd.map((listId) => ListService.addItemToList(listId, unifiedDocumentId))
      );

      const failures = results.filter((r) => r.status === 'rejected');
      const successes = results.filter((r) => r.status === 'fulfilled');

      if (successes.length > 0) {
        toast.success(`Added to ${successes.length} list${pluralizeSuffix(successes.length)}`);
      } else if (alreadyInLists.length > 0) {
        toast.success(
          `Already in ${alreadyInLists.length} list${pluralizeSuffix(alreadyInLists.length)}`
        );
      }

      if (failures.length > 0) {
        if (successes.length === 0 && alreadyInLists.length === 0) {
          toast.error(extractApiErrorMessage(failures[0].reason, 'Failed to add item to lists'));
        } else {
          toast.error(
            `Failed to add to ${failures.length} list${pluralizeSuffix(failures.length)}`
          );
        }
      }

      onItemAdded?.();
      refreshAllLists();
      onClose();
    } catch (error) {
      toast.error(extractApiErrorMessage(error, 'Failed to add item to lists'));
      console.error('Failed to add item to lists:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;

    setIsCreating(true);
    try {
      const newList = await createList({ name: newListName.trim() });
      updateSelectedLists(newList.id, true);
      setShowCreateForm(false);
      setNewListName('');
      refreshAllLists();
    } catch (error) {
      console.error('Failed to create list:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRemoveFromList = async (listId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const list = lists.find((l) => l.id === listId);
    const item = list?.items?.find((i) => i.unified_document_id === unifiedDocumentId);
    if (!item?.id || !list) return;

    setRemovingListId(listId);
    try {
      await ListService.removeItemFromList(item.id);
      toast.success(`Removed from "${list.name}"`);
      updateSelectedLists(listId, false);
      refreshAllLists();
      onItemAdded?.();
    } catch (error) {
      toast.error(extractApiErrorMessage(error, 'Failed to remove item from list'));
    } finally {
      setRemovingListId(null);
    }
  };

  const sortedLists = useMemo(
    () =>
      lists.slice().sort((a, b) => {
        const aIn = listsContainingItem.has(a.id);
        const bIn = listsContainingItem.has(b.id);
        return aIn === bIn ? 0 : aIn ? -1 : 1;
      }),
    [lists, listsContainingItem]
  );

  const newListsCount = useMemo(
    () =>
      Math.max(0, Array.from(selectedListIds).filter((id) => !listsContainingItem.has(id)).length),
    [selectedListIds, listsContainingItem]
  );

  return (
    <ListModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add to List"
      subtitle="Select one or more lists to save this item"
    >
      <div className="space-y-6">
        {listsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            {lists.length === 0 && !showCreateForm ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">You don't have any lists yet.</p>
                <Button onClick={() => setShowCreateForm(true)} variant="default" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Your First List
                </Button>
              </div>
            ) : (
              <>
                {showCreateForm && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Create New List</h3>
                    <div className="space-y-3">
                      <Input
                        placeholder="List name"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleCreateList();
                          }
                        }}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <LoadingButton
                          onClick={handleCreateList}
                          disabled={!newListName.trim() || isCreating}
                          size="sm"
                          isLoading={isCreating}
                          loadingText="Creating..."
                        >
                          Create
                        </LoadingButton>
                        <Button
                          onClick={() => {
                            setShowCreateForm(false);
                            setNewListName('');
                          }}
                          variant="outlined"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {!showCreateForm && (
                  <>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {sortedLists.map((list) => {
                        const isAlreadyInList = listsContainingItem.has(list.id);
                        const isSelected = selectedListIds.has(list.id);
                        const isRemoving = removingListId === list.id;
                        return (
                          <label
                            key={list.id}
                            className={`flex items-center gap-3 w-full p-3 rounded-lg border cursor-pointer transition-colors ${
                              isSelected
                                ? 'border-rhBlue-500 bg-rhBlue-50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => handleToggleList(list.id, checked)}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900">{list.name}</div>
                              {isAlreadyInList && (
                                <div className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  Already in list
                                </div>
                              )}
                            </div>
                            {isAlreadyInList && (
                              <button
                                type="button"
                                onClick={(e) => handleRemoveFromList(list.id, e)}
                                disabled={isRemoving}
                                className="flex-shrink-0 p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Remove from list"
                              >
                                {isRemoving ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </label>
                        );
                      })}
                    </div>

                    <Button
                      onClick={() => setShowCreateForm(true)}
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
          </>
        )}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outlined" onClick={onClose} disabled={isAdding}>
            Cancel
          </Button>
          <LoadingButton
            onClick={handleAddToList}
            disabled={newListsCount === 0 || isAdding}
            isLoading={isAdding}
            loadingText="Adding..."
          >
            {newListsCount === 0
              ? 'Add to List'
              : `Add to ${newListsCount} List${pluralizeSuffix(newListsCount)}`}
          </LoadingButton>
        </div>
      </div>
    </ListModal>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { ListModal } from './ListModal';
import { Input } from '@/components/ui/form/Input';
import { Checkbox } from '@/components/ui/form/Checkbox';
import { useUserLists } from '@/hooks/useUserLists';
import { useListsContainingItem } from '@/hooks/useListsContainingItem';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { extractApiErrorMessage } from '@/utils/apiError';
import { ListService } from '@/services/list.service';
import { formatItemCount } from '@/utils/listUtils';

interface AddToListModalProps {
  isOpen: boolean;
  onClose: () => void;
  unifiedDocumentId: number;
  onItemAdded?: () => void;
  listDetails?: import('@/types/user-list').UserListDetail[]; // Optional pre-fetched list details from useIsInList
  isLoadingListDetails?: boolean; // Optional loading state
  refetchListDetails?: () => void; // Optional refetch function
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
  const { lists, isLoading: listsLoading, createList, fetchLists } = useUserLists();
  const {
    listIds: listsContainingItem,
    isLoading: isLoadingListDetails,
    refetch: refetchListsContainingItem,
  } = useListsContainingItem(
    isOpen ? unifiedDocumentId : null,
    preFetchedListDetails,
    preFetchedIsLoading,
    preFetchedRefetch
  );
  const [selectedListIds, setSelectedListIds] = useState<Set<number>>(new Set());
  const [isAdding, setIsAdding] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [removingListId, setRemovingListId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchLists();
      // Pre-check checkboxes for lists that already contain the item
      if (listsContainingItem.size > 0) {
        setSelectedListIds(new Set(listsContainingItem));
      } else {
        setSelectedListIds(new Set());
      }
    } else {
      // Reset when modal closes
      setSelectedListIds(new Set());
    }
  }, [isOpen, fetchLists, listsContainingItem]);

  const handleToggleList = (listId: number, checked: boolean) => {
    setSelectedListIds((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(listId);
      } else {
        newSet.delete(listId);
      }
      return newSet;
    });
  };

  const handleAddToList = async () => {
    if (selectedListIds.size === 0) return;

    setIsAdding(true);
    const listIdsArray = Array.from(selectedListIds);
    const selectedLists = lists.filter((l) => selectedListIds.has(l.id));

    // Separate lists that already contain the item from those that don't
    const listsToAdd = listIdsArray.filter((id) => !listsContainingItem.has(id));
    const alreadyInLists = listIdsArray.filter((id) => listsContainingItem.has(id));

    try {
      // Only add to lists that don't already contain the item
      const results = await Promise.allSettled(
        listsToAdd.map((listId) => ListService.addItemToList(listId, unifiedDocumentId))
      );

      // Check for failures
      const failures = results.filter((r) => r.status === 'rejected');
      const successes = results.filter((r) => r.status === 'fulfilled');

      // Build success message
      if (successes.length > 0 || alreadyInLists.length > 0) {
        const parts: string[] = [];
        if (successes.length > 0) {
          parts.push(`Added to ${successes.length} list${successes.length > 1 ? 's' : ''}`);
        }
        if (alreadyInLists.length > 0) {
          parts.push(
            `Already in ${alreadyInLists.length} list${alreadyInLists.length > 1 ? 's' : ''}`
          );
        }
        toast.success(parts.join(', '));
      }

      if (failures.length > 0) {
        // Some failed
        if (successes.length === 0 && alreadyInLists.length === 0) {
          // All failed
          toast.error(extractApiErrorMessage(failures[0].reason, 'Failed to add item to lists'));
        } else {
          // Some succeeded, some failed
          toast.error(`Failed to add to ${failures.length} list${failures.length > 1 ? 's' : ''}`);
        }
      }

      onItemAdded?.();
      refetchListsContainingItem(); // Refetch to update which lists contain the item
      onClose();
      setSelectedListIds(new Set());
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
      // Automatically select the newly created list
      setSelectedListIds((prev) => new Set(prev).add(newList.id));
      setShowCreateForm(false);
      setNewListName('');
    } catch (error) {
      console.error('Failed to create list:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRemoveFromList = async (listId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent checkbox toggle
    if (!preFetchedListDetails) return;

    const list = preFetchedListDetails.find((l) => l.id === listId);
    if (!list || !list.items) return;

    const docId =
      typeof unifiedDocumentId === 'string' ? parseInt(unifiedDocumentId) : unifiedDocumentId;
    const item = list.items.find((i) => {
      // Handle both number and string comparisons
      const itemDocId =
        typeof i.unified_document === 'string' ? parseInt(i.unified_document) : i.unified_document;
      return itemDocId === docId;
    });
    if (!item || !item.id) return;

    setRemovingListId(listId);
    try {
      // Use the UserListItem ID (item.id), not the unified_document ID
      await ListService.removeItemFromList(listId, Number(item.id));
      toast.success(`Removed from "${list.name}"`);

      // Uncheck the checkbox
      setSelectedListIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(listId);
        return newSet;
      });

      // Refetch list details to update the UI
      if (preFetchedRefetch) {
        preFetchedRefetch();
      }
      onItemAdded?.();
    } catch (error) {
      toast.error(extractApiErrorMessage(error, 'Failed to remove item from list'));
      console.error('Failed to remove item from list:', error);
    } finally {
      setRemovingListId(null);
    }
  };

  return (
    <ListModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add to List"
      subtitle="Select one or more lists to save this item"
    >
      <div className="space-y-6">
        {listsLoading || isLoadingListDetails ? (
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
                      {lists.map((list) => {
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
                              <div className="text-xs text-gray-500 mt-1">
                                {formatItemCount(list)}
                                {isAlreadyInList && (
                                  <span className="ml-2 text-green-600 font-medium">
                                    • Already in list
                                  </span>
                                )}
                              </div>
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
            disabled={selectedListIds.size === 0 || isAdding}
            isLoading={isAdding}
            loadingText="Adding..."
          >
            {selectedListIds.size === 0
              ? 'Add to List'
              : `Add to ${selectedListIds.size} List${selectedListIds.size > 1 ? 's' : ''}`}
          </LoadingButton>
        </div>
      </div>
    </ListModal>
  );
}

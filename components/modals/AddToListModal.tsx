'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { Modal } from '@/components/ui/form/Modal';
import { Input } from '@/components/ui/form/Input';
import { Checkbox } from '@/components/ui/form/Checkbox';
import { useUserListsContext } from '@/contexts/UserListsContext';
import { useIsInList } from '@/hooks/useIsInList';
import { SimplifiedUserList } from '@/types/user-list';
import { Loader2, Plus, Trash2, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ListService } from '@/services/list.service';
import { pluralizeSuffix } from '@/utils/stringUtils';
import { Skeleton } from '@/components/ui/Skeleton';

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
  listDetails: preFetched,
  isLoadingListDetails: preFetchedLoading,
  refetchListDetails: preFetchedRefetch,
}: AddToListModalProps) {
  const { listDetails, isLoading, refetch, listIds } = useIsInList(
    isOpen ? unifiedDocumentId : null
  );
  const { createList, refetchOverview } = useUserListsContext();

  const lists = preFetched || listDetails;
  const loading = preFetchedLoading ?? isLoading;
  const refresh = preFetchedRefetch || refetch;

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [removing, setRemoving] = useState<number | null>(null);

  useEffect(() => {
    setSelected(isOpen ? new Set(listIds) : new Set());
  }, [isOpen, listIds]);

  const handleAdd = async () => {
    if (!selected.size) return;
    setIsAdding(true);

    try {
      const toAdd = Array.from(selected).filter((id) => !listIds.has(id));
      const results = await Promise.allSettled(
        toAdd.map((id) => ListService.addItemToListApi(id, unifiedDocumentId))
      );
      const failed = results.filter((r) => r.status === 'rejected').length;
      const success = results.length - failed;

      if (success) toast.success(`Added to ${success} list${pluralizeSuffix(success)}`);
      if (failed) toast.error(`Failed to add to ${failed} list${pluralizeSuffix(failed)}`);

      onItemAdded?.();
      refresh();
      refetchOverview();
      onClose();
    } finally {
      setIsAdding(false);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setIsCreating(true);
    try {
      await createList({ name: newName.trim() }, false);
      setShowCreate(false);
      setNewName('');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRemove = async (listId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const list = lists.find((l) => l.list_id === listId);
    const item = list?.unified_documents?.find((i) => i.unified_document_id === unifiedDocumentId);
    if (!item?.list_item_id || !list) return;

    setRemoving(listId);
    try {
      await ListService.removeItemFromList(item.list_item_id);
      toast.success(`Removed from "${list.name}"`);
      setSelected((prev) => {
        prev.delete(listId);
        return new Set(prev);
      });
      onItemAdded?.();
      refresh();
      refetchOverview();
    } finally {
      setRemoving(null);
    }
  };

  const inLists = lists.filter((l) => listIds.has(l.list_id));
  const notInLists = lists.filter((l) => !listIds.has(l.list_id));
  const sorted = [...inLists, ...notInLists];
  const newCount = Array.from(selected).filter((id) => !listIds.has(id)).length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add to List">
      <div className="space-y-6">
        <p className="text-sm text-gray-600">Select one or more lists to save this item</p>
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200"
              >
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-5 w-32 flex-1" />
              </div>
            ))}
          </div>
        ) : !lists.length && !showCreate ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">You don't have any lists yet.</p>
            <Button onClick={() => setShowCreate(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Your First List
            </Button>
          </div>
        ) : (
          <>
            {showCreate && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Create New List</h3>
                <Input
                  placeholder="List name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  autoFocus
                  className="mb-3"
                />
                <div className="flex gap-2">
                  <LoadingButton
                    onClick={handleCreate}
                    disabled={!newName.trim()}
                    size="sm"
                    isLoading={isCreating}
                    loadingText="Creating..."
                  >
                    Create
                  </LoadingButton>
                  <Button
                    onClick={() => {
                      setShowCreate(false);
                      setNewName('');
                    }}
                    variant="outlined"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {!showCreate && (
              <>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {sorted.map((list) => {
                    const inList = listIds.has(list.list_id);
                    const checked = selected.has(list.list_id);
                    const isRemoving = removing === list.list_id;
                    return (
                      <label
                        key={list.list_id}
                        className={`flex items-center gap-3 w-full p-3 rounded-lg border cursor-pointer transition-colors ${
                          checked
                            ? 'border-rhBlue-500 bg-rhBlue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(c) =>
                            setSelected((prev) => {
                              if (c) prev.add(list.list_id);
                              else prev.delete(list.list_id);
                              return new Set(prev);
                            })
                          }
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{list.name}</div>
                          {inList && (
                            <div className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1 sm:hidden">
                              <Check className="w-3 h-3" />
                              Already in list
                            </div>
                          )}
                        </div>
                        {inList && (
                          <>
                            <div className="hidden sm:flex items-center gap-1 text-xs text-green-600 font-medium">
                              <Check className="w-3 h-3" />
                              Already in list
                            </div>
                            <button
                              type="button"
                              onClick={(e) => handleRemove(list.list_id, e)}
                              disabled={isRemoving}
                              className="flex-shrink-0 p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                              title="Remove"
                            >
                              {isRemoving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </>
                        )}
                      </label>
                    );
                  })}
                </div>

                <Button
                  onClick={() => setShowCreate(true)}
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
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outlined" onClick={onClose} disabled={isAdding}>
            Cancel
          </Button>
          <LoadingButton
            onClick={handleAdd}
            disabled={!newCount}
            isLoading={isAdding}
            loadingText="Adding..."
          >
            {newCount ? `Add to ${newCount} List${pluralizeSuffix(newCount)}` : 'Add to List'}
          </LoadingButton>
        </div>
      </div>
    </Modal>
  );
}

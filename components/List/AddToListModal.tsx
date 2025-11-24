'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { BaseModal } from '@/components/ui/BaseModal';
import { Input } from '@/components/ui/form/Input';
import { Checkbox } from '@/components/ui/form/Checkbox';
import { useUserListsContext } from '@/components/List/lib/UserListsContext';
import { useIsInList } from '@/hooks/useIsInList';
import { SimplifiedUserList } from '@/components/List/lib/user-list';
import { Loader2, Plus, Trash2, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ListService } from '@/services/list.service';
import { pluralizeSuffix } from '@/utils/stringUtils';
import { Skeleton } from '@/components/ui/Skeleton';

interface AddToListModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly unifiedDocumentId: number;
  readonly onItemAdded?: () => void;
  readonly listDetails?: SimplifiedUserList[];
  readonly isLoadingListDetails?: boolean;
  readonly refetchListDetails?: () => void;
}

function ListLoadingSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={'list-skeleton-load-' + i}
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
  readonly isLoading: boolean;
  readonly inputRef?: React.RefObject<HTMLInputElement>;
}

function ListCreateForm({
  value,
  onChange,
  onSubmit,
  isLoading,
  inputRef,
}: Readonly<ListCreateFormProps>) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Create New List</h3>
      <Input
        ref={inputRef}
        placeholder="List name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
        className="mb-3"
      />
      <div className="flex gap-2">
        <LoadingButton
          onClick={onSubmit}
          disabled={!value.trim()}
          size="sm"
          isLoading={isLoading}
          loadingText="Creating..."
        >
          Create
        </LoadingButton>
        <Button onClick={() => onChange('')} variant="outlined" size="sm">
          Cancel
        </Button>
      </div>
    </div>
  );
}

interface ListSelectItemProps {
  readonly list: SimplifiedUserList;
  readonly isChecked: boolean;
  readonly isInList: boolean;
  readonly isRemoving: boolean;
  readonly onToggle: (checked: boolean) => void;
  readonly onRemove: (e: React.MouseEvent) => void;
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
          <button
            type="button"
            onClick={onRemove}
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
}

export function AddToListModal({
  isOpen,
  onClose,
  unifiedDocumentId,
  onItemAdded,
  listDetails: preFetched,
  isLoadingListDetails: preFetchedLoading,
  refetchListDetails: preFetchedRefetch,
}: Readonly<AddToListModalProps>) {
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
  const [isCreating, setIsCreating] = useState(false);
  const [removing, setRemoving] = useState<number | null>(null);
  const createInputRef = useRef<HTMLInputElement>(null);

  const showCreate = newName.length > 0;

  useEffect(() => {
    setSelected(isOpen ? new Set(listIds) : new Set());
  }, [isOpen, listIds]);

  const handleAdd = async () => {
    if (!selected.size) return;
    setIsAdding(true);

    try {
      const toAdd = Array.from(selected).filter((id) => !listIds.has(id));
      const results = await Promise.allSettled(
        toAdd.map((id) => ListService.addItemToList(id, unifiedDocumentId))
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
      await ListService.removeItemFromList(listId, item.list_item_id);
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
            onClick={handleAdd}
            disabled={!newCount}
            isLoading={isAdding}
            loadingText="Adding..."
          >
            {newCount ? `Add to ${newCount} List${pluralizeSuffix(newCount)}` : 'Add to List'}
          </LoadingButton>
        </div>
      }
    >
      <div className="md:!min-w-[500px] md:!max-w-[500px]">
        <p className="text-sm text-gray-600 mb-6">Select one or more lists to save this item</p>

        {loading && <ListLoadingSkeleton />}

        {!loading && !lists.length && !showCreate && (
          <ListEmptyState
            onFocus={() => {
              setNewName(' ');
              setTimeout(() => createInputRef.current?.focus(), 0);
            }}
          />
        )}

        {!loading && (lists.length > 0 || showCreate) && (
          <>
            {showCreate && (
              <ListCreateForm
                value={newName}
                onChange={setNewName}
                onSubmit={handleCreate}
                isLoading={isCreating}
                inputRef={createInputRef}
              />
            )}

            {!showCreate && (
              <>
                <div className="space-y-2 max-h-[50vh] md:!max-h-72 overflow-y-auto">
                  {sorted.map((list) => (
                    <ListSelectItem
                      key={list.list_id}
                      list={list}
                      isChecked={selected.has(list.list_id)}
                      isInList={listIds.has(list.list_id)}
                      isRemoving={removing === list.list_id}
                      onToggle={(checked) => {
                        setSelected((prev) => {
                          if (checked) prev.add(list.list_id);
                          else prev.delete(list.list_id);
                          return new Set(prev);
                        });
                      }}
                      onRemove={(e) => handleRemove(list.list_id, e)}
                    />
                  ))}
                </div>

                <div className="border-t border-gray-200 mt-4 mb-4" />

                <Button
                  onClick={() => {
                    setNewName(' ');
                    setTimeout(() => createInputRef.current?.focus(), 0);
                  }}
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

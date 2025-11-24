'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { BaseModal } from '@/components/ui/BaseModal';
import { Input } from '@/components/ui/form/Input';
import { Checkbox } from '@/components/ui/form/Checkbox';
import { Loader } from '@/components/ui/Loader';
import { useUserListsContext } from '@/components/UserList/lib/UserListsContext';
import { useIsInList } from '@/hooks/useIsInList';
import { UserListOverview } from '@/components/UserList/lib/user-list';
import { Plus, Trash2, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ListService } from '@/services/list.service';
import { pluralizeSuffix } from '@/utils/stringUtils';
import { Skeleton } from '@/components/ui/Skeleton';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';

interface AddToListModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly unifiedDocumentId: number;
  readonly onListsChanged?: () => void;
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
  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Create New List</h3>
      <Input
        ref={inputRef}
        placeholder="List name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && value.trim()) {
            e.preventDefault();
            e.stopPropagation();
            onSubmit();
          }
        }}
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

export function AddToListModal({
  isOpen,
  onClose,
  unifiedDocumentId,
  onListsChanged,
}: Readonly<AddToListModalProps>) {
  const { listDetails, isLoading, refetch, listIds } = useIsInList(
    isOpen ? unifiedDocumentId : null
  );
  const { createList } = useUserListsContext();

  const [selected, setSelected] = useState<number[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [removing, setRemoving] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const createInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSelected(isOpen ? [...listIds] : []);
    setShowCreateForm(false);
    setNewName('');
  }, [isOpen, listIds]);

  const handleAdd = async () => {
    if (!selected.length) return;
    setIsAdding(true);

    try {
      const toAdd = selected.filter((id) => !listIds.includes(id));
      const results = await Promise.allSettled(
        toAdd.map((id) => ListService.addItemToList(id, unifiedDocumentId))
      );
      const failed = results.filter((r) => r.status === 'rejected').length;
      const success = results.length - failed;

      if (success) toast.success(`Added to ${success} list${pluralizeSuffix(success)}`);
      if (failed) toast.error(`Failed to add to ${failed} list${pluralizeSuffix(failed)}`);

      onListsChanged?.();
      refetch();
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
      setShowCreateForm(false);
    } catch (error) {
      toast.error(extractApiErrorMessage(error, 'Failed to create list'));
      console.error('Failed to create list:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRemove = async (listId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const list = listDetails.find((l) => l.listId === listId);
    const item = list?.unifiedDocuments?.find((i) => i.unifiedDocumentId === unifiedDocumentId);
    if (!item?.listItemId || !list) return;

    setRemoving(listId);
    try {
      await ListService.removeItemFromList(listId, item.listItemId);
      toast.success(`Removed from "${list.name}"`);
      setSelected((prev) => prev.filter((id) => id !== listId));
      onListsChanged?.();
      refetch();
    } catch (error) {
      toast.error(extractApiErrorMessage(error, `Failed to remove from "${list.name}"`));
      console.error('Failed to remove item from list:', error);
    } finally {
      setRemoving(null);
    }
  };

  const { inLists, notInLists } = listDetails.reduce<{
    inLists: typeof listDetails;
    notInLists: typeof listDetails;
  }>(
    (acc, list) => {
      if (listIds.includes(list.listId)) acc.inLists.push(list);
      else acc.notInLists.push(list);
      return acc;
    },
    { inLists: [], notInLists: [] }
  );
  const sorted = [...inLists, ...notInLists];
  const newCount = selected.filter((id) => !listIds.includes(id)).length;

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

        {isLoading && <ListLoadingSkeleton />}

        {!isLoading && !listDetails.length && !showCreateForm && (
          <ListEmptyState
            onFocus={() => {
              setShowCreateForm(true);
              setTimeout(() => createInputRef.current?.focus(), 0);
            }}
          />
        )}

        {!isLoading && (listDetails.length > 0 || showCreateForm) && (
          <>
            {showCreateForm && (
              <ListCreateForm
                value={newName}
                onChange={setNewName}
                onSubmit={handleCreate}
                onCancel={() => {
                  setShowCreateForm(false);
                  setNewName('');
                }}
                isLoading={isCreating}
                inputRef={createInputRef}
              />
            )}

            {!showCreateForm && (
              <>
                <div className="space-y-2 max-h-[50vh] md:!max-h-72 overflow-y-auto">
                  {sorted.map((list) => (
                    <ListSelectItem
                      key={list.listId}
                      list={list}
                      isChecked={selected.includes(list.listId)}
                      isInList={listIds.includes(list.listId)}
                      isRemoving={removing === list.listId}
                      onToggle={(checked) => {
                        setSelected((prev) =>
                          checked ? [...prev, list.listId] : prev.filter((id) => id !== list.listId)
                        );
                      }}
                      onRemove={(e) => handleRemove(list.listId, e)}
                    />
                  ))}
                </div>

                <div className="border-t border-gray-200 mt-4 mb-4" />

                <Button
                  onClick={() => {
                    setShowCreateForm(true);
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

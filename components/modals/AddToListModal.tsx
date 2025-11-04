'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { ListModal } from './ListModal';
import { Input } from '@/components/ui/form/Input';
import { useUserLists } from '@/hooks/useUserLists';
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { extractApiErrorMessage } from '@/utils/apiError';
import { ListService } from '@/services/list.service';
import { formatItemCount } from '@/utils/listUtils';

interface AddToListModalProps {
  isOpen: boolean;
  onClose: () => void;
  unifiedDocumentId: number;
  onItemAdded?: () => void;
}

export function AddToListModal({
  isOpen,
  onClose,
  unifiedDocumentId,
  onItemAdded,
}: AddToListModalProps) {
  const { lists, isLoading: listsLoading, createList, fetchLists } = useUserLists();
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchLists();
    }
  }, [isOpen, fetchLists]);

  const handleAddToList = async () => {
    if (!selectedListId) return;
    setIsAdding(true);
    try {
      await ListService.addItemToList(selectedListId, unifiedDocumentId);
      const selectedList = lists.find((l) => l.id === selectedListId);
      toast.success(`Item added to "${selectedList?.name || 'list'}"`);
      onItemAdded?.();
      onClose();
      setSelectedListId(null);
    } catch (error) {
      toast.error(extractApiErrorMessage(error, 'Failed to add item to list'));
      console.error('Failed to add item to list:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;

    setIsCreating(true);
    try {
      const newList = await createList({ name: newListName.trim() });
      setSelectedListId(newList.id);
      setShowCreateForm(false);
      setNewListName('');
    } catch (error) {
      console.error('Failed to create list:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <ListModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add to List"
      subtitle="Save this item to one of your lists"
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
                      {lists.map((list) => (
                        <button
                          key={list.id}
                          onClick={() => setSelectedListId(list.id)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            selectedListId === list.id
                              ? 'border-rhBlue-500 bg-rhBlue-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="font-medium text-gray-900">{list.name}</div>
                          <div className="text-xs text-gray-500 mt-1">{formatItemCount(list)}</div>
                        </button>
                      ))}
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
            disabled={!selectedListId || isAdding}
            isLoading={isAdding}
            loadingText="Adding..."
          >
            Add to List
          </LoadingButton>
        </div>
      </div>
    </ListModal>
  );
}

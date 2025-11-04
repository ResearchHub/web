'use client';

import { useState } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { useUserLists } from '@/hooks/useUserLists';
import { UserList } from '@/types/user-list';
import { ListsRightSidebar } from '@/app/lists/components/ListsRightSidebar';
import Link from 'next/link';
import { Plus, Edit2, Trash2, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { ListModal } from '@/components/modals/ListModal';
import { Input } from '@/components/ui/form/Input';
import { formatDistanceToNow } from 'date-fns';
import { formatItemCount } from '@/utils/listUtils';

function ListsPageContent() {
  const { lists, stats, isLoading, error, createList, updateList, deleteList } = useUserLists();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<UserList | null>(null);
  const [newListName, setNewListName] = useState('');
  const [editListName, setEditListName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    setIsCreating(true);
    try {
      await createList({ name: newListName.trim() });
      setNewListName('');
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Failed to create list:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditClick = (list: UserList) => {
    setSelectedList(list);
    setEditListName(list.name);
    setIsEditModalOpen(true);
  };

  const handleUpdateList = async () => {
    if (!selectedList || !editListName.trim()) return;
    setIsUpdating(true);
    try {
      await updateList(selectedList.id, { name: editListName.trim() });
      setIsEditModalOpen(false);
      setSelectedList(null);
    } catch (error) {
      console.error('Failed to update list:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClick = (list: UserList) => {
    setSelectedList(list);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteList = async () => {
    if (!selectedList) return;
    setIsDeleting(true);
    try {
      await deleteList(selectedList.id);
      setIsDeleteModalOpen(false);
      setSelectedList(null);
    } catch (error) {
      console.error('Failed to delete list:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <PageLayout rightSidebar={<ListsRightSidebar isLoading={isLoading} />}>
        <div className="px-4 sm:px-0 py-6 sm:py-8 max-w-4xl mx-auto">
          {/* Banner Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                  <FolderOpen className="w-8 h-8 sm:w-10 sm:h-10 text-gray-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Lists</h1>
                <p className="text-gray-600">Organize your saved papers, posts, and more</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3 bg-white rounded-lg"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="h-4 sm:h-5 bg-gray-200 rounded w-32 sm:w-48 mb-2"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-24 sm:w-32"></div>
                </div>
                <div className="h-8 w-16 bg-gray-200 rounded flex-shrink-0"></div>
              </div>
            ))}
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout rightSidebar={<ListsRightSidebar stats={stats} isLoading={isLoading} />}>
        <div className="px-4 sm:px-0 py-6 sm:py-8 max-w-4xl mx-auto">
          {/* Banner Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                  <FolderOpen className="w-8 h-8 sm:w-10 sm:h-10 text-gray-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Lists</h1>
                <p className="text-gray-600">Organize your saved papers, posts, and more</p>
              </div>
            </div>
          </div>
          <div className="p-4 text-sm sm:text-base bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout rightSidebar={<ListsRightSidebar stats={stats} isLoading={isLoading} />}>
      <div className="px-4 sm:px-0 py-6 sm:py-8 max-w-4xl mx-auto">
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                <FolderOpen className="w-8 h-8 sm:w-10 sm:h-10 text-gray-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-2">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">Lists</h1>
                  <p className="text-gray-600">Organize your saved papers, posts, and more</p>
                </div>
                <Button
                  variant="outlined"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="gap-2 w-full sm:w-auto flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Create List
                </Button>
              </div>
            </div>
          </div>
        </div>

        {lists.length === 0 ? (
          <div className="text-center py-8 sm:py-12 px-4 bg-gray-50 rounded-lg border border-gray-200">
            <FolderOpen className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No lists yet</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Create your first list to start organizing content
            </p>
            <Button
              variant="outlined"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="gap-2 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              Create Your First List
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {lists.map((list) => (
              <Link
                key={list.id}
                href={`/lists/${list.id}`}
                className="group flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3 bg-white rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-all duration-200"
              >
                <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                  <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate group-hover:text-gray-600 transition-colors">
                    {list.name}
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-500">
                    <span className="font-medium text-gray-700 whitespace-nowrap flex-shrink-0">
                      {formatItemCount(list)}
                    </span>
                    <span className="hidden sm:inline flex-shrink-0">•</span>
                    <span className="flex-shrink min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                      Updated{' '}
                      {formatDistanceToNow(new Date(list.updated_date), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <div
                  className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0"
                  onClick={(e) => e.preventDefault()}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault();
                      handleEditClick(list);
                    }}
                    className="h-8 w-8 sm:h-8 sm:w-8 text-gray-400 hover:text-gray-600 hover:bg-rhBlue-50 active:bg-rhBlue-100"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeleteClick(list);
                    }}
                    className="h-8 w-8 sm:h-8 sm:w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 active:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <ListModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setNewListName('');
        }}
        title="Create New List"
        subtitle="Organize your saved papers, posts, and more"
      >
        <div className="space-y-6">
          <Input
            label="List Name"
            placeholder="Enter list name"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newListName.trim()) {
                handleCreateList();
              }
            }}
            autoFocus
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outlined"
              onClick={() => {
                setIsCreateModalOpen(false);
                setNewListName('');
              }}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <LoadingButton
              onClick={handleCreateList}
              disabled={!newListName.trim() || isCreating}
              isLoading={isCreating}
              loadingText="Creating..."
            >
              Create List
            </LoadingButton>
          </div>
        </div>
      </ListModal>

      <ListModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedList(null);
        }}
        title="Edit List"
        subtitle="Update your list name"
      >
        <div className="space-y-6">
          <Input
            label="List Name"
            placeholder="Enter list name"
            value={editListName}
            onChange={(e) => setEditListName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && editListName.trim()) {
                handleUpdateList();
              }
            }}
            autoFocus
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outlined"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedList(null);
              }}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <LoadingButton
              onClick={handleUpdateList}
              disabled={!editListName.trim() || isUpdating}
              isLoading={isUpdating}
              loadingText="Updating..."
            >
              Save Changes
            </LoadingButton>
          </div>
        </div>
      </ListModal>

      <ListModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedList(null);
        }}
        title="Delete List"
        subtitle="This action cannot be undone"
      >
        <div className="space-y-6">
          <p className="text-gray-600">
            Are you sure you want to delete "{selectedList?.name}"? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outlined"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedList(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <LoadingButton
              onClick={handleDeleteList}
              disabled={isDeleting}
              isLoading={isDeleting}
              loadingText="Deleting..."
              className="bg-red-600 hover:bg-red-700"
            >
              Delete List
            </LoadingButton>
          </div>
        </div>
      </ListModal>
    </PageLayout>
  );
}

export default function ListsPage() {
  return <ListsPageContent />;
}

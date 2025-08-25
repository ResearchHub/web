'use client';

import { useState } from 'react';
import { useUserLists } from '@/hooks/useUserLists';
import { UserListCard } from './UserListCard';
import { CreateListModal } from './CreateListModal';
import { UserListFilters } from './UserListFilters';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Alert } from '@/components/ui/Alert';
import { Plus, AlertCircle } from 'lucide-react';
import type { ListVisibility, UpdateUserListParams } from '@/types/userList';

interface UserListsPageProps {
  initialVisibility?: ListVisibility;
}

export const UserListsPage = ({ initialVisibility }: UserListsPageProps) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedVisibility, setSelectedVisibility] = useState<ListVisibility | undefined>(
    initialVisibility
  );

  const {
    lists,
    isLoading,
    error,
    hasMore,
    loadMore,
    createList,
    updateList,
    deleteList,
    addDocumentToList,
    removeDocumentFromList,
    addPermission,
    removePermission,
    visibility,
    setVisibility,
  } = useUserLists(selectedVisibility);

  const handleCreateList = async (params: {
    title: string;
    description?: string;
    visibility: ListVisibility;
  }) => {
    try {
      await createList(params);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Failed to create list:', error);
    }
  };

  const handleVisibilityChange = (newVisibility: ListVisibility | undefined) => {
    setSelectedVisibility(newVisibility);
    setVisibility(newVisibility);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="error">
          <AlertCircle className="h-4 w-4" />
          <div className="text-sm font-medium">{error.message || 'Failed to load user lists'}</div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Lists</h1>
          <p className="text-gray-600 mt-2">Organize and share your favorite research documents</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create List
        </Button>
      </div>

      {/* Filters */}
      <UserListFilters
        currentVisibility={visibility}
        onVisibilityChange={handleVisibilityChange}
        className="mb-6"
      />

      {/* Lists Grid */}
      {isLoading && lists.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : lists.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No lists yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first list to start organizing your research
          </p>
          <Button onClick={() => setIsCreateModalOpen(true)}>Create Your First List</Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => (
              <UserListCard
                key={list.id}
                list={list}
                onUpdate={async (listId: string, params: UpdateUserListParams) => {
                  await updateList(listId, params);
                }}
                onDelete={deleteList}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="text-center mt-8">
              <Button onClick={loadMore} disabled={isLoading} variant="outlined">
                {isLoading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Create List Modal */}
      <CreateListModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateList}
      />
    </div>
  );
};

'use client';

import { useState, useEffect } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { useUserListsContext } from '@/contexts/UserListsContext';
import { useListModals } from '@/hooks/useListModals';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit2, Trash2, FolderPlus, Loader2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { ListModal } from '@/components/modals/ListModal';
import { Input } from '@/components/ui/form/Input';
import { formatDistanceToNow } from 'date-fns';
import { formatItemCount } from '@/utils/listUtils';
import { buildListUrl, generateSlug } from '@/utils/url';
import { useInView } from 'react-intersection-observer';
import { useShareModalContext } from '@/contexts/ShareContext';

function ListsPageContent() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const {
    lists,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    createList,
    updateList,
    deleteList,
  } = useUserListsContext();
  const modals = useListModals();
  const { showShareModal } = useShareModalContext();

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push(`/auth/signin?redirect=${encodeURIComponent('/lists')}`);
    }
  }, [user, isUserLoading, router]);

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  useEffect(() => {
    if (inView && hasMore && !isLoading && !isLoadingMore) {
      loadMore();
    }
  }, [inView, hasMore, isLoading, isLoadingMore, loadMore]);

  const handleCreateList = async () => {
    if (!modals.listName.trim()) return;
    modals.setIsSubmitting(true);
    try {
      await createList({ name: modals.listName.trim() });
      modals.closeModals();
    } catch (error) {
      console.error('Failed to create list:', error);
      modals.setIsSubmitting(false);
    }
  };

  const handleUpdateList = async () => {
    if (!modals.selectedList || !modals.listName.trim()) return;
    modals.setIsSubmitting(true);
    try {
      await updateList(modals.selectedList.id, { name: modals.listName.trim() });
      modals.closeModals();
    } catch (error) {
      console.error('Failed to update list:', error);
      modals.setIsSubmitting(false);
    }
  };

  const handleDeleteList = async () => {
    if (!modals.selectedList) return;
    modals.setIsSubmitting(true);
    try {
      await deleteList(modals.selectedList.id);
      modals.closeModals();
    } catch (error) {
      console.error('Failed to delete list:', error);
      modals.setIsSubmitting(false);
    }
  };

  // Show loading while checking authentication
  if (isUserLoading) {
    return (
      <PageLayout>
        <div className="px-4 sm:px-0 py-6 sm:py-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        </div>
      </PageLayout>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <PageLayout>
        <div className="px-4 sm:px-0 py-6 sm:py-8 max-w-4xl mx-auto">
          {/* Banner Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                  <FolderPlus className="w-8 h-8 sm:w-10 sm:h-10 text-gray-600" />
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
      <PageLayout>
        <div className="px-4 sm:px-0 py-6 sm:py-8 max-w-4xl mx-auto">
          {/* Banner Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                  <FolderPlus className="w-8 h-8 sm:w-10 sm:h-10 text-gray-600" />
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
    <PageLayout>
      <div className="px-4 sm:px-0 py-6 sm:py-8 max-w-4xl mx-auto">
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                <FolderPlus className="w-8 h-8 sm:w-10 sm:h-10 text-gray-600" />
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
                  onClick={modals.openCreateModal}
                  className="gap-2 w-full sm:w-auto flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Create List
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Always render existing lists */}
        {lists.length > 0 && (
          <div className="grid grid-cols-1 gap-3">
            {lists.map((list) => (
              <Link
                key={list.id}
                href={buildListUrl(list.id, generateSlug(list.name))}
                className="group flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3 bg-white rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-all duration-200"
              >
                <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                  <FolderPlus className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
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
                      const listUrl = buildListUrl(list.id, generateSlug(list.name));
                      const fullUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}${listUrl}`;
                      showShareModal({
                        url: fullUrl,
                        docTitle: list.name,
                        action: 'USER_SHARED_DOCUMENT',
                        shouldShowConfetti: false,
                      });
                    }}
                    className="h-8 w-8 sm:h-8 sm:w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 active:bg-gray-200"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault();
                      modals.openEditModal(list);
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
                      modals.openDeleteModal(list);
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

        {/* Show skeletons when initially loading with no lists */}
        {isLoading && lists.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        )}

        {/* Show empty state only when not loading and no lists */}
        {!isLoading && lists.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <FolderPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No lists yet</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Create your first list to start organizing content
            </p>
            <Button
              variant="outlined"
              size="sm"
              onClick={modals.openCreateModal}
              className="gap-2 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              Create Your First List
            </Button>
          </div>
        )}

        {/* Show skeleton loaders for new items being loaded */}
        {isLoadingMore && (
          <>
            {[...Array(3)].map((_, index) => (
              <div
                key={`skeleton-more-${index}`}
                className={`bg-white rounded-lg p-4 border border-gray-200 ${index > 0 || lists.length > 0 ? 'mt-3' : ''}`}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gray-200 animate-pulse"></div>
                  <div className="flex-1 min-w-0">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Infinite scroll sentinel */}
        {!isLoading && hasMore && (
          <div ref={loadMoreRef} className="h-10 flex items-center justify-center mt-4"></div>
        )}
      </div>

      <ListModal
        isOpen={modals.isCreateModalOpen}
        onClose={modals.closeModals}
        title="Create New List"
        subtitle="Organize your saved papers, posts, and more"
      >
        <div className="space-y-6">
          <Input
            label="List Name"
            placeholder="Enter list name"
            value={modals.listName}
            onChange={(e) => modals.setListName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && modals.listName.trim()) {
                handleCreateList();
              }
            }}
            autoFocus
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outlined" onClick={modals.closeModals} disabled={modals.isSubmitting}>
              Cancel
            </Button>
            <LoadingButton
              onClick={handleCreateList}
              disabled={!modals.listName.trim() || modals.isSubmitting}
              isLoading={modals.isSubmitting}
              loadingText="Creating..."
            >
              Create List
            </LoadingButton>
          </div>
        </div>
      </ListModal>

      <ListModal
        isOpen={modals.isEditModalOpen}
        onClose={modals.closeModals}
        title="Edit List"
        subtitle="Update your list name"
      >
        <div className="space-y-6">
          <Input
            label="List Name"
            placeholder="Enter list name"
            value={modals.listName}
            onChange={(e) => modals.setListName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && modals.listName.trim()) {
                handleUpdateList();
              }
            }}
            autoFocus
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outlined" onClick={modals.closeModals} disabled={modals.isSubmitting}>
              Cancel
            </Button>
            <LoadingButton
              onClick={handleUpdateList}
              disabled={!modals.listName.trim() || modals.isSubmitting}
              isLoading={modals.isSubmitting}
              loadingText="Updating..."
            >
              Save Changes
            </LoadingButton>
          </div>
        </div>
      </ListModal>

      <ListModal
        isOpen={modals.isDeleteModalOpen}
        onClose={modals.closeModals}
        title="Delete List"
        subtitle="This action cannot be undone"
      >
        <div className="space-y-6">
          <p className="text-gray-600">
            Are you sure you want to delete "{modals.selectedList?.name}"? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outlined" onClick={modals.closeModals} disabled={modals.isSubmitting}>
              Cancel
            </Button>
            <LoadingButton
              onClick={handleDeleteList}
              disabled={modals.isSubmitting}
              isLoading={modals.isSubmitting}
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

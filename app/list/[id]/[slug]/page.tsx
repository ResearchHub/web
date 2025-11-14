'use client';

import { PageLayout } from '@/app/layouts/PageLayout';
import { useUserList } from '@/hooks/useUserLists';
import { useUserListsContext } from '@/contexts/UserListsContext';
import { useListModals } from '@/hooks/useListModals';
import { useShareModalContext } from '@/contexts/ShareContext';
import { useUser } from '@/contexts/UserContext';
import { useRouter, useParams } from 'next/navigation';
import { FeedEntryItem } from '@/components/Feed/FeedEntryItem';
import { FeedItemSkeleton } from '@/components/Feed/FeedItemSkeleton';
import { FolderPlus, Loader2, Edit2, Trash2, MoreHorizontal, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { ListModal } from '@/components/modals/ListModal';
import { Input } from '@/components/ui/form/Input';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { useState, useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import { formatItemCount, convertListItemsToFeedEntries } from '@/utils/listUtils';
import { generateSlug, buildListUrl } from '@/utils/url';

export default function ListDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoading: isUserLoading } = useUser();
  const listId = params?.id ? parseInt(params.id as string) : null;
  const slug = params?.slug as string | undefined;
  const { updateList, deleteList, fetchLists } = useUserListsContext();
  const {
    list,
    items,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    removeItem,
    updateListDetails,
  } = useUserList(listId, { onItemMutated: fetchLists });

  const { showShareModal } = useShareModalContext();
  const modals = useListModals();

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!isUserLoading && !user) {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      router.push(`/auth/signin?redirect=${encodeURIComponent(currentPath)}`);
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

  useEffect(() => {
    if (list && slug) {
      const expectedSlug = generateSlug(list.name);
      if (slug !== expectedSlug) {
        router.replace(buildListUrl(list.id, expectedSlug));
      }
    }
  }, [list, slug, router]);

  const handleUpdateList = async () => {
    if (!list || !modals.listName.trim()) return;
    const newName = modals.listName.trim();
    modals.setIsSubmitting(true);
    try {
      const updatedList = await updateList(list.id, { name: newName });
      updateListDetails(updatedList);
      const newSlug = generateSlug(newName);
      modals.closeModals();
      router.replace(buildListUrl(list.id, newSlug));
    } catch (error) {
      console.error('Failed to update list:', error);
      modals.setIsSubmitting(false);
    }
  };

  const handleDeleteList = async () => {
    if (!list) return;
    modals.setIsSubmitting(true);
    try {
      await deleteList(list.id);
      modals.closeModals();
      router.push('/lists');
    } catch (error) {
      console.error('Failed to delete list:', error);
      modals.setIsSubmitting(false);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await removeItem(itemId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  // Check if current user is the owner of the list
  const isOwner = user && list && list.created_by === user.id;

  // Convert list items to FeedEntry format for display
  // useMemo must be called before any conditional returns to avoid hooks order violation
  const feedEntries = useMemo(() => convertListItemsToFeedEntries(items), [items]);

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
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm mb-3">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <span>/</span>
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="space-y-12">
            {[...Array(3)].map((_, index) => (
              <FeedItemSkeleton key={`skeleton-loading-${index}`} />
            ))}
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !list) {
    return (
      <PageLayout>
        <div className="px-4 sm:px-0 py-6 sm:py-8 max-w-4xl mx-auto">
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">List</h1>
                <p className="text-gray-600">Loading list details...</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error || 'List not found'}
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="px-4 sm:px-0 py-6 sm:py-8 max-w-4xl mx-auto">
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-row items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 mb-1 truncate">{list.name}</h1>
              <p className="text-gray-600">{formatItemCount(list)}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  showShareModal({
                    url: typeof window !== 'undefined' ? window.location.href : '',
                    docTitle: list.name,
                    action: 'USER_SHARED_DOCUMENT',
                    shouldShowConfetti: false,
                  })
                }
                className="flex items-center text-gray-400 hover:text-gray-600"
              >
                <Share2 className="w-5 h-5" />
              </Button>
              {isOwner && (
                <BaseMenu
                  trigger={
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </Button>
                  }
                  align="end"
                >
                  <BaseMenuItem
                    onClick={() => list && modals.openEditModal(list)}
                    className="flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </BaseMenuItem>
                  <BaseMenuItem
                    onClick={() => list && modals.openDeleteModal(list)}
                    className="flex items-center gap-2 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </BaseMenuItem>
                </BaseMenu>
              )}
            </div>
          </div>
        </div>

        {/* Always render existing items */}
        {items.length > 0 && (
          <div className="space-y-12">
            {feedEntries.map((entry, index) => (
              <div key={entry.id || index} className="relative group">
                <FeedEntryItem
                  entry={entry}
                  index={0}
                  hideActions={false}
                  disableCardLinks={false}
                />
                {isOwner && (
                  <div className="absolute top-16 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemoveItem(Number(entry.id));
                      }}
                      className="h-8 w-8 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-300 shadow-md rounded-full"
                    >
                      <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-600" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Show skeletons when initially loading with no items */}
        {isLoading && items.length === 0 && (
          <>
            {[...Array(3)].map((_, index) => (
              <div key={`skeleton-${index}`} className={index > 0 ? 'mt-12' : ''}>
                <FeedItemSkeleton />
              </div>
            ))}
          </>
        )}

        {/* Show empty state only when not loading and no items */}
        {!isLoading && items.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <FolderPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">This list is empty</h3>
            <p className="text-gray-600">Start adding items to this list</p>
          </div>
        )}

        {/* Infinite scroll sentinel */}
        {!isLoading && hasMore && (
          <div ref={loadMoreRef} className="h-10 flex items-center justify-center mt-4">
            {isLoadingMore && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading more items...</span>
              </div>
            )}
          </div>
        )}
      </div>

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
            Are you sure you want to delete "{list.name}"? This action cannot be undone.
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

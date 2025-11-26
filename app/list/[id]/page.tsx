'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import { useUserListDetail } from '@/components/UserList/lib/hooks/useUserListDetail';
import { useUserListsContext } from '@/components/UserList/lib/UserListsContext';
import { useUser } from '@/contexts/UserContext';
import { FeedContent } from '@/components/Feed/FeedContent';
import { FeedItemSkeleton } from '@/components/Feed/FeedItemSkeleton';
import { FolderPlus, Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ListModal } from '@/components/modals/ListModal';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { formatItemCount, transformListItemToFeedEntry } from '@/components/UserList/lib/listUtils';
import { FeedEntry } from '@/types/feed';

interface ModalState {
  readonly isOpen: boolean;
  readonly mode: 'edit' | 'delete';
  readonly name: string;
}

const INITIAL_MODAL: ModalState = { isOpen: false, mode: 'edit', name: '' };

export default function ListDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useUser();
  const listId = params?.id ? Number(params.id) : null;
  const { updateList, deleteList } = useUserListsContext();
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
  } = useUserListDetail(listId);

  const [modal, setModal] = useState<ModalState>(INITIAL_MODAL);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openModal = (mode: ModalState['mode'], name: string = '') =>
    setModal({ isOpen: true, mode, name });

  const isOwner = user && list && list.createdBy === user.id;
  const feedEntries = items.map(transformListItemToFeedEntry);

  const itemWrapper = (
    feedItemComponent: React.ReactNode,
    feedEntry: FeedEntry,
    itemIndex: number
  ) => {
    const listItem = items[itemIndex];
    return (
      <div className="relative group">
        {feedItemComponent}
        {isOwner && listItem && (
          <div className="absolute top-16 right-4 z-20 opacity-100 sm:!opacity-0 sm:group-hover:!opacity-100 transition-opacity pointer-events-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                removeItem(listItem.id);
              }}
              className="h-8 w-8 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-300 shadow-md rounded-full"
            >
              <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-600" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  const handleModalSubmit = async () => {
    if (!list) return;
    setIsSubmitting(true);

    const modalMode = modal.mode;
    const listNameInput = modal.name.trim();

    try {
      if (modalMode === 'edit') {
        const updatedList = await updateList(list.id, { name: listNameInput });
        updateListDetails(updatedList);
      } else {
        await deleteList(list.id);
        router.push('/lists');
      }
      setModal(INITIAL_MODAL);
    } catch (error) {
      console.error('Failed to submit list action:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <div className="px-4 sm:px-0 py-6 sm:py-8 max-w-4xl mx-auto">
        {list ? (
          <>
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-6">
              <div className="flex flex-row items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-gray-900 mb-1 truncate">{list.name}</h1>
                  <p className="text-gray-600">{formatItemCount(list)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
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
                        onClick={() => openModal('edit', list.name)}
                        className="flex items-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>Edit</span>
                      </BaseMenuItem>
                      <BaseMenuItem
                        onClick={() => openModal('delete', list.name)}
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

            <FeedContent
              entries={feedEntries}
              isLoading={isLoading}
              isLoadingMore={isLoadingMore}
              hasMore={hasMore}
              loadMore={loadMore}
              itemWrapper={itemWrapper}
              noEntriesElement={
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <FolderPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    This list doesn't have any items yet
                  </h3>
                  <p className="text-gray-600">Start adding items to this list</p>
                </div>
              }
            />
          </>
        ) : (
          <>
            {isLoading ? (
              <>
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-6">
                  <Skeleton className="h-8 w-48 mb-2" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <div className="space-y-12">
                  {Array.from({ length: 3 }).map((_, skeletonIndex) => (
                    <FeedItemSkeleton key={'list-item-skeleton-' + skeletonIndex} />
                  ))}
                </div>
              </>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                {error || 'List not found'}
              </div>
            )}
          </>
        )}
      </div>

      <ListModal
        {...modal}
        onClose={() => setModal(INITIAL_MODAL)}
        onNameChange={(name) => setModal((previousModal) => ({ ...previousModal, name }))}
        onSubmit={handleModalSubmit}
        isSubmitting={isSubmitting}
      />
    </PageLayout>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, notFound } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import { useUserListDetail } from '@/components/UserList/lib/hooks/useUserListDetail';
import { useUserListsContext } from '@/components/UserList/lib/UserListsContext';
import { useUser } from '@/contexts/UserContext';
import { FeedContent } from '@/components/Feed/FeedContent';
import { FeedItemSkeleton } from '@/components/Feed/FeedItemSkeleton';
import { Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-regular-svg-icons';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ListModal } from '@/components/modals/ListModal';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { formatItemCount, transformListItemToFeedEntry } from '@/components/UserList/lib/listUtils';
import { ListDetailContext } from '@/components/UserList/lib/user-list';
import { formatTimeAgo } from '@/utils/date';
import { FeedEntry } from '@/types/feed';
import { ID } from '@/types/root';

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
  const id = params?.id as ID;

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
  } = useUserListDetail(id);

  const [modal, setModal] = useState<ModalState>(INITIAL_MODAL);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (error) {
      notFound();
    }
  }, [error]);

  const openModal = (mode: ModalState['mode'], name: string = '') =>
    setModal({ isOpen: true, mode, name });

  const isOwner = user && list && list.createdBy == user.id;
  const isDefaultList = list?.isDefault;
  const feedEntries = items.map(transformListItemToFeedEntry);

  const handleRemoveItem = async (unifiedDocumentId: ID) => {
    const foundListItem = items.find((item) => item.unifiedDocument === unifiedDocumentId);
    if (foundListItem) {
      await removeItem(foundListItem.id, unifiedDocumentId);
    }
  };

  const listDetailContextValue =
    isOwner && list
      ? {
          listId: list.id,
          onRemoveItem: handleRemoveItem,
        }
      : null;

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
                  <p className="text-gray-600">
                    {formatItemCount(list)}
                    {!isDefaultList && (
                      <>
                        <span className="hidden sm:!inline"> • </span>
                        <br className="sm:!hidden" />
                        <span className="text-sm sm:!text-base">
                          Created {formatTimeAgo(list.createdDate)}
                        </span>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isOwner && !isDefaultList && (
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
                        <span>Rename</span>
                      </BaseMenuItem>
                      <BaseMenuItem
                        onClick={() => openModal('delete', list.name)}
                        className="flex items-center gap-2 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Remove List</span>
                      </BaseMenuItem>
                    </BaseMenu>
                  )}
                </div>
              </div>
            </div>

            <ListDetailContext.Provider value={listDetailContextValue}>
              <FeedContent
                entries={feedEntries}
                isLoading={isLoading}
                isLoadingMore={isLoadingMore}
                hasMore={hasMore}
                loadMore={loadMore}
                noEntriesElement={
                  <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                    <FontAwesomeIcon
                      icon={faBookmark}
                      className="w-12 h-12 text-gray-300 mx-auto mb-4"
                    />
                    <p className="text-gray-600">No items in this list</p>
                  </div>
                }
              />
            </ListDetailContext.Provider>
          </>
        ) : (
          <>
            {isLoading && (
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

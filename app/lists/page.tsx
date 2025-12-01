'use client';

import { useState, useEffect } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { useUserListsContext } from '@/components/UserList/lib/UserListsContext';
import { UserList } from '@/components/UserList/lib/user-list';
import { UserListRow, UserListRowSkeleton, UserListTableHeader } from './components/UserListRow';
import { ListModal } from '@/components/modals/ListModal';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useUser } from '@/contexts/UserContext';
import { useInView } from 'react-intersection-observer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-regular-svg-icons';
import { pluralizeSuffix } from '@/utils/stringUtils';

interface ModalState {
  readonly isOpen: boolean;
  readonly mode: 'create' | 'edit' | 'delete';
  readonly list: UserList | null;
  readonly name: string;
}

const INITIAL_MODAL: ModalState = { isOpen: false, mode: 'create', list: null, name: '' };
const INFINITE_SCROLL_CONFIG = { threshold: 0, rootMargin: '100px' };

interface ListsPageHeaderProps {
  readonly user: { firstName?: string; lastName?: string } | null;
  readonly totalCount: number;
  readonly onCreateClick: () => void;
}

function ListsPageHeader({ user, totalCount, onCreateClick }: ListsPageHeaderProps) {
  return (
    <div className="relative px-4 sm:!px-8 py-6 flex flex-col sm:!flex-row sm:!items-center gap-4 sm:!gap-6 bg-gradient-to-b from-gray-100/80 to-gray-50/20 border-b border-gray-100 rounded-lg">
      <div className="flex flex-col gap-1 flex-1 text-center sm:!text-left">
        <h1 className="text-2xl md:!text-3xl font-bold text-gray-900 tracking-tight">Your Lists</h1>
        <div className="flex items-center justify-center sm:!justify-start gap-2 text-sm text-gray-600">
          <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-[10px]">
            {user?.firstName?.[0] || 'U'}
          </div>
          <span>{user?.firstName ? `${user.firstName} ${user.lastName}` : 'User'}</span>
          <span className="text-gray-300">•</span>
          <span>
            {totalCount} list{pluralizeSuffix(totalCount)}
          </span>
        </div>
      </div>
      {totalCount > 0 && (
        <div className="w-full sm:!w-auto mt-4 sm:!mt-0 sm:!ml-auto">
          <Button onClick={onCreateClick} className="w-full sm:!w-auto gap-2">
            <Plus className="w-4 h-4" /> Create List
          </Button>
        </div>
      )}
    </div>
  );
}

export default function ListsPage() {
  const {
    lists,
    isLoadingLists,
    isLoadingMoreLists,
    hasMoreLists,
    loadMoreLists,
    errorLoadingLists,
    createList,
    updateList,
    deleteList,
    totalListsCount,
  } = useUserListsContext();
  const [modal, setModal] = useState<ModalState>(INITIAL_MODAL);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();
  const { ref: loadMoreRef, inView } = useInView(INFINITE_SCROLL_CONFIG);

  useEffect(() => {
    if (inView && hasMoreLists && !isLoadingLists && !isLoadingMoreLists) loadMoreLists();
  }, [inView, hasMoreLists, isLoadingLists, isLoadingMoreLists, loadMoreLists]);

  const openModal = (mode: ModalState['mode'], listToModify: UserList | null = null) =>
    setModal({ isOpen: true, mode, list: listToModify, name: listToModify?.name || '' });

  const handleModalSubmit = async () => {
    setIsSubmitting(true);
    const modalMode = modal.mode;
    const listToModify = modal.list;
    const listNameInput = modal.name.trim();

    try {
      if (modalMode === 'create') {
        await createList({ name: listNameInput });
      } else if (modalMode === 'edit' && listToModify) {
        await updateList(listToModify.id, { name: listNameInput });
      } else if (modalMode === 'delete' && listToModify) {
        await deleteList(listToModify.id);
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
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-gray-50/50 to-white pb-20">
        {!isLoadingLists && (
          <ListsPageHeader
            user={user}
            totalCount={totalListsCount}
            onCreateClick={() => openModal('create')}
          />
        )}

        <div className="px-4 sm:!px-8 py-4 max-w-7xl mx-auto">
          {errorLoadingLists && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {errorLoadingLists}
            </div>
          )}
          <div>
            {!isLoadingLists && lists.length > 0 && <UserListTableHeader />}
            <div className="space-y-1">
              {isLoadingLists &&
                Array.from({ length: 5 }).map((_, skeletonIndex) => (
                  <UserListRowSkeleton key={'list-skeleton-' + skeletonIndex} />
                ))}
              {!isLoadingLists && lists.length === 0 && (
                <div className="text-center py-20">
                  <FontAwesomeIcon
                    icon={faBookmark}
                    className="w-12 h-12 text-gray-300 mx-auto mb-3"
                  />
                  <p className="text-gray-500 mb-4">You haven't created any lists yet.</p>
                  <Button onClick={() => openModal('create')} className="sm:!w-auto gap-2">
                    <Plus className="w-4 h-4" />
                    Create List
                  </Button>
                </div>
              )}
              {!isLoadingLists && lists.length > 0 && (
                <>
                  {lists.map((list) => (
                    <UserListRow
                      key={list.id}
                      list={list}
                      onEdit={(listToEdit) => openModal('edit', listToEdit)}
                      onDelete={(listToDelete) => openModal('delete', listToDelete)}
                    />
                  ))}
                  {isLoadingMoreLists && (
                    <div className="space-y-1 pt-1">
                      {Array.from({ length: 3 }).map((_, skeletonIndex) => (
                        <UserListRowSkeleton key={'list-skeleton-loadmore-' + skeletonIndex} />
                      ))}
                    </div>
                  )}
                  {!isLoadingMoreLists && hasMoreLists && (
                    <div ref={loadMoreRef} className="h-10" />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
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

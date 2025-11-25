'use client';

import { useState, useEffect } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { useUserLists } from '@/components/UserList/lib/hooks/useUserLists';
import { UserList } from '@/components/UserList/lib/user-list';
import { UserListRow, UserListRowSkeleton } from './components/UserListRow';
import { ListModal } from '@/components/modals/ListModal';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useUser } from '@/contexts/UserContext';
import { useInView } from 'react-intersection-observer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/pro-light-svg-icons';
import { pluralizeSuffix } from '@/utils/stringUtils';

interface ModalState {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'delete';
  list: UserList | null;
  name: string;
}

const INITIAL_MODAL: ModalState = { isOpen: false, mode: 'create', list: null, name: '' };

export default function ListsPage() {
  const {
    lists,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    error,
    createList,
    updateList,
    deleteList,
    totalCount,
  } = useUserLists();
  const [modal, setModal] = useState<ModalState>(INITIAL_MODAL);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();
  const { ref: loadMoreRef, inView } = useInView({ threshold: 0, rootMargin: '100px' });

  useEffect(() => {
    if (inView && hasMore && !isLoading && !isLoadingMore) loadMore();
  }, [inView, hasMore, isLoading, isLoadingMore, loadMore]);

  const openModal = (mode: ModalState['mode'], list: UserList | null = null) =>
    setModal({ isOpen: true, mode, list, name: list?.name || '' });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const { mode, list, name } = modal;
    try {
      if (mode === 'create') await createList({ name: name.trim() });
      else if (mode === 'edit' && list) await updateList(list.id, { name: name.trim() });
      else if (mode === 'delete' && list) await deleteList(list.id);
      setModal(INITIAL_MODAL);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-gray-50/50 to-white pb-20">
        <div className="relative px-4 sm:!px-8 py-6 flex flex-col sm:!flex-row sm:!items-center gap-4 sm:!gap-6 bg-gradient-to-b from-gray-100/80 to-gray-50/20 border-b border-gray-100">
          <div className="w-16 h-16 sm:!w-20 sm:!h-20 bg-white shadow-sm rounded-lg flex items-center justify-center shrink-0 mx-auto sm:!mx-0">
            <FontAwesomeIcon icon={faBookmark} className="w-10 h-10 text-gray-300" />
          </div>
          <div className="flex flex-col gap-1 flex-1 text-center sm:!text-left">
            <h1 className="text-2xl md:!text-3xl font-bold text-gray-900 tracking-tight">
              Your Lists
            </h1>
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
          <div className="w-full sm:!w-auto mt-4 sm:!mt-0 sm:!ml-auto">
            <Button
              onClick={() => openModal('create')}
              variant="outlined"
              className="w-full sm:!w-auto gap-2"
            >
              <Plus className="w-4 h-4" /> Create
            </Button>
          </div>
        </div>

        <div className="px-4 sm:!px-8 py-4 max-w-7xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}
          <div className="space-y-1">
            {isLoading && (
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <UserListRowSkeleton key={'list-skeleton-' + i} />
                ))}
              </>
            )}
            {!isLoading && lists.length === 0 && (
              <div className="text-center py-20">
                <FontAwesomeIcon
                  icon={faBookmark}
                  className="w-12 h-12 text-gray-300 mx-auto mb-3"
                />
                <p className="text-gray-500 mb-4">No lists created yet</p>
                <Button variant="outlined" onClick={() => openModal('create')}>
                  Create your first list
                </Button>
              </div>
            )}
            {!isLoading && lists.length > 0 && (
              <>
                {lists.map((list) => (
                  <UserListRow
                    key={list.id}
                    list={list}
                    onEdit={(l) => openModal('edit', l)}
                    onDelete={(l) => openModal('delete', l)}
                  />
                ))}
                {isLoadingMore && (
                  <div className="space-y-1 pt-1">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <UserListRowSkeleton key={'list-skeleton-loadmore-' + i} />
                    ))}
                  </div>
                )}
                {!isLoadingMore && hasMore && <div ref={loadMoreRef} className="h-10" />}
              </>
            )}
          </div>
        </div>
      </div>
      <ListModal
        {...modal}
        onClose={() => setModal(INITIAL_MODAL)}
        onNameChange={(name) => setModal((p) => ({ ...p, name }))}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </PageLayout>
  );
}

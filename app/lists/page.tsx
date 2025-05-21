'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import useUserSaved from '@/hooks/useUserSaved';
import { Bookmark } from 'lucide-react';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import UserListOverview from '@/components/UserSaved/UserListOverview';

export default function SavedPage() {
  const router = useRouter();
  const { lists, isLoading, error, fetchLists, createList, deleteList } = useUserSaved();

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const handleFocusList = (listName: string) => {
    router.push(`/lists/${encodeURIComponent(listName)}`);
  };

  const renderHeader = () => (
    <MainPageHeader
      icon={<Bookmark className="w-6 h-6 text-indigo-500" />}
      title="My Lists"
      subtitle="Save and revisit your favorite research"
    />
  );

  return (
    <PageLayout>
      {renderHeader()}
      <UserListOverview
        userSavedLists={lists}
        loading={isLoading}
        error={error}
        handleTakeFocus={handleFocusList}
        handleDelete={deleteList}
        handleCreateList={createList}
        fetchLists={fetchLists}
      />
    </PageLayout>
  );
}

'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import useUserSaved from '@/hooks/useUserSaved';
import UserListFocusView from '@/components/UserSaved/UserListFocusView';
import { Bookmark } from 'lucide-react';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import toast from 'react-hot-toast';

interface ListDetailPageProps {
  params: Promise<{ listName: string }>;
}

export default function ListDetailPage({ params }: ListDetailPageProps) {
  const router = useRouter();
  const { listName } = use(params);
  const { listItems, isLoading, fetchListItems, deleteListDocument } = useUserSaved();

  useEffect(() => {
    const loadList = async () => {
      try {
        await fetchListItems(listName);
      } catch (err: any) {
        toast.error(`List ${listName} not found`);
        router.push('/lists');
      }
    };
    loadList();
  }, [listName, fetchListItems, router]);

  const renderHeader = () => (
    <MainPageHeader
      icon={<Bookmark className="w-6 h-6 text-indigo-500" />}
      title={listName}
      subtitle={`${listItems.length} items`}
    />
  );

  return (
    <PageLayout>
      {renderHeader()}
      <UserListFocusView
        loading={isLoading}
        listItems={listItems}
        focusedList={listName}
        deleteListDocument={deleteListDocument}
      />
    </PageLayout>
  );
}

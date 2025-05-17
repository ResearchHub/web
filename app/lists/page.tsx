'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import useUserSaved from '@/hooks/useUserSaved';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import UserListOverview from '@/components/UserSaved/UserListOverview';
import { Bookmark } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { MainPageHeader } from '@/components/ui/MainPageHeader';

const MAX_SAVED_CONTENT_NAME_LENGTH = 200;

export default function SavedPage() {
  const router = useRouter();
  const { lists, isLoading, error, fetchLists, createList, deleteList } = useUserSaved();

  let [newListName, setNewListName] = useState<string>('');
  let [inputValid, setInputValid] = useState<boolean>(true);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const handleFocusList = (listName: string) => {
    router.push(`/lists/${encodeURIComponent(listName)}`);
  };

  const handleCreateList = () => {
    createList(newListName);
    toast.success(`List "${newListName}" created`);
    setNewListName('');
  };

  const handleListInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValid(
      e.target.value.length < MAX_SAVED_CONTENT_NAME_LENGTH && !lists.includes(e.target.value)
    );
    setNewListName(e.target.value);
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
      <div>
        <div className="flex flex-row gap-2">
          <Input
            type="text"
            alt="New list name"
            value={newListName}
            onChange={handleListInput}
            placeholder="Your list name"
          />
          {inputValid ? (
            <Button size={'md'} onClick={handleCreateList} title="Create New List" className="mb-2">
              Create
            </Button>
          ) : (
            <Button className="bg-red-400" title="Invalid Input">
              Invalid
            </Button>
          )}
        </div>
        <UserListOverview
          userSavedLists={lists}
          loading={isLoading}
          error={error}
          handleTakeFocus={handleFocusList}
          handleDelete={deleteList}
        />
      </div>
    </PageLayout>
  );
}

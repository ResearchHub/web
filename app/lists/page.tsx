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
import { isValidListName } from '@/utils/validation';

export default function SavedPage() {
  const router = useRouter();
  const { lists, isLoading, error, fetchLists, createList, deleteList } = useUserSaved();

  let [newListName, setNewListName] = useState<string>('');
  let [inputValid, setInputValid] = useState<boolean>(false);

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
    setInputValid(false);
  };

  const handleListInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isValid = isValidListName(e.target.value);
    setInputValid(isValid && !lists.includes(e.target.value));
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
            onKeyDown={(e) => {
              if (e.key === 'Enter' && inputValid) {
                handleCreateList();
              }
            }}
          />
          <Button
            size={'md'}
            onClick={handleCreateList}
            title="Create New List"
            className={`mb-2 ${inputValid ? 'bg-indigo-500' : 'bg-gray-400'}`}
            disabled={!inputValid}
          >
            Create
          </Button>
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

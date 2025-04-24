'use client';

import { useEffect, useState } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import useUserSaved from '@/hooks/useUserSaved';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import UserListFocusView from '@/components/UserSaved/UserListFocusView';
import UserListOverview from '@/components/UserSaved/UserListOverview';
import { List } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { MainPageHeader } from '@/components/ui/MainPageHeader';

const MAX_SAVED_CONTENT_NAME_LENGTH = 200;

export default function SavedPage() {
  const {
    lists,
    listItems,
    isLoading,
    error,
    fetchLists,
    fetchListItems,
    createList,
    deleteListDocument,
    deleteList,
  } = useUserSaved();

  let [focusedList, setFocusedList] = useState<string>('');
  let [newListName, setNewListName] = useState<string>('');
  let [inputValid, setInputValid] = useState<boolean>(true);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const handleFocusList = (listName: string) => {
    setFocusedList(listName);
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

  useEffect(() => {
    if (focusedList) {
      fetchListItems(focusedList);
    }
  }, [focusedList]);

  const renderHeader = () => (
    <MainPageHeader
      icon={<List className="w-6 h-6 text-indigo-500" />}
      title="My Lists"
      subtitle="Save and revisit your favorite research"
    />
  );

  return (
    <PageLayout>
      {!focusedList && renderHeader()}

      {/* List focus view */}
      {focusedList && (
        <UserListFocusView
          loading={isLoading}
          listItems={listItems}
          focusedList={focusedList}
          deleteListDocument={deleteListDocument}
        />
      )}

      {/* List overview */}
      {!focusedList && (
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
              <Button
                size={'md'}
                onClick={handleCreateList}
                title="Create New List"
                className="mb-2"
              >
                Create
              </Button>
            ) : (
              <Button className="bg-red-400" title="Invalid Input">
                Invalid
              </Button>
            )}
          </div>
          <UserListOverview
            userSavedItems={lists}
            loading={isLoading}
            error={error}
            handleTakeFocus={handleFocusList}
            handleDelete={deleteList}
          />
        </div>
      )}
    </PageLayout>
  );
}

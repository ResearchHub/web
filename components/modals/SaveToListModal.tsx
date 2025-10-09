'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ContentType } from '@/types/work';
import { Button } from '@/components/ui/Button';
import { toTitleCase } from '@/utils/stringUtils';
import { Input } from '@/components/ui/form/Input';
import { BaseModal } from '@/components/ui/BaseModal';
import { Dropdown, DropdownItem } from '@/components/ui/form/Dropdown';
import { ID } from '@/types/root';
import { useCreateList, useGetLists } from '@/hooks/useList';
import { useCreateListItem } from '@/hooks/useListItem';
import { List } from '@/services/list.service';

type saveToListModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (listName: string) => void;
  contentId: ID;
  contentType: ContentType;
};

export default function SaveToListModal({
  isOpen,
  onClose,
  onSave,
  contentId,
  contentType,
}: saveToListModalProps) {
  const [selectedListId, setSelectedListId] = useState<ID | 'new'>('');
  const [newListName, setNewListName] = useState('');

  const {
    results: lists,
    isLoading: getListsIsLoading,
    error: getListsError,
    refresh: refreshLists,
  } = useGetLists();

  const { isLoading: createListIsLoading, error: createListError, createList } = useCreateList();

  const {
    isLoading: createListItemIsLoading,
    error: createListItemError,
    createListItem,
  } = useCreateListItem();

  const isLoading = createListIsLoading || createListItemIsLoading;
  const hasError = createListError || createListItemError || getListsError;

  async function handleSave(): Promise<void> {
    try {
      let finalListId: ID;
      let finalListName: string;

      if (selectedListId === 'new') {
        const newList =
          lists.find((list) => list.name === newListName) ||
          (await createList({ name: newListName }, false));

        finalListId = newList.id;
        finalListName = newList.name;
      } else {
        finalListId = selectedListId;

        const selectedList = lists.find((list) => list.id === finalListId);

        if (!selectedList) {
          console.error(`List not found for ID: ${finalListId}`);

          return;
        }

        finalListName = selectedList.name;
      }

      await createListItem(
        {
          parent_list: finalListId,
          unified_document: contentId,
        },
        false
      );

      await refreshLists();

      onSave?.(finalListName);

      onClose();
    } catch (error) {
      console.error('Error saving to list:', error);
    }
  }

  function idInLists(unified_document: ID): boolean {
    if (!lists?.length) return false;

    return lists.some((list) => idInList(list, unified_document));
  }

  function idInList(list: List, unified_document: ID): boolean {
    return list.items?.some((item) => item.unified_document === unified_document) || false;
  }

  function getSelectedLabel(): string {
    if (selectedListId === 'new') return 'New list';

    if (selectedListId) {
      const list = lists.find((list) => list.id === selectedListId);

      if (list && !idInList(list, contentId) && list.name) {
        return list.name;
      }
    }

    return 'Or create one';
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={`Save ${toTitleCase(contentType)} to List`}>
      {hasError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{hasError.message}</p>
        </div>
      )}
      <Dropdown
        label="Select a List"
        trigger={
          <Button
            variant="outlined"
            className="w-full justify-between"
            disabled={getListsIsLoading}
          >
            {getSelectedLabel()}
            <ChevronDown size={16} className="text-gray-500" />
          </Button>
        }
        required={true}
      >
        <DropdownItem key="new" onClick={() => setSelectedListId('new')} className="italic">
          Create new list...
        </DropdownItem>
        {lists &&
          lists.map((list) => {
            const inList = list.items?.some((item) => item.unified_document === contentId);

            return (
              <DropdownItem
                key={list.id}
                onClick={() => setSelectedListId(list.id)}
                className={inList ? 'opacity-50' : ''}
                disabled={inList}
              >
                {(inList ? '(Already in list) ' : '') + list.name}
              </DropdownItem>
            );
          })}
      </Dropdown>

      {selectedListId === 'new' && <div className="mt-4"></div>}

      {selectedListId === 'new' && (
        <Input
          label="Name"
          placeholder="Enter new list name"
          required={true}
          onChange={(e) => setNewListName(e.target.value.trim())}
          maxLength={120}
        />
      )}

      <Button
        className={'w-[400px] mt-8'}
        disabled={isLoading || !selectedListId || (selectedListId === 'new' && !newListName)}
        onClick={handleSave}
      >
        {isLoading ? 'Saving...' : 'Save'}
      </Button>
    </BaseModal>
  );
}

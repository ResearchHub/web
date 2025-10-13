'use client';

import { ID } from '@/types/root';
import SearchEmpty from '@/components/ui/SearchEmpty';
import { useUser } from '@/contexts/UserContext';
import { ListCardName } from '@/app/author/[id]/lists/components/ListCard';
import { useGetList } from '@/hooks/useList';
import { AuthorProfileError } from '@/app/author/[id]/page';
import { Button } from '@/components/ui/Button';
import { ChevronDown } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Dropdown, DropdownItem } from '@/components/ui/form/Dropdown';
import { GAP_CSS } from '@/app/author/[id]/lists/components/AuthorLists';
import { ListItemsSortBy } from '@/services/list.service';
import ListItemCard, {
  ListItemCardSkeleton,
  ListItemRaw,
} from '@/app/author/[id]/list/[list_id]/components/ListItemCard';

type AuthorListProps = {
  authorId: ID;
  listId: ID;
};

const SORT_BY_OPTIONS: Record<ListItemsSortBy, string> = {
  '-created_date': 'Date saved (newest first)',
  created_date: 'Date saved (oldest first)',
  name: 'Name (A–Z)',
  '-name': 'Name (Z–A)',
};

function AuthorListSkeleton() {
  return (
    <>
      {/* Header section skeleton */}
      <div className="flex flex-row items-center justify-between mb-4 border-b border-gray-200 pb-2">
        {/* Left side - ListCardName skeleton */}
        <div className="mt-4">
          <div className="flex flex-row items-center justify-between gap-4">
            {/* Rename button skeleton */}
            <div className="flex items-center rounded-lg space-x-2 py-1.5 px-1.5">
              <div className="h-3.5 w-3.5 bg-gray-200 rounded animate-pulse" />
            </div>
            {/* List name skeleton */}
            <div className="h-6 w-40 md:h-6 md:w-48 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Right side - Sort dropdown skeleton */}
        <div className="flex items-center space-x-2 mt-4">
          <div className="w-full justify-between min-w-56 border border-gray-300 rounded-md px-3 py-2 bg-white">
            <div className="flex items-center justify-between">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* List items skeleton */}
      <div className={GAP_CSS}>
        <ListItemCardSkeleton />
        <ListItemCardSkeleton />
        <ListItemCardSkeleton />
      </div>
    </>
  );
}

export default function AuthorList({ authorId, listId }: AuthorListProps) {
  const {
    list,
    isLoading: getListIsLoading,
    error: getListError,
    refresh: refreshList,
  } = useGetList({ id: listId });

  const { user } = useUser();
  const owner = user?.authorProfile?.id === authorId;
  const [sortBy, setSortBy] = useState<ListItemsSortBy>('-created_date');

  const onSortChange = useCallback(
    async (key: ListItemsSortBy) => {
      setSortBy(key);

      await refreshList(key);
    },
    [refreshList]
  );

  const sortOptions = useMemo(() => Object.entries(SORT_BY_OPTIONS), []);

  if (getListError) {
    return (
      <AuthorProfileError
        error={getListError.message || 'Unknown error'}
        label="Error loading lists"
      />
    );
  }

  if (getListIsLoading || !list) {
    return <AuthorListSkeleton />;
  }

  return (
    <>
      <div className="flex flex-row items-center justify-between mb-4 border-b border-gray-200 pb-2">
        <div className="mt-6">
          <ListCardName list={list} refresh={refreshList}></ListCardName>
        </div>
        <div className="flex items-center space-x-2">
          <Dropdown
            label="Sort by"
            trigger={
              <Button
                variant="outlined"
                className="w-full justify-between min-w-56"
                disabled={getListIsLoading}
              >
                {SORT_BY_OPTIONS[sortBy]}
                <ChevronDown size={16} className="text-gray-500" />
              </Button>
            }
          >
            {sortOptions.map(([key, value]: string[]) => (
              <DropdownItem key={key} onClick={() => onSortChange(key as ListItemsSortBy)}>
                {value}
              </DropdownItem>
            ))}
          </Dropdown>
        </div>
      </div>
      {!list.items?.length && (
        <SearchEmpty
          title="This list is empty"
          subtitle={owner ? 'Add to it by clicking the "Save to List" button on a document.' : ''}
        />
      )}
      {list.items?.length && (
        <div className={GAP_CSS}>
          {list.items.map((item) => (
            <ListItemCard
              key={item.id}
              listItem={item as ListItemRaw}
              refreshList={refreshList}
              authorId={authorId}
            />
          ))}
        </div>
      )}
    </>
  );
}

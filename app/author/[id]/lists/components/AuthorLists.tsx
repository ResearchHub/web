'use client';

import ListCard, { ListCardSkeleton } from '@/app/author/[id]/lists/components/ListCard';
import { useGetLists } from '@/hooks/useList';
import { AuthorProfileError } from '@/app/author/[id]/page';
import SearchEmpty from '@/components/ui/SearchEmpty';
import { ID } from '@/types/root';
import { useUser } from '@/contexts/UserContext';
import { useMemo } from 'react';

export const GAP_CSS = 'gap-4 flex flex-col';

type AuthorListsProps = {
  authorId: ID;
};

function AuthorListsSkeleton() {
  return (
    <div className={GAP_CSS}>
      <ListCardSkeleton />
      <ListCardSkeleton />
      <ListCardSkeleton />
    </div>
  );
}

export default function AuthorLists({ authorId }: AuthorListsProps) {
  const {
    results: lists,
    isLoading: getListsIsLoading,
    error: getListsError,
    refresh: refreshLists,
  } = useGetLists();

  const { user } = useUser();

  const owner = useMemo(
    () => user?.authorProfile?.id === authorId,
    [user?.authorProfile?.id, authorId]
  );

  if (getListsIsLoading) {
    return <AuthorListsSkeleton />;
  }

  if (getListsError) {
    return (
      <AuthorProfileError
        error={getListsError.message || 'Unknown error'}
        label="Error loading lists"
      />
    );
  }

  if (!lists?.length) {
    return (
      <SearchEmpty
        title="No lists found"
        subtitle={owner ? 'Get started by clicking the "Save to List" button on a document.' : ''}
      />
    );
  }

  return (
    <div className={GAP_CSS}>
      {lists.map((list) => (
        <ListCard key={list.id} list={list} authorId={authorId} refreshLists={refreshLists} />
      ))}
    </div>
  );
}

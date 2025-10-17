'use client';

import { use } from 'react';
import { toNumberOrNull } from '@/lib/utils';
import AuthorList from '@/app/author/[id]/list/[list_id]/components/AuthorList';
import { useUser } from '@/contexts/UserContext';
import { AuthorProfileError } from '@/app/author/[id]/page';
import { AuthorErrorCard, UserErrorCard, UserLoadingCard } from '@/app/author/[id]/lists/page';

export default function AuthorListPage({
  params,
}: {
  params: Promise<{ id: string; list_id: string }>;
}) {
  const { id, list_id } = use(params);
  const { isLoading: isUserLoading, error: userError } = useUser();
  const authorId = toNumberOrNull(id);
  const listId = toNumberOrNull(list_id);

  if (isUserLoading) {
    return UserLoadingCard();
  }

  if (userError) {
    return UserErrorCard(userError.message);
  }

  if (!authorId) {
    return AuthorErrorCard(authorId);
  }

  if (!listId) {
    return <AuthorProfileError error={`Invalid list ID: ${listId}`} label="Error loading list" />;
  }

  return <AuthorList authorId={authorId} listId={listId} />;
}

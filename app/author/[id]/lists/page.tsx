'use client';

import { ID } from '@/types/root';
import { use } from 'react';
import { toNumberOrNull } from '@/lib/utils';
import AuthorLists from '@/app/author/[id]/lists/components/AuthorLists';
import { Card } from '@/components/ui/Card';
import { useUser } from '@/contexts/UserContext';
import { AuthorProfileError } from '@/app/author/[id]/page';

export default function AuthorListsPage({ params }: { params: Promise<{ id: string }> }) {
  const { isLoading: isUserLoading, error: userError } = useUser();
  const authorId = toNumberOrNull(use(params).id);

  if (isUserLoading) {
    return UserLoadingCard();
  }

  if (userError) {
    return UserErrorCard(userError.message);
  }

  if (!authorId) {
    return AuthorErrorCard(authorId);
  }

  return <AuthorLists authorId={authorId} />;
}

export function UserLoadingCard() {
  return <Card className="bg-gray-50 animate-pulse">Loading user...</Card>;
}

export function UserErrorCard(error: string) {
  return <AuthorProfileError error={error} label="Error loading user" />;
}

export function AuthorErrorCard(authorId: ID) {
  return (
    <AuthorProfileError error={`Invalid author ID: ${authorId}`} label="Error loading author" />
  );
}

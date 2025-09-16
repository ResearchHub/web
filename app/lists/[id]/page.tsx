'use client';

import { useParams } from 'next/navigation';
import { useUserList } from '@/hooks/useUserLists';
import { UserListDetail } from '@/components/UserLists/UserListDetail';

export default function UserListDetailPage() {
  const params = useParams();
  const listId = params.id as string;

  return <UserListDetail listId={listId} />;
}

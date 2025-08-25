'use client';

import { useParams, useRouter } from 'next/navigation';
import { useUserList } from '@/hooks/useUserLists';
import { EditListForm } from '@/components/UserLists/EditListForm';
import { Skeleton } from '@/components/ui/Skeleton';
import { Alert } from '@/components/ui/Alert';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function EditListPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params.id as string;

  const { list, isLoading, error, updateList } = useUserList(listId);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="error">
          <AlertCircle className="h-4 w-4" />
          <div className="text-sm font-medium">{error.message || 'Failed to load list'}</div>
        </Alert>
      </div>
    );
  }

  if (isLoading || !list) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!list.isEditable) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="error">
          <AlertCircle className="h-4 w-4" />
          <div className="text-sm font-medium">You don't have permission to edit this list.</div>
        </Alert>
      </div>
    );
  }

  const handleSave = async (updatedData: any) => {
    try {
      await updateList(updatedData);
      router.push(`/lists/${listId}`);
    } catch (error) {
      console.error('Failed to update list:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={`/lists/${listId}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit List</h1>
        <p className="text-gray-600 mt-2">Update your list's information and settings</p>
      </div>

      <EditListForm list={list} onSave={handleSave} />
    </div>
  );
}

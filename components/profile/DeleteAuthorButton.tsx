'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useDeleteAuthor } from '@/hooks/useAuthor';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/modals/ConfirmModal';

interface DeleteAuthorButtonProps {
  authorId: number;
  authorName: string;
}

export function DeleteAuthorButton({ authorId, authorName }: Readonly<DeleteAuthorButtonProps>) {
  const router = useRouter();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [{ isLoading }, deleteAuthor] = useDeleteAuthor();

  const handleDelete = async () => {
    try {
      await deleteAuthor(authorId);
      toast.success('Author has been deleted');
      router.replace('/');
    } catch {
      toast.error('Failed to delete author');
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        size="sm"
        className="text-red-600 border-red-200 hover:text-red-700 hover:bg-red-50"
        onClick={() => setIsConfirmOpen(true)}
        disabled={isLoading}
      >
        <Trash2 className="w-4 h-4 mr-1.5" />
        {isLoading ? 'Deleting...' : 'Delete author'}
      </Button>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete author"
        message={`Are you sure you want to delete ${authorName}? Their profile will be hidden and any linked user account will be deactivated. Related records will be preserved.`}
        confirmText="Delete author"
      />
    </>
  );
}

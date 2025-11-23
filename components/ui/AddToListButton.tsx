'use client';

import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { AddToListModal } from '@/components/modals/AddToListModal';
import { Button } from '@/components/ui/Button';

interface AddToListButtonProps {
  readonly unifiedDocumentId: number;
  readonly variant?: 'default' | 'outlined' | 'ghost';
  readonly size?: 'sm' | 'md' | 'lg';
  readonly className?: string;
}

export function AddToListButton({
  unifiedDocumentId,
  variant = 'outlined',
  size = 'sm',
  className,
}: AddToListButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant={variant}
        size={size}
        className={className}
      >
        <Bookmark className="w-4 h-4 mr-2" />
        Add to List
      </Button>
      <AddToListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        unifiedDocumentId={unifiedDocumentId}
      />
    </>
  );
}

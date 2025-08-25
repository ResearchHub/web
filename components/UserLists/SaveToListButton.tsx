'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { SaveToListModal } from './SaveToListModal';
import { List } from 'lucide-react';
import { ID } from '@/types/root';

interface SaveToListButtonProps {
  documentId: ID;
  documentType: 'paper' | 'post' | 'note';
  documentTitle?: string;
  variant?: 'default' | 'outlined' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export const SaveToListButton = ({
  documentId,
  documentType,
  documentTitle,
  variant = 'outlined',
  size = 'sm',
  className,
  children,
}: SaveToListButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <Button onClick={handleClick} variant={variant} size={size} className={className}>
        <List className="h-4 w-4 mr-2" />
        {children || 'Save to List'}
      </Button>

      <SaveToListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        documentId={documentId}
        documentType={documentType}
        documentTitle={documentTitle}
      />
    </>
  );
};

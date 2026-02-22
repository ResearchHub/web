'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { CreateGrantModal } from './CreateGrantModal';

interface CreateGrantButtonProps {
  className?: string;
}

export function CreateGrantButton({ className }: Readonly<CreateGrantButtonProps>) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button variant="default" onClick={() => setIsModalOpen(true)} className={className}>
        <Plus className="w-4 h-4 mr-2" />
        Create Opportunity
      </Button>

      <CreateGrantModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

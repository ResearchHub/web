'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { GrantModal } from './GrantModal';

interface CreateGrantButtonProps {
  className?: string;
}

export function CreateGrantButton({ className }: CreateGrantButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button variant="default" onClick={() => setIsModalOpen(true)} className={className}>
        <Plus className="w-4 h-4 mr-2" />
        Create RFP
      </Button>

      <GrantModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

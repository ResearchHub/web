'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { RFPModal } from './RFPModal';

interface CreateRFPButtonProps {
  className?: string;
}

export function CreateRFPButton({ className }: CreateRFPButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button variant="default" onClick={() => setIsModalOpen(true)} className={className}>
        <Plus className="w-4 h-4 mr-2" />
        Create RFP
      </Button>

      <RFPModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

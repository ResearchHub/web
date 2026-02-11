'use client';

import { BountyForm } from '@/components/Bounty/BountyForm';
import { ModalContainer } from '@/components/ui/Modal/ModalContainer';
import { ModalHeader } from '@/components/ui/Modal/ModalHeader';

interface CreateBountyModalProps {
  isOpen: boolean;
  onClose: () => void;
  workId?: string;
}

export function CreateBountyModal({ isOpen, onClose, workId }: CreateBountyModalProps) {
  return (
    <ModalContainer isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <ModalHeader title="Create Bounty" onClose={onClose} />
        <BountyForm workId={workId} onSubmitSuccess={onClose} />
      </div>
    </ModalContainer>
  );
}

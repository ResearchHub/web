'use client';

import { ArrowUpFromLine } from 'lucide-react';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';
import { PostBlockEditor } from '@/components/work/PostBlockEditor';

interface GrantDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitProposal: () => void;
  content?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export const GrantDetailsModal: React.FC<GrantDetailsModalProps> = ({
  isOpen,
  onClose,
  onSubmitProposal,
  content,
  imageUrl,
  isActive = true,
}) => {
  const footerContent = isActive ? (
    <Button
      variant="default"
      size="lg"
      onClick={() => {
        onClose();
        onSubmitProposal();
      }}
      className="w-full gap-2"
    >
      Submit Proposal
      <ArrowUpFromLine className="w-5 h-5" />
    </Button>
  ) : null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-[600px]"
      padding="p-0"
      footer={footerContent}
      headerImage={imageUrl}
    >
      {content && (
        <div className="px-6 py-5">
          <div className="post-content">
            <PostBlockEditor
              content={content}
              className="!border-0 !shadow-none !rounded-none !p-0 !mb-0"
            />
          </div>
        </div>
      )}
    </BaseModal>
  );
};

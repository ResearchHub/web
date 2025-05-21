import { BaseModal } from '@/components/ui/BaseModal';
import AuthContent from '@/components/Auth/AuthContent';
import { Button } from '@/components/ui/Button';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialError?: string | null;
}

export default function AuthModal({ isOpen, onClose, onSuccess, initialError }: AuthModalProps) {
  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
      showCloseButton
      title="Welcome to ResearchHub 👋"
    >
      <AuthContent
        onClose={onClose}
        onSuccess={onSuccess}
        initialError={initialError}
        modalView={true}
      />
    </BaseModal>
  );
}

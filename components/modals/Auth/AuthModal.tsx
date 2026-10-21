import AuthContent from '@/components/Auth/AuthContent';
import { AuthTakeover } from '@/components/Auth/takeover/AuthTakeover';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialError?: string | null;
}

export default function AuthModal({ isOpen, onClose, onSuccess, initialError }: AuthModalProps) {
  if (!isOpen) return null;

  return (
    <AuthTakeover onClose={onClose}>
      <AuthContent
        onClose={onClose}
        onSuccess={onSuccess}
        initialError={initialError}
        modalView={true}
        // Return to the current URL after Google OAuth, preserving query params.
        callbackUrl={typeof window !== 'undefined' ? window.location.href : undefined}
      />
    </AuthTakeover>
  );
}

import { Button } from '@/components/ui/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/pro-light-svg-icons';
import AuthContent from '@/components/Auth/AuthContent';
import { CatalystAuthHeader } from '@/components/catalyst/CatalystAuthHeader';
import type { AuthModalVariant } from '@/contexts/AuthModalContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialError?: string | null;
  variant?: AuthModalVariant;
}

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  initialError,
  variant = 'default',
}: AuthModalProps) {
  if (!isOpen) return null;

  const isCatalyst = variant === 'catalyst';

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 !bg-black/50 flex items-center justify-center z-[60] p-4"
      onClick={handleBackgroundClick}
    >
      <div
        className={`bg-white rounded-lg w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto${
          isCatalyst ? ' ring-1 ring-[#7C3AED]/25' : ''
        }`}
      >
        <Button
          type="button"
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute top-6 right-6 z-10"
        >
          <FontAwesomeIcon icon={faXmark} className="h-5 w-5" />
        </Button>

        {isCatalyst && <CatalystAuthHeader />}

        <AuthContent
          onClose={onClose}
          onSuccess={onSuccess}
          initialError={initialError}
          modalView={true}
          showHeader={!isCatalyst}
        />
      </div>
    </div>
  );
}

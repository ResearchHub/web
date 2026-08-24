import { Button } from '@/components/ui/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/pro-light-svg-icons';
import AuthContent from '@/components/Auth/AuthContent';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialError?: string | null;
}

export default function AuthModal({ isOpen, onClose, onSuccess, initialError }: AuthModalProps) {
  if (!isOpen) return null;

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 !bg-black/50 flex items-center justify-center z-[60] p-0 md:!p-4"
      onClick={handleBackgroundClick}
    >
      <div className="bg-white w-full h-full overflow-y-auto relative md:!h-auto md:!max-h-[85vh] md:!max-w-md md:!rounded-lg">
        <Button
          type="button"
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 md:!top-6 md:!right-6"
        >
          <FontAwesomeIcon icon={faXmark} className="h-5 w-5" />
        </Button>

        <div className="p-6 pt-14 md:!pt-6">
          <AuthContent
            onClose={onClose}
            onSuccess={onSuccess}
            initialError={initialError}
            modalView={true}
            // Return to the current URL after Google OAuth, preserving query params.
            callbackUrl={typeof window !== 'undefined' ? window.location.href : undefined}
          />
        </div>
      </div>
    </div>
  );
}

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
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleBackgroundClick}
    >
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
        <Button
          type="button"
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute top-6 right-6 z-10"
        >
          <FontAwesomeIcon icon={faXmark} className="h-5 w-5" />
        </Button>

        <AuthContent
          onClose={onClose}
          onSuccess={onSuccess}
          initialError={initialError}
          modalView={true}
        />
      </div>
    </div>
  );
}

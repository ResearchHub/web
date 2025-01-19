import { X } from 'lucide-react';
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
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <AuthContent onClose={onClose} onSuccess={onSuccess} initialError={initialError} />
      </div>
    </div>
  );
}

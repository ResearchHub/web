'use client';

import AuthContent from '@/components/Auth/AuthContent';
import { Button } from '@/components/ui/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/pro-light-svg-icons';
import { CatalystAuthEntryNote, CatalystAuthEntryTitle } from './CatalystAuthEntryChrome';
import { CATALYST_NYC_EVENT } from './constants';
import { CatalystLockup } from './CatalystLockup';

const { auth } = CATALYST_NYC_EVENT;

interface CatalystAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CatalystAuthModal({ isOpen, onClose, onSuccess }: CatalystAuthModalProps) {
  if (!isOpen) {
    return null;
  }

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 !bg-black/50 flex items-center justify-center z-[60]"
      onClick={handleBackgroundClick}
    >
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative mx-4">
        <Button
          type="button"
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute top-6 right-6 z-10"
        >
          <FontAwesomeIcon icon={faXmark} className="h-5 w-5" />
        </Button>

        <div className="mb-6 pr-8">
          <CatalystLockup theme="onLight" />
        </div>

        <AuthContent
          onClose={onClose}
          onSuccess={onSuccess}
          showHeader={false}
          modalView
          callbackUrl="/"
          appearance="catalyst"
          catalystSurface="light"
          emailLabel={auth.emailLabel}
          entryTitle={<CatalystAuthEntryTitle surface="light" />}
          entryNote={<CatalystAuthEntryNote surface="light" />}
        />
      </div>
    </div>
  );
}

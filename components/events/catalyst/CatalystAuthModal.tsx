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

export function CatalystAuthModal({
  isOpen,
  onClose,
  onSuccess,
}: Readonly<CatalystAuthModalProps>) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[60]">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 h-full w-full !bg-black/50"
        onClick={onClose}
      />
      <dialog
        open
        aria-modal="true"
        className="relative z-[1] mx-4 my-0 w-full max-w-md rounded-lg border-0 bg-white p-6"
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
      </dialog>
    </div>
  );
}

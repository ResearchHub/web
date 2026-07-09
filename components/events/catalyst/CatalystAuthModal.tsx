'use client';

import { useEffect, useId, useRef } from 'react';
import AuthContent from '@/components/Auth/AuthContent';
import { Button } from '@/components/ui/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/pro-light-svg-icons';
import { CatalystAuthEntryNote, CatalystAuthEntryTitle } from './CatalystAuthEntryChrome';
import { CATALYST_NYC_EVENT } from './constants';
import { CatalystLockup } from './CatalystLockup';

const { auth, route } = CATALYST_NYC_EVENT;

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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return undefined;
    }

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }

    const handleClose = () => {
      onCloseRef.current();
    };

    dialog.addEventListener('close', handleClose);
    return () => {
      dialog.removeEventListener('close', handleClose);
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) {
      dialogRef.current?.close();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-[60] m-0 flex h-full max-h-none w-full max-w-none items-center justify-center border-0 bg-transparent p-4 open:flex"
      onClick={handleBackdropClick}
    >
      <div className="relative z-[1] w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <Button
          type="button"
          onClick={() => dialogRef.current?.close()}
          variant="ghost"
          size="icon"
          aria-label="Close"
          className="absolute top-6 right-6 z-10"
        >
          <FontAwesomeIcon icon={faXmark} className="h-5 w-5" aria-hidden="true" />
        </Button>

        <div id={titleId} className="mb-6 pr-8">
          <CatalystLockup theme="onLight" />
        </div>

        <AuthContent
          onClose={onClose}
          onSuccess={onSuccess}
          showHeader={false}
          modalView
          callbackUrl={route}
          appearance="catalyst"
          catalystSurface="light"
          emailLabel={auth.emailLabel}
          entryTitle={<CatalystAuthEntryTitle surface="light" />}
          entryNote={<CatalystAuthEntryNote surface="light" />}
        />
      </div>

      <style jsx>{`
        dialog::backdrop {
          background: rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </dialog>
  );
}

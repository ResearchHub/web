'use client';

import { useEffect, useState } from 'react';
import { Loader2, Unplug } from 'lucide-react';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';
import type { ConnectedApp } from '@/types/oauth';

interface RevokeConnectedAppModalProps {
  isOpen: boolean;
  app: ConnectedApp | null;
  onClose: () => void;
  onRevoke: (app: ConnectedApp) => Promise<void>;
}

export function RevokeConnectedAppModal({
  isOpen,
  app,
  onClose,
  onRevoke,
}: Readonly<RevokeConnectedAppModalProps>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleRevoke = async () => {
    if (!app) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await onRevoke(app);
      onClose();
    } catch {
      setError('Failed to revoke access. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <Unplug className="h-5 w-5" />
          Revoke access
        </span>
      }
      size="md"
      footer={
        <div className="flex gap-3">
          <Button type="button" variant="outlined" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isSubmitting}
            onClick={handleRevoke}
            className="flex-1"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Revoking...
              </span>
            ) : (
              'Revoke'
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-700">
          <span className="font-semibold text-gray-900">{app?.name}</span> will no longer be able to
          access your ResearchHub account. To use it again, you’ll need to connect it again.
        </p>
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      </div>
    </BaseModal>
  );
}

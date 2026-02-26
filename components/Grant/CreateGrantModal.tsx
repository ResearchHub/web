'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

import { BaseModal } from '@/components/ui/BaseModal';
import { AssistantSession } from '@/components/Assistant/AssistantSession';
import { AssistantService } from '@/services/assistant.service';

interface CreateGrantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateGrantModal({ isOpen, onClose }: Readonly<CreateGrantModalProps>) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSessionId(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setIsCreating(true);

    AssistantService.createSession({ role: 'funder' })
      .then(({ session_id }) => {
        if (!cancelled) setSessionId(session_id);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to start session. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setIsCreating(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const handleRetry = useCallback(() => {
    setError(null);
    setIsCreating(true);
    AssistantService.createSession({ role: 'funder' })
      .then(({ session_id }) => setSessionId(session_id))
      .catch(() => setError('Failed to start session. Please try again.'))
      .finally(() => setIsCreating(false));
  }, []);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Funding Opportunity"
      padding="p-0"
      maxWidth="max-w-3xl"
      className="!max-h-screen md:!max-h-[calc(100vh-2rem)] md:!rounded-2xl"
      contentClassName="!overflow-hidden"
    >
      <div className="h-full min-h-[60vh]">
        {isCreating && (
          <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <p className="text-sm text-gray-500">Starting assistant...</p>
          </div>
        )}

        {error && !isCreating && (
          <div className="flex flex-col items-center justify-center h-[60vh] gap-3 px-4">
            <p className="text-sm text-red-500">{error}</p>
            <button
              onClick={handleRetry}
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Try again
            </button>
          </div>
        )}

        {sessionId && !isCreating && !error && (
          <AssistantSession sessionId={sessionId} embedded />
        )}
      </div>
    </BaseModal>
  );
}

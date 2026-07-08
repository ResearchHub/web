'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { BaseModal } from '@/components/ui/BaseModal';
import { Progress } from '@/components/ui/Progress';

interface DemoSendEmailProgressModalProps {
  isOpen: boolean;
  recipients: string[];
  onComplete: (count: number) => void;
  onClose: () => void;
}

/**
 * Demo-only modal that simulates sending emails with the same look as the
 * real generation progress modal. Steps through each recipient on a timer,
 * then hands off to the parent to show the "sent" confirmation.
 */
const STEP_INTERVAL_MS = 650;
const COMPLETE_HANDOFF_MS = 500;

export function DemoSendEmailProgressModal({
  isOpen,
  recipients,
  onComplete,
  onClose,
}: DemoSendEmailProgressModalProps) {
  const [completed, setCompleted] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      started.current = false;
      setCompleted(0);
      return;
    }
    if (recipients.length === 0 || started.current) return;
    started.current = true;

    const id = setInterval(() => {
      setCompleted((c) => Math.min(recipients.length, c + 1));
    }, STEP_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isOpen, recipients.length]);

  useEffect(() => {
    if (!isOpen || recipients.length === 0 || completed < recipients.length) return;
    const id = window.setTimeout(() => onComplete(recipients.length), COMPLETE_HANDOFF_MS);
    return () => clearTimeout(id);
  }, [isOpen, completed, recipients.length, onComplete]);

  const total = recipients.length;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={total > 1 ? 'Sending emails' : 'Sending email'}
      size="lg"
      showCloseButton={false}
    >
      <p className="text-sm text-gray-600 mb-4">
        Please wait while your {total > 1 ? 'emails are' : 'email is'} being sent. Do not close this
        window.
      </p>

      <div className="mb-4">
        <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
          <span>Progress</span>
          <span>
            {completed}/{total}
          </span>
        </div>
        <Progress value={completed} max={total} size="md" />
      </div>

      <ul className="space-y-2 max-h-48 overflow-y-auto">
        {recipients.map((name, i) => {
          const status = i < completed ? 'done' : i === completed ? 'loading' : 'pending';
          return (
            <li
              key={`${name}-${i}`}
              className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
            >
              {status === 'done' && (
                <Check className="h-5 w-5 shrink-0 text-green-600" aria-hidden />
              )}
              {status === 'loading' && (
                <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary-600" aria-hidden />
              )}
              {status === 'pending' && (
                <span className="h-5 w-5 shrink-0 rounded-full border-2 border-gray-300" />
              )}
              <span className="flex-1 truncate">{name}</span>
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-gray-500 mt-4">Delivering your outreach…</p>
    </BaseModal>
  );
}

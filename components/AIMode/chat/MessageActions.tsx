'use client';

import { useEffect, useState } from 'react';
import { Check, Copy, Pencil, RefreshCw, ThumbsDown, ThumbsUp } from 'lucide-react';
import { cn } from '@/utils/styles';
import type { MessageFeedback } from '../lib/types';

const ICON_BUTTON =
  'flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-200/70 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-40';

interface ActionButtonProps {
  readonly label: string;
  readonly onClick: () => void;
  readonly disabled?: boolean;
  readonly active?: boolean;
  readonly children: React.ReactNode;
}

const ActionButton = ({ label, onClick, disabled, active, children }: ActionButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    title={label}
    className={cn(ICON_BUTTON, active && 'bg-gray-200/70 text-gray-900')}
  >
    {children}
  </button>
);

interface AssistantActionsProps {
  readonly text: string;
  readonly feedback?: MessageFeedback;
  readonly canRegenerate: boolean;
  readonly onRegenerate: () => void;
  readonly onFeedback: (feedback: MessageFeedback | null) => void;
}

/**
 * Hover actions under an assistant turn. Copy and thumbs are always there;
 * regenerate only on the latest turn, since re-running an earlier stage would
 * fork the transcript.
 */
export const AssistantActions = ({
  text,
  feedback,
  canRegenerate,
  onRegenerate,
  onFeedback,
}: AssistantActionsProps) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) return;
    const timer = setTimeout(() => setIsCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [isCopied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
    } catch {
      // Clipboard access can be refused; there is nothing useful to show.
    }
  };

  return (
    <div className="flex items-center gap-0.5">
      <ActionButton label={isCopied ? 'Copied' : 'Copy'} onClick={copy}>
        {isCopied ? (
          <Check className="h-3.5 w-3.5 text-emerald-600" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </ActionButton>
      {canRegenerate && (
        <ActionButton label="Regenerate" onClick={onRegenerate}>
          <RefreshCw className="h-3.5 w-3.5" />
        </ActionButton>
      )}
      <ActionButton
        label="Good response"
        active={feedback === 'up'}
        onClick={() => onFeedback(feedback === 'up' ? null : 'up')}
      >
        <ThumbsUp className="h-3.5 w-3.5" />
      </ActionButton>
      <ActionButton
        label="Poor response"
        active={feedback === 'down'}
        onClick={() => onFeedback(feedback === 'down' ? null : 'down')}
      >
        <ThumbsDown className="h-3.5 w-3.5" />
      </ActionButton>
    </div>
  );
};

interface UserActionsProps {
  readonly text: string;
  readonly disabled: boolean;
  readonly onEdit: () => void;
}

/** Hover actions beside a user turn: copy, and edit-and-resend. */
export const UserActions = ({ text, disabled, onEdit }: UserActionsProps) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) return;
    const timer = setTimeout(() => setIsCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [isCopied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
    } catch {
      // See above.
    }
  };

  return (
    <div className="flex items-center gap-0.5">
      <ActionButton label="Edit and resend" onClick={onEdit} disabled={disabled}>
        <Pencil className="h-3.5 w-3.5" />
      </ActionButton>
      <ActionButton label={isCopied ? 'Copied' : 'Copy'} onClick={copy}>
        {isCopied ? (
          <Check className="h-3.5 w-3.5 text-emerald-600" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </ActionButton>
    </div>
  );
};

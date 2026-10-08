'use client';

interface RefusalActionsProps {
  /** Puts the refused message back in the composer to reword; absent when it is not known. */
  readonly onEditMessage?: () => void;
  /** Opens a new chat, without the refused exchange in its context. */
  readonly onNewChat: () => void;
}

/**
 * Under a refusal: the model declined because of what was asked, so asking
 * the same thing again fails the same way. What helps is rewording it, or
 * starting over in a chat that does not carry the refused exchange.
 */
export function RefusalActions({ onEditMessage, onNewChat }: RefusalActionsProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-red-700/90">Try rewording your message, or start a new chat.</p>
      <div className="flex flex-wrap gap-2">
        {onEditMessage && <ActionButton onClick={onEditMessage}>Edit message</ActionButton>}
        <ActionButton onClick={onNewChat}>New chat</ActionButton>
      </div>
    </div>
  );
}

function ActionButton({
  onClick,
  children,
}: {
  readonly onClick: () => void;
  readonly children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-7 rounded-md border border-red-200 bg-white px-2.5 text-xs font-medium text-gray-800 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
    >
      {children}
    </button>
  );
}

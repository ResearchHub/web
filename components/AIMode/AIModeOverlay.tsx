'use client';

import { useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';
import { useAIMode } from './AIModeContext';
import { AI_MODE_NAME } from './copy';

/**
 * A modal that portals outside the overlay (BaseModal, a drawer) is showing.
 * Closed drawers stay mounted off-screen with `role="dialog"`, so presence in
 * the DOM is not enough — the box has to intersect the viewport.
 */
function isForeignDialogOpen(): boolean {
  const overlay = document.getElementById('ai-mode-overlay');
  return Array.from(document.querySelectorAll('[role="dialog"]')).some((el) => {
    if (overlay?.contains(el)) return false;
    const rect = el.getBoundingClientRect();
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      rect.bottom > 0 &&
      rect.right > 0 &&
      rect.top < window.innerHeight &&
      rect.left < window.innerWidth
    );
  });
}

/**
 * The full-viewport shell: header, conversation list, chat, document. Sits
 * below BaseModal (9999) and Tooltip (10000) so real modals and tooltips
 * opened from inside it still render on top.
 */
export function AIModeOverlay() {
  const { close } = useAIMode();

  // Esc closes, unless something inside already claimed it (a menu, a modal
  // that portals outside the overlay).
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      if (isForeignDialogOpen()) return;
      close();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [close]);

  // Lock the page behind the overlay.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <div
      id="ai-mode-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={AI_MODE_NAME}
      className="fixed inset-0 z-[9500] flex flex-col bg-gray-50"
    >
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary-600" aria-hidden="true" />
          <span className="text-sm font-semibold tracking-tight text-gray-900">{AI_MODE_NAME}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-gray-400 tablet:!inline">Esc to close</span>
          <button
            type="button"
            onClick={close}
            aria-label={`Close ${AI_MODE_NAME}`}
            className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        <aside className="hidden w-[264px] shrink-0 flex-col border-r border-gray-200 bg-white tablet:!flex">
          <PanePlaceholder label="Conversations" />
        </aside>
        <main className="flex min-w-0 flex-1 flex-col">
          <PanePlaceholder label="Chat" />
        </main>
        <aside className="hidden w-[42%] min-w-[380px] max-w-[640px] shrink-0 flex-col border-l border-gray-200 bg-white tablet:!flex">
          <PanePlaceholder label="Document" />
        </aside>
      </div>
    </div>
  );
}

function PanePlaceholder({ label }: { readonly label: string }) {
  return (
    <div className="flex h-full items-center justify-center text-sm text-gray-400">{label}</div>
  );
}

'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { RotateCcw, Sparkles, X } from 'lucide-react';
import { useAIMode } from './lib/AIModeContext';
import { ChatPanel } from './panels/ChatPanel';
import { DemoControls } from './DemoControls';
import { ConversationSidebar } from './panels/ConversationSidebar';
import { DocumentPanel } from './panels/DocumentPanel';

/**
 * A light neutral gray, flat on purpose. Everything the transcript embeds — real
 * proposal cards, the payment widget, the RFP document — is designed for a light
 * ResearchHub page, so the overlay gives them the surface they expect.
 */
const SURFACE_BACKGROUND = 'linear-gradient(180deg, #f8f9fa 0%, #f1f2f4 100%)';

export const AIModeOverlay = () => {
  const { activeConversation, activeGrant, actions } = useAIMode();
  const pathname = usePathname();

  // The overlay never navigates itself, so a pathname change means the funder
  // followed a link out of the transcript. Close, but keep the conversation.
  const openedAtPathRef = useRef(pathname);
  useEffect(() => {
    if (pathname !== openedAtPathRef.current) {
      actions.close();
    }
  }, [pathname, actions]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // A control inside the overlay that consumed Escape (the composer's
      // command menu, a modal) has first claim on it.
      if (event.key === 'Escape' && !event.defaultPrevented) {
        actions.close();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [actions]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // The panel needs both a request to be open and a program to show.
  const isPanelOpen = !!activeConversation?.panel.open && !!activeGrant;

  return (
    // Below BaseModal (9999) and Tooltip (10000) so real ResearchHub modals and
    // tooltips opened from inside the overlay still render on top.
    <div
      className="fixed inset-0 z-[9500] flex flex-col"
      style={{ background: SURFACE_BACKGROUND }}
    >
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-gray-200 px-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary-600" />
          <span className="text-sm font-semibold tracking-tight text-gray-900">AI Mode</span>
          <span className="rounded-full border border-gray-300 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gray-500">
            Prototype
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Lives in the header rather than the sidebar so the operator can
              always reach it, even with the document panel open. */}
          <button
            type="button"
            onClick={actions.resetDemo}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden tablet:!inline">Reset demo</span>
          </button>
          <span className="hidden text-xs text-gray-400 tablet:!inline">Esc to close</span>
          <button
            type="button"
            onClick={actions.close}
            aria-label="Close AI Mode"
            className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        <div className="hidden tablet:!block">
          <ConversationSidebar />
        </div>

        <ChatPanel />

        <AnimatePresence initial={false}>
          {isPanelOpen && activeGrant && activeConversation && (
            <motion.div
              key="document-panel"
              initial={{ x: 32, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 32, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="hidden w-[42%] min-w-[380px] max-w-[640px] tablet:!block"
            >
              <DocumentPanel
                grant={activeGrant}
                tab={activeConversation.panel.tab}
                onTabChange={(tab) => actions.setPanel(true, tab)}
                onClose={() => actions.setPanel(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="hidden tablet:!block">
          <DemoControls />
        </div>
      </div>
    </div>
  );
};

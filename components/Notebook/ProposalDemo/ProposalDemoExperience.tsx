'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Rocket } from 'lucide-react';
import { cn } from '@/utils/styles';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { useNotebookContext } from '@/contexts/NotebookContext';
import { ChatPanel, type ChatPhase } from './ChatPanel';
import { ProposalDemoDocumentPane } from './ProposalDemoDocumentPane';
import { proposalDemoSessionKey } from './useProposalDemoMode';

interface ProposalDemoExperienceProps {
  /** Leave the demo and return to the regular notebook editor. */
  onExit: () => void;
}

/**
 * Full-screen, conversation-first shell for the proposal demo (replaces the
 * shared PageLayout chrome entirely). Starts as a centered chat where the AI
 * "researches" the user and drafts the proposal; once the draft is ready the
 * document pane slides in from the right, Claude-artifacts style.
 */
export function ProposalDemoExperience({ onExit }: ProposalDemoExperienceProps) {
  const { activeNoteId } = useNotebookContext();
  const introSeenKey = activeNoteId ? `${proposalDemoSessionKey(activeNoteId)}-intro` : null;

  // Whether the intro choreography already played this session — on reload we
  // skip straight to the split view with the conversation restored.
  const [skipIntro] = useState(
    () =>
      typeof window !== 'undefined' &&
      introSeenKey !== null &&
      window.sessionStorage.getItem(introSeenKey) === 'true'
  );

  const [phase, setPhase] = useState<ChatPhase>(skipIntro ? 'split' : 'intro');
  // Drives the document pane's slide-in transition (two-frame mount trick).
  const [docVisible, setDocVisible] = useState(skipIntro);
  // Below lg the panes don't fit side by side; a header toggle switches views.
  const [mobileView, setMobileView] = useState<'chat' | 'doc'>('chat');
  const autoOpenTimer = useRef<number | null>(null);

  const openDocument = useCallback(() => {
    if (introSeenKey) window.sessionStorage.setItem(introSeenKey, 'true');
    setPhase('split');
  }, [introSeenKey]);

  // Once the artifact card appears in chat, give the user a beat to read it,
  // then slide the document open automatically.
  const handleDraftReady = useCallback(() => {
    autoOpenTimer.current = window.setTimeout(openDocument, 1400);
  }, [openDocument]);

  const handleOpenDocument = useCallback(() => {
    if (autoOpenTimer.current !== null) window.clearTimeout(autoOpenTimer.current);
    openDocument();
    setMobileView('doc');
  }, [openDocument]);

  useEffect(
    () => () => {
      if (autoOpenTimer.current !== null) window.clearTimeout(autoOpenTimer.current);
    },
    []
  );

  // The pane mounts collapsed (flex-grow 0), then expands a frame later so the
  // CSS transition actually runs.
  useEffect(() => {
    if (phase !== 'split' || docVisible) return;
    const t = window.setTimeout(() => setDocVisible(true), 60);
    return () => window.clearTimeout(t);
  }, [phase, docVisible]);

  const isSplit = phase === 'split';

  return (
    <div className="flex h-screen flex-col bg-white">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 px-4">
        <div className="flex items-center gap-3">
          <Logo size={24} />
        </div>
        <div className="flex items-center gap-2">
          {isSplit && (
            <div className="flex rounded-lg border border-gray-200 p-0.5 lg:hidden">
              {(['chat', 'doc'] as const).map((view) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => setMobileView(view)}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                    mobileView === view
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  {view === 'chat' ? 'Chat' : 'Document'}
                </button>
              ))}
            </div>
          )}
          <Button variant="default" size="sm" onClick={onExit} className="gap-1.5">
            <Rocket className="h-3.5 w-3.5" />
            Publish
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Chat region — fills the screen (centered column) during the intro,
            then compresses into the left rail as the document pane grows. */}
        <div
          className={cn(
            'min-w-0 flex-1 flex-col transition-all duration-700 ease-in-out',
            isSplit && 'lg:border-r lg:border-gray-200',
            isSplit && mobileView === 'doc' ? 'hidden lg:flex' : 'flex'
          )}
        >
          <div className="mx-auto flex h-full min-h-0 w-full max-w-3xl flex-col">
            <ChatPanel
              phase={phase}
              skipIntro={skipIntro}
              onDraftReady={handleDraftReady}
              onOpenDocument={handleOpenDocument}
            />
          </div>
        </div>

        {/* Document pane — slides open from the right edge via an animated
            flex-grow, pushing the chat into its rail. */}
        {isSplit && (
          <div
            className={cn(
              'min-w-0 overflow-hidden transition-all duration-700 ease-in-out',
              docVisible ? 'flex-[1.6] opacity-100' : 'flex-[0] opacity-0',
              mobileView === 'chat' ? 'hidden lg:block' : 'block'
            )}
          >
            <ProposalDemoDocumentPane />
          </div>
        )}
      </div>
    </div>
  );
}

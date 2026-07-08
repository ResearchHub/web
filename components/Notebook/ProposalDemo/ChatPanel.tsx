'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Check, FileText, Loader2, X } from 'lucide-react';
import { cn } from '@/utils/styles';
import { PROPOSAL_DEMO_TITLE } from '@/components/Editor/lib/data/proposalDemoContent';
import { useNotebookContext } from '@/contexts/NotebookContext';
import { ConnectorsCard } from './ConnectorsCard';
import { acceptAllEdits, applyDocEdits, rejectAllEdits } from './suggestedEdits';
import {
  ARTIFACT_CARD,
  CANNED_REPLIES,
  ChatMessage,
  DOC_COMMANDS,
  INTRO_TOOL_STEPS,
  SEED_MESSAGES,
  SUGGESTION_CHIPS,
} from './mockData';

// Matches a user message against the scripted document commands. A command
// fires when the message contains any of its trigger phrases.
function matchDocCommand(text: string) {
  const normalized = text.toLowerCase();
  return DOC_COMMANDS.find((cmd) => cmd.triggers.some((t) => normalized.includes(t)));
}

// Temporarily hide the in-chat document artifact card. The document pane still
// opens automatically after the intro; flip back to `true` to restore the card.
const SHOW_ARTIFACT_CARD = false;

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}

/** Scripted "tool call" list the AI runs through during the intro. */
function ToolSteps({ started, done }: { started: number; done: number }) {
  if (started === 0) return null;
  return (
    <div className="space-y-2.5 rounded-xl border border-gray-200 px-3.5 py-3 animate-fadeIn">
      {INTRO_TOOL_STEPS.slice(0, started).map((step, i) => {
        const isDone = i < done;
        return (
          <div key={step.id} className="flex items-center gap-2 text-[13px] animate-fadeIn">
            {isDone ? (
              <Check className="h-3.5 w-3.5 shrink-0 text-green-600" />
            ) : (
              <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-primary-500" />
            )}
            <span className={isDone ? 'text-gray-500' : 'font-medium text-gray-800'}>
              {isDone ? step.doneLabel : step.runningLabel}
            </span>
            {isDone && step.detail && (
              <span className="font-mono text-[11px] text-gray-400">{step.detail}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Claude-artifact-style card representing the generated document. */
function ArtifactCard({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 text-left shadow-sm transition-all animate-fadeIn hover:border-primary-300 hover:shadow-md"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
        <FileText className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-gray-900">
          {PROPOSAL_DEMO_TITLE}
        </span>
        <span className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
          {ARTIFACT_CARD.kind}
          <span className="h-0.5 w-0.5 rounded-full bg-gray-400" />
          <span className="font-medium text-green-600">{ARTIFACT_CARD.status}</span>
        </span>
      </span>
    </button>
  );
}

/** Bulk accept/reject control attached to the assistant message that applied
 * document suggestions. Lets the user resolve the whole batch in one click
 * (per-change control lives in the document's right margin). */
function SuggestionActions({
  status,
  onAccept,
  onReject,
}: {
  status: 'pending' | 'accepted' | 'rejected';
  onAccept: () => void;
  onReject: () => void;
}) {
  if (status !== 'pending') {
    const accepted = status === 'accepted';
    return (
      <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-gray-500 animate-fadeIn">
        {accepted ? (
          <Check className="h-3.5 w-3.5 text-green-600" />
        ) : (
          <X className="h-3.5 w-3.5 text-gray-400" />
        )}
        {accepted ? 'All changes accepted' : 'All changes discarded'}
      </div>
    );
  }

  return (
    <div className="mt-2.5 flex items-center gap-2 animate-fadeIn">
      <button
        type="button"
        onClick={onAccept}
        className="flex h-8 items-center gap-1.5 rounded-lg bg-green-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-green-700"
      >
        <Check className="h-4 w-4" />
        Accept all
      </button>
      <button
        type="button"
        onClick={onReject}
        className="flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
      >
        <X className="h-4 w-4" />
        Reject all
      </button>
    </div>
  );
}

export type ChatPhase = 'intro' | 'split';

interface ChatPanelProps {
  /** Layout phase — `intro` is the full-screen conversation, `split` has the doc open. */
  phase: ChatPhase;
  /** True when the intro choreography already played this session (e.g. reload). */
  skipIntro: boolean;
  /** Fired once the draft artifact card has appeared (intro finished). */
  onDraftReady: () => void;
  /** Fired when the user clicks the artifact card. */
  onOpenDocument: () => void;
}

export function ChatPanel({ phase, skipIntro, onDraftReady, onOpenDocument }: ChatPanelProps) {
  const { editor } = useNotebookContext();

  const [messages, setMessages] = useState<ChatMessage[]>(() => (skipIntro ? SEED_MESSAGES : []));
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showChips, setShowChips] = useState(skipIntro);
  const [stepsStarted, setStepsStarted] = useState(skipIntro ? INTRO_TOOL_STEPS.length : 0);
  const [stepsDone, setStepsDone] = useState(skipIntro ? INTRO_TOOL_STEPS.length : 0);
  const [artifactVisible, setArtifactVisible] = useState(skipIntro);
  // Composer is locked while a scripted sequence (intro / reply) is playing.
  const [isBusy, setIsBusy] = useState(!skipIntro);
  // The assistant message that carries pending document suggestions, plus
  // whether the user has resolved the batch from the chat's accept/reject-all.
  const [suggestionMsg, setSuggestionMsg] = useState<{
    id: string;
    status: 'pending' | 'accepted' | 'rejected';
  } | null>(null);

  const replyIndex = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const introStarted = useRef(false);
  const prevPhase = useRef(phase);

  // Keep callbacks and the editor out of effect deps so the scripted
  // timelines never restart.
  const onDraftReadyRef = useRef(onDraftReady);
  onDraftReadyRef.current = onDraftReady;
  const editorRef = useRef(editor);
  editorRef.current = editor;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping, stepsStarted, stepsDone, artifactVisible, showChips]);

  const streamReply = (text: string, onDone?: () => void, msgId?: string) => {
    const words = text.split(' ');
    const id = msgId ?? `assistant-${Date.now()}`;
    setMessages((prev) => [...prev, { id, role: 'assistant', content: '' }]);
    let i = 0;
    const tick = () => {
      i += 1;
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, content: words.slice(0, i).join(' ') } : m))
      );
      if (i < words.length) {
        window.setTimeout(tick, 32);
      } else {
        onDone?.();
      }
    };
    tick();
  };

  // Intro choreography: tool steps run one by one, then the greeting streams
  // in, then the artifact card appears and we tell the parent the draft is
  // ready (which opens the document pane).
  useEffect(() => {
    if (skipIntro || introStarted.current) return;
    introStarted.current = true;

    const timers: number[] = [];
    const schedule = (fn: () => void, delay: number) => timers.push(window.setTimeout(fn, delay));

    let t = 600;
    INTRO_TOOL_STEPS.forEach((_, i) => {
      schedule(() => setStepsStarted(i + 1), t);
      t += 1300;
      schedule(() => setStepsDone(i + 1), t);
    });

    t += 350;
    schedule(() => setIsTyping(true), t);
    t += 900;
    schedule(() => {
      setIsTyping(false);
      streamReply(SEED_MESSAGES[0].content, () => {
        setArtifactVisible(true);
        onDraftReadyRef.current();
      });
    }, t);

    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [skipIntro]);

  // When the document pane opens (intro → split), let the slide-in land, then
  // stream the follow-up message and reveal the suggestion chips.
  useEffect(() => {
    if (prevPhase.current === phase) return;
    prevPhase.current = phase;
    if (phase !== 'split' || skipIntro) return;

    const t1 = window.setTimeout(() => setIsTyping(true), 1000);
    const t2 = window.setTimeout(() => {
      setIsTyping(false);
      streamReply(SEED_MESSAGES[1].content, () => {
        setShowChips(true);
        setIsBusy(false);
      });
    }, 1800);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [phase, skipIntro]);

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text || isBusy) return;
    setIsBusy(true);
    setShowChips(false);
    setInput('');
    setMessages((prev) => [...prev, { id: `user-${Date.now()}`, role: 'user', content: text }]);
    setIsTyping(true);

    const command = matchDocCommand(text);

    window.setTimeout(() => {
      setIsTyping(false);

      // A matching command drives a specific, scripted set of green insertions
      // in the document (Google Docs suggesting-mode style) and streams its own
      // reply. Non-matching messages reply in chat only and leave the doc alone.
      if (command && editorRef.current) {
        const msgId = `assistant-${Date.now()}`;
        void applyDocEdits(editorRef.current, command.edits);
        streamReply(
          command.reply,
          () => {
            setIsBusy(false);
            setSuggestionMsg({ id: msgId, status: 'pending' });
          },
          msgId
        );
        return;
      }

      const reply = CANNED_REPLIES[replyIndex.current % CANNED_REPLIES.length];
      replyIndex.current += 1;
      streamReply(reply, () => setIsBusy(false));
    }, 900);
  };

  const isIntro = phase === 'intro';

  return (
    <div data-tour="proposal-demo-chat" className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4 lg:px-6">
        {/* Hero header at the top of the stream — prominent while the intro is
            playing, scrolls away naturally once conversation gets going. */}
        <div
          className={cn(
            'flex flex-col items-center gap-1 text-center',
            isIntro ? 'pb-6 pt-14' : 'pb-1 pt-2'
          )}
        >
          <div className="flex items-center gap-1.5">
            <span className={cn('font-semibold text-gray-900', isIntro ? 'text-2xl' : 'text-sm')}>
              ResearchHub AI
            </span>
            <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-700">
              Preview
            </span>
          </div>
          {isIntro && (
            <div className="text-sm text-gray-500">
              Preparing a proposal draft from your research profile
            </div>
          )}
        </div>

        <ToolSteps started={stepsStarted} done={stepsDone} />

        {messages.map((m) =>
          m.role === 'assistant' ? (
            <div key={m.id} className="text-[15px] leading-7 text-gray-800">
              {m.content}
              {suggestionMsg?.id === m.id && (
                <SuggestionActions
                  status={suggestionMsg.status}
                  onAccept={() => {
                    if (editorRef.current) acceptAllEdits(editorRef.current);
                    setSuggestionMsg((s) => (s ? { ...s, status: 'accepted' } : s));
                  }}
                  onReject={() => {
                    if (editorRef.current) rejectAllEdits(editorRef.current);
                    setSuggestionMsg((s) => (s ? { ...s, status: 'rejected' } : s));
                  }}
                />
              )}
            </div>
          ) : (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-gray-100 px-3.5 py-2 text-sm leading-relaxed text-gray-900">
                {m.content}
              </div>
            </div>
          )
        )}

        {SHOW_ARTIFACT_CARD && artifactVisible && <ArtifactCard onOpen={onOpenDocument} />}

        {isTyping && <TypingIndicator />}

        {showChips && (
          <div className="animate-fadeIn">
            <div className="mb-2 text-sm font-semibold text-gray-900">Would you like me to?</div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTION_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => send(chip)}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-3 lg:px-6 lg:pb-5">
        <div
          className={cn(
            'rounded-xl border bg-white px-3 py-2 transition-colors',
            isBusy ? 'border-gray-200' : 'border-gray-300 focus-within:border-primary-400'
          )}
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <ConnectorsCard />
          </div>
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              disabled={isBusy && messages.length === 0}
              placeholder={
                isBusy && messages.length === 0
                  ? 'Drafting your proposal…'
                  : 'Ask ResearchHub AI to revise your proposal…'
              }
              className="max-h-32 flex-1 resize-none bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={() => send(input)}
              disabled={!input.trim() || isBusy}
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors',
                input.trim() && !isBusy
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-100 text-gray-400'
              )}
              aria-label="Send message"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ArtifactModal } from '@/components/modals/ArtifactModal';
import { useArtifact } from '@/hooks/useArtifact';
import type {
  AgentChat,
  ChatArtifactRef,
  ChatExecution,
  ChatToolDraftActivity,
} from '@/types/agentChat';

/** What the viewer shows: a saved version, or an artifact the agent is still writing. */
type ViewerTarget =
  | { type: 'saved'; id: number; version: number }
  | { type: 'draft'; executionId: number; itemId: string };

interface ArtifactViewerContextValue {
  openArtifact: (artifact: ChatArtifactRef) => void;
  openDraft: (executionId: number, itemId: string) => void;
}

const ArtifactViewerContext = createContext<ArtifactViewerContextValue | null>(null);

/** Opens artifacts in the chat's viewer; null outside one, where cards don't open. */
export function useArtifactViewer(): ArtifactViewerContextValue | null {
  return useContext(ArtifactViewerContext);
}

function findDraft(
  chat: AgentChat,
  executionId: number,
  itemId: string
): ChatToolDraftActivity | null {
  const stream = chat.executions.find((candidate) => candidate.id === executionId)?.stream;
  // The feed namespaces stream item ids with their stream's (see ExecutionProgress).
  const item = stream?.items.find((candidate) => `${stream.id}:${candidate.id}` === itemId);
  return item?.type === 'tool_draft' ? item : null;
}

/**
 * The artifact a finished draft became: the turn's newest one created under
 * the draft's title, else its newest one created at all. The draft and the
 * durable call it turns into share no id, and a turn rarely creates two.
 */
function savedFromDraft(
  execution: ChatExecution | undefined,
  title: string | undefined
): ChatArtifactRef | null {
  const created = (execution?.activity ?? []).flatMap((item) =>
    item.type === 'tool_call' && item.tool === 'create_artifact' && item.artifact
      ? [item.artifact]
      : []
  );
  return created.findLast((artifact) => artifact.title === title) ?? created.at(-1) ?? null;
}

interface ArtifactViewerProviderProps {
  readonly chat: AgentChat;
  readonly children: ReactNode;
}

/**
 * Hosts the artifact viewer for one chat transcript. A draft opened while the
 * agent writes it follows the stream, then becomes the saved artifact once the
 * turn's activity records it; until then it keeps showing what was streamed.
 */
export function ArtifactViewerProvider({ chat, children }: ArtifactViewerProviderProps) {
  const [target, setTarget] = useState<ViewerTarget | null>(null);
  const [lastDraft, setLastDraft] = useState<ChatToolDraftActivity | null>(null);

  const draft =
    target?.type === 'draft' ? findDraft(chat, target.executionId, target.itemId) : null;
  if (draft != null && draft !== lastDraft) setLastDraft(draft);
  const shownDraft = target?.type === 'draft' ? (draft ?? lastDraft) : null;

  // Hand a finished draft over to the version it saved.
  const draftExecutionId = target?.type === 'draft' ? target.executionId : null;
  const saved =
    target?.type === 'draft' && draft == null
      ? savedFromDraft(
          chat.executions.find((execution) => execution.id === draftExecutionId),
          lastDraft?.artifact?.title
        )
      : null;
  useEffect(() => {
    if (saved) setTarget({ type: 'saved', id: saved.id, version: saved.version });
  }, [saved?.id, saved?.version]); // eslint-disable-line react-hooks/exhaustive-deps

  const { artifact, error } = useArtifact(
    target?.type === 'saved' ? target.id : null,
    target?.type === 'saved' ? target.version : null
  );

  const value = useMemo<ArtifactViewerContextValue>(
    () => ({
      openArtifact: (ref) => setTarget({ type: 'saved', id: ref.id, version: ref.version }),
      openDraft: (executionId, itemId) => {
        setLastDraft(null);
        setTarget({ type: 'draft', executionId, itemId });
      },
    }),
    []
  );

  const close = () => setTarget(null);
  let modal: ReactNode = null;
  if (target?.type === 'draft' && shownDraft) {
    modal = (
      <ArtifactModal
        isOpen
        onClose={close}
        title={shownDraft.artifact?.title || 'Untitled artifact'}
        kind={shownDraft.artifact?.kind}
        language={shownDraft.artifact?.language}
        content={shownDraft.text}
        writing
      />
    );
  } else if (target?.type === 'saved') {
    modal = (
      <ArtifactModal
        isOpen
        onClose={close}
        title={artifact?.title ?? ''}
        kind={artifact?.kind}
        language={artifact?.language}
        content={artifact?.version.content ?? null}
        error={error ? 'This artifact could not be loaded.' : null}
        version={
          artifact
            ? {
                number: target.version,
                latest: artifact.latest_version,
                onSelect: (number) => setTarget({ ...target, version: number }),
              }
            : null
        }
      />
    );
  }

  return (
    <ArtifactViewerContext.Provider value={value}>
      {children}
      {modal}
    </ArtifactViewerContext.Provider>
  );
}

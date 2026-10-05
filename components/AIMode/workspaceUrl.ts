import type { FundingIntent } from '@/components/Funding/fundingDirection';

export const WORKSPACE_PATH = '/workspace';

/**
 * `chat=<id>` selects a conversation; `note=<id>` opens a document, with
 * `chat` then naming the chat on that document. `view=chat` puts that chat,
 * not the document, in the main pane (a conversation opened from the list);
 * absent, the document comes first. `new=rfp|proposal` is the
 * new-conversation screen for one side of the money.
 */
const CHAT_PARAM = 'chat';
const NOTE_PARAM = 'note';
const VIEW_PARAM = 'view';
const NEW_PARAM = 'new';

/** The overlay's params, from when the workspace opened over any page with `?ai=1`. */
const LEGACY_OPEN_PARAM = 'ai';
const LEGACY_CHAT_PARAM = 'aiChat';
const LEGACY_NOTE_PARAM = 'aiNote';
const LEGACY_VIEW_PARAM = 'aiView';

/** Which pane is the main one; the other sits at a fixed width beside it. */
export type WorkspaceLayout = 'chat' | 'document';

/**
 * What the workspace is open on: one of the user's conversations (null = the
 * new-conversation screen, which may say which side of the money it is for),
 * or a document with a chat scoped to it (null = a chat not yet started). A
 * document target remembers how it was reached: opened as a document it
 * comes first, opened as a conversation its chat does.
 */
export type WorkspaceTarget =
  | {
      readonly kind: 'conversation';
      readonly chatId: number | null;
      /** Only on the new-conversation screen: what the door it was opened through will draft. */
      readonly intent?: FundingIntent;
    }
  | {
      readonly kind: 'document';
      readonly noteId: number;
      readonly chatId: number | null;
      readonly layout: WorkspaceLayout;
    };

export const layoutFor = (target: WorkspaceTarget): WorkspaceLayout =>
  target.kind === 'document' ? target.layout : 'chat';

/** The new-conversation screen, for one side of the money or the one last used. */
export const newConversationTarget = (intent?: FundingIntent): WorkspaceTarget =>
  intent ? { kind: 'conversation', chatId: null, intent } : { kind: 'conversation', chatId: null };

/** A document with a fresh chat beside it. */
export const documentTarget = (noteId: number): WorkspaceTarget => ({
  kind: 'document',
  noteId,
  chatId: null,
  layout: 'document',
});

const INTENT_BY_PARAM: Record<string, FundingIntent> = { rfp: 'fund', proposal: 'need_funding' };
const PARAM_BY_INTENT: Record<FundingIntent, string> = { fund: 'rfp', need_funding: 'proposal' };

type Params = Pick<URLSearchParams, 'get'>;

function parseId(raw: string | null): number | null {
  if (raw == null) return null;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function targetFrom(
  chatId: number | null,
  noteId: number | null,
  view: string | null,
  intent?: FundingIntent
): WorkspaceTarget {
  if (noteId != null) {
    return { kind: 'document', noteId, chatId, layout: view === 'chat' ? 'chat' : 'document' };
  }
  if (chatId != null) return { kind: 'conversation', chatId };
  return newConversationTarget(intent);
}

export function readWorkspaceTarget(params: Params): WorkspaceTarget {
  return targetFrom(
    parseId(params.get(CHAT_PARAM)),
    parseId(params.get(NOTE_PARAM)),
    params.get(VIEW_PARAM),
    INTENT_BY_PARAM[params.get(NEW_PARAM) ?? '']
  );
}

export function workspaceHref(target: WorkspaceTarget): string {
  const params = new URLSearchParams();
  if (target.kind === 'document') {
    params.set(NOTE_PARAM, String(target.noteId));
    if (target.chatId != null) params.set(CHAT_PARAM, String(target.chatId));
    if (target.layout === 'chat') params.set(VIEW_PARAM, 'chat');
  } else if (target.chatId != null) {
    params.set(CHAT_PARAM, String(target.chatId));
  } else if (target.intent) {
    params.set(NEW_PARAM, PARAM_BY_INTENT[target.intent]);
  }
  const query = params.toString();
  return query ? `${WORKSPACE_PATH}?${query}` : WORKSPACE_PATH;
}

/** Where an overlay-era `?ai=1` link leads now; null for any other URL. */
export function legacyWorkspaceHref(params: Params): string | null {
  if (params.get(LEGACY_OPEN_PARAM) !== '1') return null;
  return workspaceHref(
    targetFrom(
      parseId(params.get(LEGACY_CHAT_PARAM)),
      parseId(params.get(LEGACY_NOTE_PARAM)),
      params.get(LEGACY_VIEW_PARAM)
    )
  );
}

export const sameTarget = (a: WorkspaceTarget, b: WorkspaceTarget): boolean =>
  workspaceHref(a) === workspaceHref(b);

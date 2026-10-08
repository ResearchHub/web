import type { FundingIntent } from '@/components/Funding/fundingDirection';

export const WORKSPACE_PATH = '/workspace';

/**
 * `note=<id>` opens a document, with `chat` naming the chat on it: an id, or
 * `new` for a chat not yet started; absent, its most recent chat.
 * `new=rfp|proposal` is the screen that starts a new draft for one side of
 * the money. Anything else is that screen too.
 */
const CHAT_PARAM = 'chat';
const NOTE_PARAM = 'note';
const NEW_PARAM = 'new';
const NEW_CHAT = 'new';

/**
 * Which chat a document is open on: one of its chats, its most recent one
 * (until its chats have loaded and say which that is), or a new one.
 */
export type DocumentChat = number | 'latest' | 'new';

/**
 * What the workspace is open on: the screen that starts a new draft (which
 * may say which side of the money it is for), or a document and one of its
 * chats. Every chat belongs to a document.
 */
export type WorkspaceTarget =
  | {
      readonly kind: 'new';
      /** What the door it was opened through will draft: an RFP or a proposal. */
      readonly intent?: FundingIntent;
    }
  | {
      readonly kind: 'document';
      readonly noteId: number;
      readonly chat: DocumentChat;
    };

/** The screen that starts a new draft, for one side of the money or the one last used. */
export const newDraftTarget = (intent?: FundingIntent): WorkspaceTarget =>
  intent ? { kind: 'new', intent } : { kind: 'new' };

/** A document, on its most recent chat unless another is named. */
export const documentTarget = (noteId: number, chat: DocumentChat = 'latest'): WorkspaceTarget => ({
  kind: 'document',
  noteId,
  chat,
});

const INTENT_BY_PARAM: Record<string, FundingIntent> = { rfp: 'fund', proposal: 'need_funding' };
const PARAM_BY_INTENT: Record<FundingIntent, string> = { fund: 'rfp', need_funding: 'proposal' };

type Params = Pick<URLSearchParams, 'get'>;

function parseId(raw: string | null): number | null {
  if (raw == null) return null;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function readWorkspaceTarget(params: Params): WorkspaceTarget {
  const noteId = parseId(params.get(NOTE_PARAM));
  if (noteId == null) return newDraftTarget(INTENT_BY_PARAM[params.get(NEW_PARAM) ?? '']);
  const chat = params.get(CHAT_PARAM);
  return documentTarget(noteId, chat === NEW_CHAT ? 'new' : (parseId(chat) ?? 'latest'));
}

export function workspaceHref(target: WorkspaceTarget): string {
  const params = new URLSearchParams();
  if (target.kind === 'document') {
    params.set(NOTE_PARAM, String(target.noteId));
    if (target.chat !== 'latest') params.set(CHAT_PARAM, String(target.chat));
  } else if (target.intent) {
    params.set(NEW_PARAM, PARAM_BY_INTENT[target.intent]);
  }
  const query = params.toString();
  return query ? `${WORKSPACE_PATH}?${query}` : WORKSPACE_PATH;
}

export const sameTarget = (a: WorkspaceTarget, b: WorkspaceTarget): boolean =>
  workspaceHref(a) === workspaceHref(b);

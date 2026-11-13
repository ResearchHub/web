import {
  HttpAgent,
  runHttpRequest,
  transformHttpEventStream,
  type BaseEvent,
  type RunAgentInput,
} from '@ag-ui/client';
import type { Observable } from 'rxjs';
import { ApiClient } from '@/services/client';
import { ApiError } from '@/services/types/api';
import type { AgentFile } from '@/types/agentFile';

/** Agent id the notebook chat registers with CopilotKit. */
export const NOTEBOOK_CHAT_AGENT_ID = 'notebook-chat';

interface PendingAcceptance {
  readonly resolve: () => void;
  readonly reject: (error: ApiError) => void;
}

/**
 * One notebook chat as an AG-UI agent, for CopilotKit.
 *
 * The backend speaks AG-UI over server-sent events at
 * `notebook/notes/<note>/chats/<chat>/agui/`: a run whose input ends with a new
 * user message starts a turn and follows it; `.../agui/connect/` loads the
 * chat's history and rejoins a turn that is already running. Turns run in a
 * worker, so closing a stream only stops watching — stopping a turn is the
 * REST cancel endpoint's job.
 *
 * The chat's own messages are the history the backend trusts; the transcript
 * this agent holds is only what it last streamed.
 */
export class NotebookChatAgent extends HttpAgent {
  private readonly connectUrl: string;
  private acceptance: PendingAcceptance | null = null;
  private loading: Promise<ApiError | null> | null = null;

  constructor(
    readonly noteId: string,
    readonly chatId: number
  ) {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/research_ai/notebook/notes/${noteId}/chats/${chatId}/agui/`;
    super({ url, threadId: String(chatId), agentId: NOTEBOOK_CHAT_AGENT_ID });
    this.connectUrl = `${url}connect/`;
  }

  /**
   * Load the chat's history, and follow its running turn if it has one. Safe
   * to call again: a load already in flight, or one that finished, is shared.
   *
   * Resolves with the error when the history never arrived. A run that fails
   * after its snapshot (a turn that errors) still loaded the chat.
   */
  load(): Promise<ApiError | null> {
    if (!this.loading) {
      // `runAgent` makes a fresh controller but `connectAgent` does not, and
      // `detach` aborted the last one.
      if (this.abortController.signal.aborted) this.abortController = new AbortController();
      let loaded = false;
      this.loading = this.connectAgent(undefined, {
        onMessagesSnapshotEvent: () => {
          loaded = true;
        },
      }).then(
        () => null,
        (error: unknown) => (loaded ? null : toApiError(error, 'The chat could not load.'))
      );
    }
    return this.loading;
  }

  /** Load the chat's history again, after a load that failed. */
  reload(): Promise<ApiError | null> {
    this.loading = null;
    return this.load();
  }

  /**
   * Send `text` as the next user message and follow the turn it starts.
   *
   * Resolves with the turn's execution id once the server has accepted it —
   * the run's `RUN_STARTED` carries it — and rejects with the server's
   * `ApiError` when it refused: a busy chat, a spent budget, an invalid
   * message. Refusals arrive before any event, with the REST API's bodies. A
   * refused message is taken back off the transcript.
   */
  async send(
    text: string,
    forwardedProps: Record<string, unknown>,
    attachments: AgentFile[] = []
  ): Promise<number | null> {
    // A history load still streaming would make this a second concurrent run.
    // Wait it out, including one that restarted meanwhile (a remount).
    // A run this agent is still following (an earlier send's turn) must end
    // first too.
    for (;;) {
      const loading = this.load();
      await loading;
      if (this.loading !== loading) continue;
      if (!this.isRunning) break;
      await this.runEnded();
    }
    const messageId = `client-${crypto.randomUUID()}`;
    // History messages carry their files the same way; the bubble reads them.
    this.addMessage({
      id: messageId,
      role: 'user',
      content: text,
      ...(attachments.length > 0 && { metadata: { attachments } }),
    });
    return new Promise<number | null>((resolve, reject) => {
      let settled = false;
      const fail = (error: ApiError) => {
        if (settled) return;
        settled = true;
        if (this.acceptance === acceptance) this.acceptance = null;
        this.setMessages(this.messages.filter((message) => message.id !== messageId));
        reject(error);
      };
      // The response being accepted only means the stream opened; `send`
      // settles on RUN_STARTED, or fails if the run ends or errors first.
      const acceptance: PendingAcceptance = { resolve: () => undefined, reject: fail };
      this.acceptance = acceptance;
      this.runAgent(
        { forwardedProps },
        {
          onRunStartedEvent: ({ event }) => {
            if (settled) return;
            settled = true;
            const executionId = (event.metadata as { execution_id?: unknown } | undefined)
              ?.execution_id;
            resolve(typeof executionId === 'number' ? executionId : null);
          },
        }
      ).then(
        () => fail(new ApiError('The run ended before the server accepted it.')),
        (error: unknown) => fail(toApiError(error, 'The run failed.'))
      );
    });
  }

  /**
   * Resolves when the run in progress ends, or after a short wait at most, so
   * a caller re-checks `isRunning` without spinning on it.
   */
  private runEnded(): Promise<void> {
    return new Promise((resolve) => {
      const done = () => {
        clearTimeout(timer);
        subscription.unsubscribe();
        // Let the run's own finalisation clear `isRunning` first.
        setTimeout(resolve, 0);
      };
      const timer = setTimeout(done, 250);
      const subscription = this.subscribe({ onRunFinalized: done, onRunFailed: done });
    });
  }

  /** Stop watching: close any open stream; the next `load` reconnects. */
  detach(): void {
    this.abortRun();
    this.loading = null;
  }

  override run(input: RunAgentInput): Observable<BaseEvent> {
    return this.stream(this.url, input);
  }

  protected override connect(input: RunAgentInput): Observable<BaseEvent> {
    return this.stream(this.connectUrl, input);
  }

  override clone(): NotebookChatAgent {
    const copy = new NotebookChatAgent(this.noteId, this.chatId);
    copy.headers = { ...this.headers };
    copy.setMessages(structuredClone(this.messages));
    copy.setState(structuredClone(this.state));
    return copy;
  }

  private stream(url: string, input: RunAgentInput): Observable<BaseEvent> {
    return transformHttpEventStream(runHttpRequest(() => this.open(url, input)));
  }

  private async open(url: string, input: RunAgentInput): Promise<Response> {
    const token = await ApiClient.resolveAuthToken();
    const init = this.requestInit(input);
    const headers = new Headers(init.headers);
    if (token) headers.set('Authorization', `Token ${token}`);
    let response: Response;
    try {
      response = await this.fetch(url, { ...init, headers });
    } catch (error) {
      this.settle(toApiError(error, 'Network error.'));
      throw error;
    }
    if (response.ok) {
      this.settle(null);
    } else {
      const body = (await response
        .clone()
        .json()
        .catch(() => undefined)) as Record<string, string[]> | undefined;
      const detail = (body as { detail?: unknown } | undefined)?.detail;
      this.settle(
        new ApiError(
          typeof detail === 'string' ? detail : `Request failed (${response.status}).`,
          response.status,
          body
        )
      );
    }
    return response;
  }

  private settle(error: ApiError | null): void {
    const acceptance = this.acceptance;
    this.acceptance = null;
    if (!acceptance) return;
    if (error) acceptance.reject(error);
    else acceptance.resolve();
  }
}

function toApiError(error: unknown, fallback: string): ApiError {
  if (error instanceof ApiError) return error;
  return new ApiError(error instanceof Error ? error.message : fallback);
}

const agents = new Map<string, NotebookChatAgent>();

/**
 * The chat's agent, shared by the transcript that shows it and the transport
 * that sends through it. Opening a chat again reuses it: `load` reconnects,
 * and the history snapshot replaces whatever it showed before.
 */
export function notebookChatAgent(noteId: string, chatId: number): NotebookChatAgent {
  const key = `${noteId}:${chatId}`;
  let agent = agents.get(key);
  if (!agent) {
    agent = new NotebookChatAgent(noteId, chatId);
    agents.set(key, agent);
  }
  return agent;
}

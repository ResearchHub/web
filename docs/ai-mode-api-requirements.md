# AI Mode (barebones) — feature summary and API audit brief

**Audience:** the agent auditing `researchhub-backend`.
**Goal:** decide what the API can already serve, and what is missing, for a first production build of
AI Mode.

**What this document is.** A frontend-side description of the feature and the data contract it
needs, plus a checklist of things to verify in the backend. It was written from a working
click-through prototype in the web app (`components/AIMode/`, branch `ai-demo`) in which every
backend interaction is mocked and the conversation is a hardcoded script. Nothing in the prototype
talks to a real API. The point of the audit is to replace that script with real endpoints.

---

## 1. The feature in one paragraph

AI Mode is a full-viewport overlay in the ResearchHub web app, opened from a top-bar icon, in which
a user works with an AI assistant to **author a document in conversation**. The layout is three
panes: **conversations on the left**, **chat in the middle**, and **the document the AI is composing
on the right**. The user describes what they want, the assistant asks clarifying questions, and then
starts writing a document that assembles section by section in the right pane while the assistant
narrates what it is doing in the middle. The document is a real, persisted artifact the user keeps
afterwards. In our demo the document is a request for proposals, but nothing about the three-pane
mechanic is specific to that.

**Explicitly out of scope for this iteration.** The prototype also contains a tabbed side panel with
a funding-policy document and an organization profile, a program timeline, payment, invited experts,
peer reviews, and fund allocation. **Ignore all of it.** Those are later iterations. Audit only the
three-pane core described here: conversations, chat, one AI-composed document.

---

## 2. What each pane needs

### 2.1 Left — conversation list

- The signed-in user's conversations, newest activity first.
- Per row: id, title, a one-line preview or status, a relative timestamp, and whether a turn is
  currently running (the row shows a spinner).
- Titles are auto-derived from the first message; the user can rename.
- Create a new conversation. Select one and load it.
- A row also shows a small badge for the state of its document (being written / finished), so the
  list needs to know which document belongs to which conversation.

### 2.2 Middle — chat

- Ordered messages, user and assistant.
- Sending a message starts an **asynchronous turn**. Only one turn per conversation at a time; a
  second send while one is running must be rejected in a way the client can show as "still working".
- While the turn runs the client shows, in order:
  1. a live status line ("Reading the case file", "Writing the claims section") that changes as the
     turn progresses;
  2. an **activity trace** — the steps the agent took, each with a human-readable label and an
     optional detail line, appearing one at a time. After the turn finishes the trace collapses to
     "Worked through N steps" and stays expandable forever, so it must be durable, not just live;
  3. the assistant's answer, streamed progressively rather than appearing at once.
- The user can **stop** a running turn. Stopping is idempotent.
- Errors surface as user-safe copy supplied by the server, rendered verbatim.
- The user can **regenerate** the last assistant turn, and **edit and resend** an earlier user
  message, which rewinds the conversation to that point.
- Per-message copy and thumbs-up/down feedback.
- The composer accepts **attachments**: a pasted URL or an uploaded file becomes context for the
  turn ("here is the case file, fund what decides it").
- Conversation state survives a full page reload and client-side navigation away and back.

### 2.3 Right — the document being composed

This is the pane the audit should look at hardest, because it is the least standard part.

- The panel is **closed at the start** of a conversation. It opens by itself the moment the
  assistant begins writing the document. The user can close it and reopen it.
- The document renders as a **document**, not as a chat message: title, headings, prose.
- It **assembles progressively**. In the prototype, sections that have not been written yet render
  as placeholders with a spinner on the one currently being written, so the user watches the
  document build rather than watching it appear finished. Whatever the real mechanism is, the client
  needs enough signal to show *some* honest in-progress state.
- The chat and the document stay in sync: the assistant says "the claims section is in" in the
  middle pane at roughly the moment that section lands on the right.
- A badge reflects progress (for example "4/7" while writing, then a finished state).
- The document persists and is addressable afterwards.

---

## 3. Frontend architecture as prototyped

For orientation, not as a constraint on the API.

- A single React context provider mounted globally holds `conversations` and the active
  conversation id; the overlay lazy-loads on first open. State currently persists to
  `localStorage` and would move to the server.
- A conversation holds ordered `messages`. An assistant message has a `status` of
  `thinking → streaming → complete`, an optional durable `activity` array, and its content as an
  ordered list of typed **blocks**. Today a block is either markdown text or a rich embedded widget.
  **For the barebones, assume markdown text only** — the rich blocks are demo scaffolding for
  features that are out of scope here.
- Text blocks type out character by character on a timer. In production this becomes real token
  streaming.
- The document is modelled separately from the conversation and referenced by id, because a document
  outlives the thread that created it and a second conversation may report on the same document. The
  client tracks which of the document's sections have been revealed so far.

---

## 4. What already exists in the backend (observed, needs confirming)

I read parts of `researchhub-backend@main` before writing this. The relevant app is
`src/research_ai`, and it is much closer to this feature than expected. **Verify all of the
following; I read selectively and may have missed constraints.**

**Two chat surfaces exist**, both in `src/research_ai/urls.py`:

- **Notebook chat**, scoped to a pre-existing note:
  `/api/research_ai/notebook/notes/<note_id>/chats/...`
- **Assistant chat**, note-independent and user-scoped:
  `/api/research_ai/assistant/chats/`, `/{conversation_id}/`, `/{conversation_id}/messages/`,
  `/{conversation_id}/cancel/`

The assistant surface is the right starting point for AI Mode: it is global rather than bound to a
document that must already exist. Its own docstring in
`src/research_ai/services/assistant_chat/service.py` describes it as "the notebook agent without a
routed note", and says the agent **may call `create_note`, which creates a private note in the
user's notebook and attaches it to the conversation**, with attached notes "reported on the chat
representation so a client can link to them". That is essentially the right-hand pane.

**Already present, and matching what the panes need:**

| Need | Appears to exist as |
| --- | --- |
| Conversation list with preview and busy flag | `list_conversations` → `id, title, created_date, updated_date, last_message_preview, has_active_turn` |
| Auto-named titles, rename | create with blank title; `PATCH` with `title` |
| Async turn, one at a time | `POST .../messages/` returns 202 with an `execution_id`; a busy conversation raises `AgentConversationBusyError` (409) |
| Live status line | `ExecutionPhase { state, label }` on the execution, described as render-verbatim |
| Durable activity trace | `activity[]` of `narration` / `thinking` / `tool_call` items, each tool call carrying a human `label`, a `status`, timings, an optional `detail`, and optional `sources` |
| Token streaming | WebSocket `stream_delta` events with sequenced deltas, plus a bounded server-side checkpoint for recovery after a dropped frame |
| Stop generation | `POST .../cancel/`, idempotent, returns `cancelled: false` when nothing is running |
| Errors as safe copy | `ChatExecutionError { code, message }` |
| Document creation and editing by the agent | `create_note`, `read_note`, `edit_note` tools in `src/research_ai/services/note_tools.py` |
| Document version identity | a succeeded `edit_note` activity item carries `note_version_id` |
| Document text streaming | `services/notebook_chat/streaming.py` states that for prose written via `edit_note`, "the text being written streams into the item as well" |

The existing web client already consumes the notebook variant of this contract. The best reference
for the wire format is `types/notebookChat.ts` in the frontend repo, which mirrors it verbatim and
documents the subtle parts (notably `activity` being *absent* rather than `[]` on
`?activity=live` fetches, meaning "unchanged, keep your cached copy"). See also
`services/notebookChat.service.ts` and `hooks/useNotebookChat.ts`.

---

## 5. Audit checklist

Please answer these against the real code, and say for each whether it works today, needs a change,
or does not exist. Where something is missing, a rough sense of the size of the change is more
useful than a design.

### 5.1 The document pane — highest priority

1. **Panel open signal.** When the agent calls `create_note` mid-turn, does that surface to the
   client as an activity item (or any other event) at the moment it happens, carrying the new note's
   id? The client needs to open the right pane the instant the assistant starts writing, before any
   content exists.
2. **Content delivery.** The chat representation appears to return attached notes as `{id, title}`
   only. Confirm. If so, the client must fetch note content separately. Which endpoint, and what is
   the content shape (Tiptap/ProseMirror JSON, HTML, markdown)? The prototype renders restricted
   markdown; a rich JSON document may need a renderer we do not have in this surface yet.
3. **Refetch trigger.** After an `edit_note` succeeds, how does the client learn the note changed —
   only by observing `note_version_id` in the activity feed, or is there a lifecycle event? Is there
   a WebSocket nudge for note changes specifically?
4. **Progressive assembly.** `streaming.py` suggests the prose being written streams. Confirm what
   the client actually receives while a document is being written: partial document text, or only
   narration about it? Can the client show the document filling in, or does it jump from empty to a
   complete version at each `edit_note` boundary? This determines whether the "watch it build"
   moment, which is the heart of the demo, is achievable without backend work.
5. **Whole-document rewrites.** A comment in `services/notebook_chat/config.py` mentions that
   `edit_note` re-emits the whole Tiptap document. Confirm the cost and whether partial/section-level
   updates are possible, since the pane wants section-level granularity.
6. **Multiple notes.** The representation returns `notes` as a list. For the barebones we want one
   document per conversation. Is there anything that guarantees or biases toward one, or can the
   agent create several? What should the client show if there are several?
7. **Document identity and afterlife.** Where does a note created this way live in the user's
   notebook, is it private by default, and can the user find it outside AI Mode? Can a *second*
   conversation be pointed at an existing note (our model assumes a document outlives its thread)?

### 5.2 Chat mechanics

8. **Access gating.** The assistant views are gated by `IsAuthenticated`, a Research AI budget
   permission, and `UserIsEditor | IsModerator`. AI Mode's intended audience is funders, who are
   generally neither editors nor moderators. What is the intended rollout gate, and what would it
   take to open this to a defined group of funders?
9. **Usage budget.** `UsageLimitExceededError` and `UsageWorkInProgressError` exist. What does the
   client need to render when a user is out of budget, and is there a way to check remaining budget
   before a send (`usage-budget/` endpoint exists — what does it return)?
10. **Regenerate.** The models carry `retry_of_id` and `context_parent_id`, and messages have
    `is_active`. Is re-running the last turn supported through the API today, and if so how?
11. **Edit and resend.** Can the client rewind a conversation to an earlier user message and send a
    replacement, with everything after it retired? `is_active` on messages suggests branching may
    already exist.
12. **Attachments.** `POST .../messages/` appears to accept only a `message` string. How should a
    user-supplied URL or uploaded file become context for the turn? Is there an existing ingestion
    path (the agent presumably has a fetch/search tool), and is there a file-upload story?
13. **Message feedback.** Is there anywhere to persist per-message thumbs up/down? If not, is it
    wanted, and where would it live?
14. **Suggested replies.** The prototype ends most assistant turns with two or three suggested
    replies, which is what lets the whole flow be driven without typing. Nothing in the observed
    contract carries these. Can the agent emit them, or should the client generate them, or do we
    drop them for v1? Please flag the cost either way — this materially changes the feel of the
    product.
15. **Reconnection and resume.** If the user reloads mid-turn, or opens the overlay on another
    device, does the client recover the in-flight turn cleanly? The checkpoint/stream mechanism
    suggests yes; confirm the guarantees.
16. **Polling fallback.** The existing client polls every 5s while a turn runs, with the socket as a
    nudge. Is that still the recommended pattern for a new surface?

### 5.3 Fit and shape

17. **Reuse vs. new workflow.** Should AI Mode reuse `assistant_chat` as-is, or register its own
    `workflow` value on `AgentConversation` with its own toolset and prompt? The conversation in our
    demo is domain-specific (reading a case file, structuring a funding program), which argues for a
    distinct workflow. What does adding one cost?
18. **System prompt and tools.** What is the assistant's current toolset and prompt, and what would
    it take to point it at a document-authoring task with a specific output structure?
19. **Anything that will bite us.** Rate limits, turn timeouts, max iterations, message size caps
    (the client currently assumes 20,000 characters), retention, and anything else that would break
    a long document-writing session.

---

## 6. What we would like back

A short written answer covering:

1. Which of the three panes can be built against today's API with no backend change.
2. The specific gaps, ordered by whether they block a first build.
3. For each gap, whether the fix belongs in the existing `assistant_chat` surface or needs something
   new.
4. Any place where our assumed model (a conversation that owns one AI-authored document, which
   outlives the conversation) fights the existing data model.

Frontend reference points, all on branch `ai-demo` of the web repo: `components/AIMode/` for the
prototype, `types/notebookChat.ts` and `hooks/useNotebookChat.ts` for the existing client-side
contract, and `docs/ai-mode-prototype-plan.md` for the original product write-up.

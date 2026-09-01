# AI Assistant — UI & Layout Specification

Scope: a new assistant surface, entered from a new top-bar icon, in which a user authors a
**Request for Proposal** or a **Proposal** in conversation with an AI. This document covers layout,
surfaces, states and design tokens.

Two things are being built new: the **top-bar entry point** and the **overlay**. Neither exists
today.

Two things already exist and are to be orchestrated into that overlay rather than rebuilt: the
**TipTap editor** and the **AI dialogue stack**. Reuse the components and hooks named in §2 as they
are. Where they need to change, §5.3 states exactly what changes and why.

---

## 1. Surfaces

| Surface | Status | Where |
| --- | --- | --- |
| Top-bar assistant icon | **Build** | `app/layouts/topbar/TopBarUserControls.tsx` |
| Full-viewport overlay | **Build** | new |
| Conversation sidebar | **Build** | new, inside overlay |
| Chat pane | **Assemble from existing parts** | inside overlay |
| Document pane | **Wrap existing editor** | inside overlay |
| Publishing | **Unchanged** | `components/Notebook/PublishingForm/index.tsx` |

---

## 2. Existing parts to orchestrate

### 2.1 Editor

| Concern | Component | Path |
| --- | --- | --- |
| Editor | `BlockEditor` | `components/Editor/components/BlockEditor/BlockEditor.tsx` |
| TipTap config | `useBlockEditor` | `components/Editor/hooks/useBlockEditor.ts` |
| Extensions | `ExtensionKit` | `components/Editor/extensions/extension-kit.ts` |
| Bubble / block menus | `TextMenu`, `LinkMenu`, `ContentItemMenu` | `components/Editor/components/menus/` |
| Styles | `index.css` + partials | `components/Editor/styles/` |
| Title helpers | `getDocumentTitle`, `setDocumentTitle` | `components/Editor/lib/utils/documentTitle.ts` |

TipTap v3 (`@tiptap/core` `3.29.2`), plus `@tiptap-pro/extension-ai` `3.9.2`.

### 2.2 AI dialogue

| Concern | Component / hook | Path |
| --- | --- | --- |
| Chat state | `useNotebookChat` | `hooks/useNotebookChat.ts` |
| Conversation list state | `useNotebookChatList` | `hooks/useNotebookChat.ts` |
| Transport | `notebookChat.service.ts` | `services/notebookChat.service.ts` |
| Socket | `useNotebookChatSocket` | `hooks/useNotebookChatSocket.ts` |
| Message list | `ChatTranscript` | `components/Notebook/AgentChat/ChatTranscript.tsx` |
| Input | `ChatComposer` | `components/Notebook/AgentChat/ChatComposer.tsx` |
| Turn progress | `ExecutionProgress`, `LiveStatusLine` | `components/Notebook/AgentChat/ExecutionProgress.tsx` |
| Tool / thinking rows | `ActivityFeed` | `components/Notebook/AgentChat/ActivityFeed.tsx` |
| Markdown | `MarkdownMessage` | `components/Notebook/AgentChat/MarkdownMessage.tsx` |
| Citations | `ChatSources` | `components/Notebook/AgentChat/ChatSources.tsx` |
| Agent edits → document | `beginNoteDiffReview`, `resolveNoteDiffReview` | `components/Notebook/NoteReview/noteDiffOverlay.ts` |
| Review controls | `NoteReviewControls` | `components/Notebook/NoteReview/NoteReviewControls.tsx` |

Transport is REST plus a WebSocket carrying `stream_delta` events, with a 5s polling fallback. It is
not SSE. Do not replace it.

### 2.3 Do not build

A second chat implementation, a second message type, a second streaming transport, a second editor
instance per document, or a bespoke markdown renderer.

---

## 3. Top-bar entry point

### 3.1 Placement

| Variant | Position | Container class today |
| --- | --- | --- |
| Desktop | Immediately after `TopBarSearchButton`, before the moderator / RSC / notifications group | `hidden tablet:!flex items-center space-x-2 h-full` |
| Mobile | Immediately after the search button, before `UserMenu` | `flex tablet:!hidden items-center space-x-1 h-full` |

### 3.2 Appearance

| Property | Value |
| --- | --- |
| Icon | `Sparkles` from `lucide-react` |
| Icon size — desktop | `h-[26px] w-[26px]` |
| Icon size — mobile | `h-6 w-6` |
| Icon colour | `text-gray-500` |
| Button | `flex items-center justify-center rounded-md p-2 transition-colors hover:bg-gray-100` |
| Loading placeholder | `h-9 w-9 bg-gray-100 rounded-md animate-pulse` |

The sibling top-bar icons use `Icon name="…" size={28} className="text-gray-500"` inside `flex
items-center justify-center hover:bg-gray-100 rounded-md p-2 relative`. Match that optical weight.
Do not introduce a coloured or gradient fill in the top bar.

### 3.3 Behaviour

- `type="button"`, not a `Link`. It opens the overlay in place; the user never loses the page.
- `aria-label="Open assistant"`, `aria-expanded` reflecting overlay state.
- `title` carries the keyboard shortcut.
- Keyboard shortcut `⌘I` / `Ctrl+I` toggles the overlay from anywhere.
- If a conversation has unread assistant output while the overlay is closed, show a count badge
  using the existing pattern: `absolute rounded-full bg-primary-600 text-white flex items-center
  justify-center top-1 -right-0 h-4 w-4` with `font-medium text-[9px]`.
- Hidden entirely for signed-out users.

---

## 4. Overlay layout

### 4.1 Structure

```
┌───────────────────────────────────────────────────────────────────────────────┐
│ header  h-12  border-b border-gray-200  px-4                                  │
│  ◆ Assistant                                    Esc to close   [×]           │
├───────────────┬───────────────────────────────────┬───────────────────────────┤
│ sidebar       │ chat pane                         │ document pane             │
│ w-[264px]     │ flex-1 min-w-0                    │ w-[42%]                   │
│ border-r      │                                   │ min-w-[380px]             │
│ gray-200      │  ┌─ conversation title ─────────┐ │ max-w-[640px]             │
│               │  │  [ Document ▸ ]              │ │ border-l gray-200         │
│ [+ New]       │  └──────────────────────────────┘ │                           │
│               │                                   │  BlockEditor              │
│ conversation  │  ChatTranscript      (scroll)     │  .ProseMirror             │
│ list          │  ActivityFeed                     │  max-w-4xl mx-auto        │
│ (scroll)      │  ExecutionProgress                │                           │
│               │    content max-w-[720px] mx-auto  │  h1 = document title      │
│               │  ───────────────────────────────  │                           │
│               │  ChatComposer                     │  [NoteReviewControls]     │
└───────────────┴───────────────────────────────────┴───────────────────────────┘
```

### 4.2 Container

| Property | Value |
| --- | --- |
| Position | `fixed inset-0` |
| Z-index | `z-[9500]` — below `BaseModal` (`9999`) and `Tooltip` (`10000`), so real modals and tooltips opened from inside the overlay still render above it |
| Background | `linear-gradient(180deg, #f8f9fa 0%, #f1f2f4 100%)` |
| Body scroll | Locked on mount, restored on unmount |
| Layout | `flex flex-col`; body row is `relative flex min-h-0 flex-1` |

The flat light surface is required: the document pane and any embedded ResearchHub cards are
designed for a light page and must sit on the surface they expect.

### 4.3 Header

| Element | Spec |
| --- | --- |
| Height | `h-12 shrink-0` |
| Border | `border-b border-gray-200` |
| Padding | `px-4` |
| Left | `Sparkles` `h-4 w-4 text-primary-600` + label `text-sm font-semibold tracking-tight text-gray-900` |
| Right | `Esc to close` hint `text-xs text-gray-400`, hidden below `tablet`; close button `rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900` with `X` `h-4 w-4` and `aria-label` |

### 4.4 Panes

| Pane | Width | Visibility |
| --- | --- | --- |
| Sidebar | `w-[264px] shrink-0`, `border-r border-gray-200` | Hidden below `tablet` |
| Chat | `flex h-full min-w-0 flex-1 flex-col` | Always |
| Document | `w-[42%] min-w-[380px] max-w-[640px]`, `border-l border-gray-200` | Hidden below `tablet`; mounted only when a document exists and is open |

Chat pane internals:

- Title row: `flex items-center gap-2 px-5 py-3`, title `truncate text-sm font-medium text-gray-700`.
- When a document exists but the pane is closed, the title row carries a reopen button: `flex
  items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium
  text-gray-700 shadow-sm hover:bg-gray-50` with a `FileText` `h-3.5 w-3.5` icon.
- Scroll region: `min-h-0 flex-1 overflow-y-auto px-5 py-4`, inner `mx-auto w-full max-w-[720px]`.
- Composer region: `px-5 pb-5 pt-1`, inner `mx-auto w-full max-w-[720px]`.
- Autoscroll follows the transcript only while the user is within 90px of the bottom. Never yank the
  view down while they have scrolled up.

Sidebar internals:

- New-conversation button: `flex w-full items-center gap-2 rounded-lg border border-gray-200
  bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50` with `Plus`
  `h-4 w-4`.
- Row: `mb-1 w-full rounded-lg px-3 py-2.5 text-left`; active `bg-white shadow-sm`, inactive
  `hover:bg-gray-100`.
- Row contents: title `truncate text-sm font-medium text-gray-900`, subtitle `mt-0.5 truncate
  text-xs text-gray-500`, timestamp `mt-1 text-[11px] text-gray-400` via `formatTimeAgo`.
- Empty: `px-3 py-2 text-xs text-gray-400`.

### 4.5 Below `tablet`

Sidebar and document pane do not render. The chat pane occupies the full width. Provide:

- A conversation switcher in the header, replacing the hidden sidebar.
- A full-screen document view reachable from the reopen button in the title row, with its own back
  control. The document must be reachable on mobile; it must not be silently unavailable.

### 4.6 Dismissal

| Trigger | Behaviour |
| --- | --- |
| `Escape` | Close, retain conversation state |
| Close button | Close, retain conversation state |
| `⌘I` / `Ctrl+I` | Toggle |
| Route change | Close, retain conversation state. The overlay never navigates itself, so a pathname change means the user followed a link out of the transcript |

Closing must not discard the conversation, the draft, or the document pane's open/closed state.
Reopening restores all three.

---

## 5. The two flows

### 5.1 Entry choices

The overlay's empty state offers exactly two actions, in this order:

| Action | Label | Description | Icon |
| --- | --- | --- | --- |
| RFP | `Create an RFP` | `Fund specific research you care about` | `faBullhorn` (`@fortawesome/pro-light-svg-icons`) |
| Proposal | `Create a proposal` | `Raise money for your research` | `faFileSignature` (same package) |

These icons and this copy already identify these two flows in `app/layouts/PublishMenu.tsx`. Use
them so the assistant and the publish menu are recognisably the same two products.

Tile treatment: `rounded-xl border border-gray-200 bg-white p-3.5 text-left shadow-sm
hover:border-primary-300 hover:bg-gray-50`; icon in `flex h-9 w-9 items-center justify-center
rounded-lg bg-gray-100`; title `text-sm font-semibold text-gray-900`; description `text-xs
leading-snug text-gray-600`.

The empty state also accepts free text, so a user who already knows what they want can skip the
tiles. Composer placeholder: `Describe what you want to fund, or paste a link…`.

### 5.2 Document types

| Flow | `documentType` | Template |
| --- | --- | --- |
| RFP | `'GRANT'` | `grantTemplate` |
| Proposal | `'PREREGISTRATION'` | `proposalTemplate` |

Both templates already exist and are used by the current creation paths in
`app/notebook/[orgSlug]/page.tsx`. The assistant fills a structured template; it does not author
into a blank document.

### 5.3 The orchestration requirement

`useNotebookChat` and the entire `AgentChat` stack are scoped to a `noteId`:

```typescript
interface UseNotebookChatOptions {
  noteId: string | number | null;
  chatId: number | null;
  enabled: boolean;
  initialChat?: NotebookChat | null;
}
```

The service path is `/api/research_ai/notebook/notes/${noteId}/chats/`, the socket route is
`/notebook/notes/${noteId}/chats/${chatId}/`, and the agent writes to the document by creating a
**note version**. All of it presumes a note.

**Requirement: create the note when the flow is chosen, before the first message.** Picking
`Create an RFP` or `Create a proposal` creates a note from the corresponding template with the
correct `documentType`, then binds the conversation to it. Consequences, all of which are the
intended design:

- The chat stack is reused unmodified — no new transport, no new endpoint, no `noteId`-optional
  variant.
- The document pane always has a real document to render.
- Agent edits arrive through the existing note-version and diff-review path.
- The draft is server-persisted from the first turn and survives a reload or a closed overlay.
- Publishing needs no new bridge: the note is already a notebook note, so
  `components/Notebook/PublishingForm/index.tsx` receives it unchanged.

Free-text entry from the empty state must resolve to one of the two document types before the note
is created. If the intent is ambiguous, the assistant asks which of the two the user wants and
creates the note on the answer. Do not create a note of an unknown type.

### 5.4 Access

The notebook assistant is currently gated to moderators and hub editors
(`NoteEditorLayout.tsx:144–154`). Decide the gate for this surface explicitly and apply it to the
top-bar icon, not only to the overlay's interior. A user who cannot use the assistant must not see
the icon.

---

## 6. Document pane

### 6.1 Editor

```typescript
export interface BlockEditorProps {
  content?: string;
  contentJson?: string;
  isLoading?: boolean;
  onUpdate?: (editor: Editor) => void;
  editable?: boolean;
  setEditor?: (editor: Editor | null) => void;
}
```

| Constraint | Value |
| --- | --- |
| Schema when editable | `Document.extend({ content: 'heading block+' })` — first node is the title `h1` |
| Content width | `max-w-4xl mx-auto`, `py-16`, `pl-20 pr-8` below `lg`, `px-8` at `lg` and above |
| Heading scale | h1 `text-3xl`, h2 `text-2xl`, h3 `text-xl`, h4 `text-lg`, h5 `text-base`, h6 `text-sm`, all `font-bold` |
| Paragraph | `leading-relaxed my-3`; top-level `my-6` |
| Placeholders | Title `Enter a title...` · Body `Click here to start writing …` · Empty block `Type / to browse options` |
| Autosave | `onUpdate` → `useUpdateNote`, debounced 2000ms |

The pane is narrower than the notebook's document column. The editor's own `max-w-4xl` will exceed
`640px`, so the pane clips to its width and the editor's horizontal padding must be reduced within
it. Do not let the document scroll horizontally.

Editor menus (`TextMenu`, `LinkMenu`, `ContentItemMenu`, table and image menus) render only when
`editable={true}` and must remain functional inside the pane. Bubble menus must be positioned so
they are not clipped by the pane's left border.

### 6.2 How assistant content reaches the document

The assistant does not type into the editor. The path is:

1. Backend runs the `edit_note` tool and writes a new note version.
2. Client detects it via `useNoteVersionSocket` (`created_via === 'agent'`) or a succeeded
   `edit_note` activity row carrying `note_version_id`.
3. `beginNoteDiffReview(editor, incomingNode, …)` renders the assistant's content plus the user's
   replaced content as struck-through, still-editable text.
4. `NoteReviewControls` shows the change count with Accept / Reject.
5. Accept keeps the assistant's side; Reject keeps the user's and persists via `saveNoteNow`.

Requirements:

- Never call `editor.commands.setContent` for assistant output outside this flow.
- Agent-applied content uses `{ emitUpdate: false }` so it does not trip autosave.
- While a review is open, autosave persists `noteDiffPersistableDoc(editor)` so struck ranges are
  never written to the server.
- The document pane must open automatically when a review begins. A change count on a pane the user
  cannot see is not a notification.
- `NoteReviewControls` renders inside the document pane, `z-30`, horizontally centred, `bottom-6`,
  on a `pointer-events-none` container with the pill itself interactive.

### 6.3 Publishing

Unchanged. The assistant does not publish, does not open the publishing form, and does not write
publishing-form fields. It hands off a saved note.

---

## 7. Design tokens

### 7.1 Colour

Defined in `app/styles/colors.ts`, exposed via `tailwind.config.ts` as `primary`, `gray`, `rhBlue`,
`orcid`. `primary` and `rhBlue` are the same ramp.

| Token | Hex |
| --- | --- |
| `primary-50` | `#eff4ff` |
| `primary-100` | `#dbeafe` |
| `primary-200` | `#bfdbfe` |
| `primary-300` | `#93c5fd` |
| `primary-400` | `#60a5fa` |
| `primary-500` | `#3971ff` |
| `primary-600` | `#2563eb` |
| `primary-700` | `#1d4ed8` |
| `primary-800` | `#1e40af` |
| `primary-900` | `#1e3a8a` |
| `gray-50` … `gray-950` | `#f9fafb` `#f3f4f6` `#e5e7eb` `#d1d5db` `#9ca3af` `#6b7280` `#4b5563` `#374151` `#1f2937` `#111827` `#030712` |

Semantic colours are Tailwind defaults (`red-600`, `emerald-600`, `amber-500`). There is no custom
semantic ramp; do not add one.

| Surface | Class |
| --- | --- |
| Primary action | `bg-primary-500`, hover `bg-primary-600`, white text |
| Selected / active | `border-primary-500 bg-primary-50` |
| Overlay header, pane dividers | `border-gray-200` |
| Form field borders | `border-gray-300` |
| Body text | `text-gray-900` |
| Secondary text | `text-gray-600` |
| Metadata / captions | `text-gray-500` |
| Disabled / placeholder / timestamps | `text-gray-400` |
| Cards and panes on the overlay surface | `bg-white` |
| Subheaders | `bg-gray-50` |
| Destructive | `bg-red-600` |

### 7.2 Buttons

Use `components/ui/Button.tsx`. Do not hand-roll buttons for actions.

```typescript
variant: 'default' | 'secondary' | 'outlined' | 'ghost' | 'link' | 'destructive' | 'contribute' | 'dark'
size:    'default' | 'sm' | 'md' | 'lg' | 'icon' | 'metric'
```

Base `rounded-lg text-sm font-medium`, focus `focus-visible:ring-2 focus-visible:ring-offset-2`.
Sizes: `default` `h-10 px-4 py-2` · `sm` `h-8 px-3 text-xs` · `md` `h-9 px-3 text-sm` · `lg`
`h-12 px-8 text-base` · `icon` `h-10 w-10`.

| Use | Variant / size |
| --- | --- |
| Composer send | `default`, `icon` |
| Accept in review controls | `default`, `sm` |
| Reject in review controls | `outlined`, `sm` |
| Overlay header actions | `ghost`, `icon` |
| Empty-state flow tiles | tile markup in §5.1, not `Button` |
| Sidebar new conversation | sidebar markup in §4.4, not `Button` |

### 7.3 Shape, elevation, type

| Property | Value |
| --- | --- |
| Radius — buttons, inputs, small controls | `rounded-lg` |
| Radius — panes, cards, tiles, modals | `rounded-xl` / `rounded-2xl` |
| Radius — pills, badges, avatars | `rounded-full` |
| Radius — top-bar icon buttons | `rounded-md` |
| Shadow — resting card | `shadow-sm` |
| Shadow — floating / modal | `shadow-lg` / `shadow-xl` |
| Card pattern | `bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden` |
| Padding — cards / panes | `p-4` or `p-6` |
| Gaps | `gap-2` / `gap-4` |
| Sans font | `var(--font-geist-sans)` |
| Mono font | `var(--font-geist-mono)` |
| Custom weights | `medium: 500`, `large: 550`, `semibold: 600` |
| Top bar height | `--top-bar-height` — `4rem`, `4.375rem` below `768px` |

### 7.4 Dark mode

`darkMode: 'class'`. There is no app-wide toggle and the root dark variables in `app/globals.css`
are commented out. The overlay is light-only. Do not add a theme toggle. Note that the editor's own
stylesheets carry `dark:` variants; because no ancestor sets `.dark`, they stay inert.

---

## 8. Required states

| State | Surface | Treatment |
| --- | --- | --- |
| Overlay opening | Container | No entrance animation on the container; content mounts ready |
| No conversation | Chat pane | Empty state: greeting, composer, the two flow tiles from §5.1 |
| Creating the note | Chat pane | Assistant turn in `thinking` state; composer disabled |
| Conversation loading | Chat pane | Centred loader |
| Conversation empty | Chat pane | Empty-state copy plus at most four fixed starter prompts for the chosen document type |
| Turn running | Chat pane | `ExecutionProgress` + `LiveStatusLine`; composer send becomes Stop (`busy`, `canStop`) |
| Streaming text | Chat pane | `ActivityFeed` with `streamingItemId` set |
| Tool running | Chat pane | `ToolCallRow` with status icon; add any new tool name to `TOOL_ICONS` or it renders unlabelled |
| Document being written | Document pane | Pane opens automatically; diff overlay plus `NoteReviewControls` |
| Document exists, pane closed | Chat pane | Reopen button in the title row per §4.4 |
| Send failed | Composer | `ComposerNotice` `{ tone: 'error' }` |
| Rate limited / invalid | Composer | `ComposerNotice` `{ tone: 'warning' }` |
| Assistant unavailable (403) | Whole feature | Close the overlay and hide the top-bar icon |
| Note reload / persist failed | Chat pane | Error banner with retry |
| Below `tablet` | Sidebar, document pane | Not rendered; replacements per §4.5 |

Starter prompts, four maximum, fixed text, rendered as pills: `rounded-full border border-gray-200
bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50`. Clicking populates and sends through
the composer rather than bypassing it.

| `documentType` | Prompts |
| --- | --- |
| `GRANT` | `Draft an RFP from a paper or link` · `Help me scope what to fund` · `Set eligibility and evaluation criteria` · `Review my draft for gaps` |
| `PREREGISTRATION` | `Draft a proposal from my study idea` · `Write my methods section` · `Add a preregistered analysis plan` · `Review my draft for gaps` |

---

## 9. Accessibility

- Overlay is a modal surface: `role="dialog"`, `aria-modal="true"`, `aria-label="Assistant"`.
- Focus moves into the overlay on open and is trapped within it. `BaseModal` and `Tooltip` render
  above it by z-index and must remain usable.
- On close, focus returns to the top-bar icon.
- Top-bar icon carries `aria-label` and `aria-expanded`.
- Live status line is `aria-live="polite"`.
- Starter prompts and flow tiles are `<button>` elements in the tab order.
- The document pane is reachable by keyboard when open, and the reopen button is focusable.
- Body scroll lock must not trap keyboard scrolling inside the panes.

---

## 10. Out of scope

- A second chat implementation, message type, or streaming transport.
- Token-by-token typing directly into the editor.
- Client-side LLM or tool invocation. Tools run server-side; the client renders activity rows.
- Changes to `PublishingForm`, the publish step, or payment.
- Any surface for tracking or reporting on already-funded work.
- Collaborative editing. Not implemented; only a CSS stub and a JWT route exist.
- New colour tokens, new radius or shadow values, a theme toggle, dark mode.
- Removing or altering the existing publish-menu creation paths. They continue to work unchanged.

---

## 11. Acceptance criteria

1. A `Sparkles` assistant icon appears in the top bar on both desktop and mobile, in the positions
   in §3.1, matching the optical weight of its sibling icons, hidden for signed-out users, and
   hidden for users who cannot access the assistant.
2. The icon and `⌘I` both toggle a `fixed inset-0 z-[9500]` overlay that locks body scroll and
   closes on `Escape`, on the close button, and on route change — retaining conversation, draft and
   pane state each time.
3. `BaseModal` and `Tooltip` opened from inside the overlay render above it.
4. The empty state offers exactly two flows, `Create an RFP` and `Create a proposal`, using the
   publish menu's icons and descriptions verbatim, plus free-text entry.
5. Choosing a flow creates a note from the matching template with `documentType` `GRANT` or
   `PREREGISTRATION` before the first assistant turn, and the conversation is bound to that note.
6. Free-text entry never creates a note until the document type is resolved.
7. At `tablet` and above the overlay shows a 264px sidebar, a fluid chat pane with content capped at
   720px, and a document pane at 42% width clamped to 380–640px. Below `tablet` the chat pane is
   full width and both the conversation list and the document remain reachable.
8. The document pane renders `BlockEditor` with working bubble menus, no horizontal scroll, and
   autosave.
9. Assistant edits open the document pane automatically and arrive as a diff review with an accurate
   change count; Accept and Reject both leave the document saved and consistent.
10. Closing the overlay and reopening it restores the conversation, the draft, and the document
    pane's open state. A reload restores the draft from the server.
11. The note produced is a standard notebook note that `PublishingForm` accepts with no changes.
12. No new chat component, streaming transport, colour token, radius value, or shadow value is
    introduced.

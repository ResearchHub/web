# AI Mode v2 — Documents, Judgment, Timeline and Chat Polish

> **Status:** implemented on branch `ai-demo` (2026-09-04). Supersedes the third-column and
> guardrails sections of `ai-mode-prototype-plan.md`; everything else in that plan still stands.
> Widgets: `components/Funding/documents/`. Grant record, citations and script:
> `components/AIMode/lib/`.

---

## 1. Why this revision exists

The first prototype assumed one conversation owns one document: the RFP. Customer conversations
since then say a funding conversation is really backed by **three documents**, and that the funder
needs to know **where in the process** the program is at any point:

| Document | What it is | Who authors it |
| --- | --- | --- |
| **RFP** | The call for proposals the AI drafts section by section | AI, in conversation |
| **Judgment** | The rules the AI must follow to allocate funds | Pre-filled from org defaults, adjusted and confirmed by the funder |
| **Org profile** | Who the funder is and what they typically fund | Pre-existing; the AI reads and cites it |

Each is a **widget** that will later be reused elsewhere (an org configuration page is the first
candidate), so none of them may depend on AI Mode state.

The second goal is polish: the chat has to read as a world-class AI surface, not a scripted form.

---

## 2. Decisions

Every item below was confirmed with the owner before implementation.

### 2.1 Documents

- **Judgment replaces the inline Guardrails block.** The mode/cap/bar/notify controls move out of
  the transcript into a document in the side panel. The chat turn that used to embed the form now
  says "your judgment rules are on the right, adjust anything" and shows a compact card that
  reflects the confirmation state. One source of truth.
- **Judgment reads like a document, edits like a form.** The top of the widget is a generated
  "How funds are allocated" paragraph in document typography, re-rendered live as the controls
  below it change. The confirm button ("Delegate to AI" / "Save policy") lives at the bottom of the
  document, not in chat.
- **Judgment is pre-filled from org defaults** and exists from the moment a grant exists. It is not
  blank until the guardrails stage.
- **Judgment stays editable after confirmation.** Confirming activates the policy; it does not lock
  the controls. Later edits apply immediately, and the allocation block re-derives from them.
- **Org profile is a fixture.** Aletheia's profile exists before the demo starts. The
  case-file-reading turn cites it and shapes the RFP around it. The widget is read-only in AI Mode.
- **Documents belong to a grant, not a conversation.** A new `GrantRecord` holds the RFP state,
  the judgment policy, the funded amount and the org reference. Conversations point at a grant by
  id. "Get updates" reuses the most recent published grant, or seeds a completed one if the RFP
  track has not been run, so the updates conversation never opens on an empty RFP tab.

### 2.2 Side panel

- **Tabbed.** One document visible at a time: RFP · Judgment · About. Only the RFP tab carries a
  badge: a drafted-sections counter while drafting, "Live" once published. The same indicator
  appears on the conversation in the left sidebar.
- **AI opens it when it first cites a document.** Closed on a new conversation. Reading the case
  file opens the Org tab; drafting switches to RFP; the guardrails stage switches to Judgment. A
  "Documents" button in the chat header reopens it when closed.
- Citation chips (§2.4) open the panel on the referenced tab and scroll to and highlight the
  referenced section.

### 2.3 Timeline

- **Transcript only.** A `timeline` block renders an inline stepper. It appears when the RFP goes
  live and on every updates checkpoint. The highlighted step is the one **in progress**, not the
  one just finished: publishing shows "Experts invited" as current, and the allocation turn shows
  the whole track complete. No description text under the track.
- Steps, in order: **Drafted → Published → Experts invited → Proposals in → Peer review →
  Allocated**.

### 2.4 Chat polish (all four selected)

- **Activity traces.** Tool-call style steps above a turn ("Reading VASO-001 → 14 claims found →
  4 unresolved → Checking Aletheia's funding profile") replace the single thinking line where a
  stage defines them. They **persist collapsed** after the turn completes, expandable, and are
  part of the message so they survive reload.
- **Citation chips.** Inline chips in assistant text that open the panel on a tab and highlight a
  section. Authored in script text as `[[tab:section|label]]`.
- **Composer upgrades.** Attachment chips (paperclip and pasted URLs), slash commands for the three
  tracks and the three documents, a stop button while a turn is generating, Enter/Shift+Enter.
  ⌘I already toggles AI Mode; no ⌘K, which would collide with search.
- **Message actions and motion.** Copy, regenerate and thumbs on assistant turns; edit-and-resend
  on user turns; framer-motion enter animations for turns and the panel; an assistant orb that
  pulses while thinking.

### 2.5 Reusability contract

Widgets are **pure, props-driven and context-free**, under `components/Funding/documents/`:

| Widget | Props | Notes |
| --- | --- | --- |
| `RfpDocument` | `title, organization, amountUsd, sections, revealedSectionIds?, highlightSectionId?, status?` | `revealedSectionIds` undefined means fully drafted |
| `JudgmentDocument` | `policy, confirmed, onChange?, onConfirm?, highlightSectionId?` | Read-only when `onChange` is absent |
| `OrgProfileCard` | `profile, highlightSectionId?` | Read-only. Funding history renders as `WorkPreviewCard`s, matching the activity feed |
| `GrantTimeline` | `currentStep, compact?` | Used by the transcript block |

The AI panel wraps them and supplies state from `AIModeContext`. Types the widgets need live in
`components/Funding/documents/types.ts`; AI Mode imports from there.

---

## 3. Data model changes

```ts
interface GrantRecord {
  id: string;
  orgId: string;
  title: string;
  amountUsd: number;
  rfp: { revealedSections: string[]; status: 'drafting' | 'drafted' | 'published' };
  judgment: { policy: JudgmentPolicy; confirmed: boolean };
  fundedAmountUsd: number | null;
  updatedAt: number;
}

interface AIConversation {
  // unchanged: id, title, subtitle, track, stageId, messages, updatedAt
  grantId: string | null;
  panel: { open: boolean; tab: 'rfp' | 'judgment' | 'org' };
}

interface ChatMessage {
  // unchanged: id, role, blocks, quickReplies, status, revealedBlocks, createdAt
  activity?: ActivityStep[];    // tool-call style trace, persisted
  attachments?: Attachment[];   // chips on a user turn
  stageId?: string;             // assistant turns: which stage produced it
  feedback?: 'up' | 'down';
}

type MessageBlock =
  | …existing…
  | { kind: 'timeline'; step: TimelineStepId }
  | { kind: 'judgment_prompt' }   // replaces 'guardrails'
```

`GuardrailConfig` is renamed `JudgmentPolicy`. Storage key bumps to `v3`; "Reset demo" clears
grants along with conversations.

Script stages gain `activity?`, `openPanel?: DocumentTab`, `grantPatch?` and `timelineStep?`.

---

## 4. Script changes

| Stage | Change |
| --- | --- |
| `rfp:ingest` | Activity trace. New paragraph citing the org profile (chip → Org tab). Opens panel on Org. Creates the grant. |
| `rfp:draft-*`, `rfp:details` | Activity traces. `rfp:draft-open` switches the panel to RFP. `rfp:draft-gaps` cites the org profile's review preference. |
| `rfp:guardrails` | Opens Judgment tab. Inline form replaced by `judgment_prompt` card. Copy rewritten. |
| `rfp:policy` | Cites the judgment document. |
| `rfp:live` | Adds `timeline: published`. Marks the grant published. |
| `updates:*` | Each checkpoint adds a `timeline` block for its step and cites the relevant RFP or Judgment section. |

---

## 5. Out of scope

- A real org settings page. The widgets are ready for it; the route is not built.
- A real LLM. Still scripted.
- Editing the RFP text from the panel.
- Mobile layout beyond not breaking.

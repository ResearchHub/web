# AI Mode — Prototype Plan

> **Status:** implemented. The prototype lives in `components/AIMode/`, mounted from
> `components/providers/ClientProviders.tsx` with the top-bar entry point in
> `app/layouts/topbar/TopBarUserControls.tsx`. The §8 checklist below reflects what shipped.

---

## 1. What we are building and who it is for

A global **AI Mode** overlay in the ResearchHub web app: a Claude/Cursor-style chat surface that a
science funder uses to go from a vague idea to a live, funded RFP, and later to check on the
proposals that RFP attracted.

**The audience is one specific person:** a prospective ResearchHub funder who is an AI maximalist
and is short on time. He has already opened the *Megalithic Geopolymer Studies* grant, so the whole
demo is built around that exact grant. Two consequences drive every decision below:

1. **Zero learning curve.** He should never have to figure out where to click. The conversation
   proposes the next step; he accepts it. Every screen has an obvious "yes, continue."
2. **It has to feel like delegation, not tooling.** The payoff moment is not "I drafted an RFP with
   an AI." It is "the AI spent my money on the right science while I was asleep, and can explain
   why." Steps 1–3 earn trust; steps 4–6 and the updates track cash it in.

**This is a demo.** Every backend interaction may be mocked. Nothing here will be productionized.
But it must be visually indistinguishable from a shipped feature — reuse real ResearchHub
components and real data wherever it costs nothing.

---

## 2. Non-goals

- No real LLM, no streaming from a real model, no real RFP creation, no real money movement.
- No "Draft a new proposal" track beyond a visible entry point (see §4.4).
- No mobile layout beyond "does not visibly break." The demo is driven on a laptop.
- No auth gating, permissions, moderation, or error states beyond what keeps the demo from crashing.
- No tests.

---

## 3. Surface and shell requirements

### 3.1 Entry point

- A single new icon in the top bar, rendered by
  `app/layouts/topbar/TopBarUserControls.tsx` (both the `desktop` and `mobile` branches — the
  desktop icon row sits alongside search / moderator shield / RSC / notifications).
- Clicking it opens the overlay. **It must not navigate.** No new route, no page transition.
- A keyboard shortcut to open/close is a nice-to-have; `Esc` to close is a must.

### 3.2 Overlay mounting and lifetime

- Mount the overlay **once, globally**, in `components/providers/ClientProviders.tsx`, inside the
  existing provider stack (it needs `UserProvider`, `ExchangeRateProvider`,
  `CurrencyPreferenceProvider`, and `NavigationProvider`, all of which are already there). Lazy-load
  the overlay body with `next/dynamic({ ssr: false })` so it costs nothing until first open.
- State lives in a new React context provider mounted at the same level.
- **Hard requirement:** conversation state survives client-side navigation. The demo explicitly
  requires "open a proposal, then come back to the chat later." Because the provider sits above
  the router children, in-memory state already survives route changes — but the overlay must
  *close* on navigation and *reopen* with the conversation intact. Any link that leaves the app
  entirely (the production grant page) opens in a new tab instead, so the demo is never stranded.
- **Also required:** state survives a full page reload. Persist conversations to
  `sessionStorage`/`localStorage` (hydrate on mount, guard against SSR). This is what makes "come
  back later and ask for updates" believable, and it protects the demo if the browser is refreshed
  between acts.
- Provide a **"Reset demo"** control that wipes persisted state back to a blank slate — every
  conversation from the previous run is removed, so the second run opens exactly as the first did.
  Non-negotiable for a live demo you may need to run twice.

### 3.3 Demo controls

A small operator panel pinned **bottom-right**, outside the conversation, holding switches for beats
that shouldn't always be shown. Persisted like the rest of the state, but deliberately *not* cleared
by "Reset demo" — it is the operator's setup for the room, not part of the run.

It currently carries one switch: **Offer AI-managed funding**, off by default. Off means the
delegation step (§4.3 Phase 5) drops out of the script chain and funding stays supervised end to
end; on restores it. Hiding a beat must work this way — by dropping the stage, not by rewriting the
turns around it — so the same build can serve an audience that should see delegation and one that
shouldn't.

### 3.4 Z-index and existing overlays

The app already has: `TopBarContainer` at `z-[60]`, `AgentChatPanel` at `z-[110]`,
`SwipeableDrawer` at `z-[1000]/[1001]`, `BaseModal` (Headless UI) at `z-[9999]`, `Tooltip` at
`z-[10000]`.

Put AI Mode at roughly **`z-[9500]`**: above everything in the page shell, but still *below*
`BaseModal` and `Tooltip` so that any real ResearchHub modal or tooltip opened from inside the
overlay renders correctly on top. Lock `document.body` scroll while open.

### 3.5 Panel layout

Three panels; two visible by default.

| Panel | Default | Contents |
|---|---|---|
| Left | visible, collapsible | Conversation list |
| Center | always visible | Chat transcript + composer |
| Right | hidden; appears contextually | The live RFP document being drafted |

- The chat is the primary surface. When the right panel appears, the **chat keeps visual
  prominence** and the document is secondary — same hierarchy as Cursor/Claude artifacts, and the
  same hierarchy the notebook's `AgentChatPanel` already uses in reverse.
- The right panel must be dismissible and re-openable from a persistent affordance.
- Resizable right panel is a nice-to-have; `hooks/useAgentChatWidth.ts` already implements exactly
  this pattern (localStorage-backed, min/max clamped) if you want it cheaply.

---

## 4. The conversation model

### 4.1 Messages are block lists, not strings

An assistant turn is an ordered list of typed blocks. This is the single most important
architectural decision, because it is what lets rich interactive UI (payment, guardrails, proposal
cards) appear *inline in the transcript* rather than in modals. At minimum:

- `text` — markdown prose
- `proposals_list` — renders real proposal cards (§6.2)
- `payment` — funding step (§4.3)
- `guardrails` — spending-policy configuration (§4.3)
- `allocation_summary` — what the AI funded and why (§4.5)
- `rfp_success` — the "your RFP is live" confirmation with a link out

Add block types freely; the renderer should be a single dispatch point so new ones are cheap.

An assistant turn may also carry **quick replies**: 1–3 suggested responses rendered as tappable
pills under the message. These are the low-learning-curve mechanism — the funder can drive the demo
from the pills alone, with one deliberate exception: the opening turn of the RFP track asks for the
funder's own material and offers no pills, because the whole point is that he supplies the vision.
Typing or pasting must work everywhere and must advance the same script.

### 4.2 The script is deterministic

There is no model. A named stage machine maps `(track, stage) -> assistant turn`. Any user input —
quick reply or free text — advances to the next stage. This means the demo cannot go off the rails,
and the operator can improvise wording in the composer without breaking anything.

Requirements:
- Assistant turns must **simulate thinking and streaming**: a brief indeterminate "thinking" beat,
  then text revealed progressively, then rich blocks mounted once text finishes. Instant full
  messages read as fake; this is cheap and buys a lot of credibility.
- Guard against double-advance (rapid clicks, Enter-key repeats).
- Streaming state must actually terminate — no message left permanently in a streaming state.

### 4.3 Track A — "Open an RFP" (the primary track)

Six phases, as specified. Phases 1–3 are exploratory; 4–5 are commitment; 6 is payoff.

**Phase 1 — Capture the vision.** The assistant asks what the funder wants to see happen in the
world, not what document he wants, and it must **assume no prior context** — a first-time funder has
never spoken to it before, so opening with "you've been circling X" is a lie the demo can't afford.
The ask invites source material rather than a summary: paste a paper, a video, a thread.

The funder's reply is the vision, and the next turn is spent proving it was read — restating the
claim, its history, and the specific gap the material closes, then drawing the one conclusion that
shapes the RFP (this is a replication question, not a discovery question). Comprehension of pasted
material is the most convincing thing the assistant does; write real copy for it. The one question
that follows is **budget**. No pills — the operator types **200K**, which is the real grant. Busy person.

Pasting must also work as the *opening* message from the home state, with no track chosen — that
skips the ask and goes straight to reading the material.

**Phase 2 — Brainstorm.** The assistant proposes concrete framings, key questions, and candidate
research directions and asks him to react rather than generate. This is where it must demonstrate
that it actually knows the domain — see §5.3 for the real source text to draw on.

**Phase 3 — Draft the RFP.** The **right panel opens here.** Once the funder says to draft it, the
assistant drafts the whole thing **without asking again** — the turns chain on a timer, narrating
each group of sections as it lands. Asking "keep going?" between sections is a progress bar wearing a
button; the funder already answered that question. The next input he gives is whether to fund it.

Sections stream into the document as the narration proceeds. Section set:

1. Title
2. Context / background
3. Key questions
4. Objective & scope
5. Eligibility and expected outputs
6. Budget & timeline
7. Evaluation criteria

The panel must show which sections are complete versus pending — a visible sense of a document
assembling itself is the whole point of the third panel. Do not dump all sections at once.

**Phase 4 — Fund the RFP.** Present a funding step for **$200,000 USD**, the real amount of this
grant. See §6.3 for how to handle payment UI. On confirm, the assistant acknowledges and moves
straight to guardrails — no dead end.

**Phase 5 — Spending customization (guardrails).** Two modes:

- **AI-managed:** the AI disburses funds on his behalf to proposals that clear a peer-review bar he
  sets. Configurable at minimum: maximum per proposal, total budget cap, and whether to notify
  before disbursing.
- **Self-managed (the default):** the AI surfaces reviewed proposals and recommends, but he releases
  every dollar.

**This phase is off by default** and hidden behind the demo controls (§3.3). Funding stays
supervised unless the operator turns delegation on, so the stage drops out of the chain entirely and
payment hands straight to the policy read-back. The **3.5** peer-review bar still applies either
way, which is what makes the §4.5 payoff land: three proposals clear it, one does not, on real
scores.

Requirements:
- Every control that is visible must be functional and must be reflected in the §4.5 outcome. Do
  not render a slider that changes nothing.
- The assistant should state the policy back in plain English after he confirms, in both modes.
  Reading the commitment back is what makes the arrangement feel safe.

**Phase 6 — RFP is live.** Confirmation with a link to the real grant page
(`https://www.researchhub.com/grant/13741/megalithic-geopolymer-studies`). The link is absolute and
points at production, because the demo runs from localhost and the payoff only lands if the page is
the one anyone can visit; it opens in a new tab so the conversation is still on screen behind it.

### 4.4 Track B — "Draft a new proposal"

Entry point must be visible on the home state (it is one of the three advertised options). Selecting
it produces a single honest "this track is coming next" response with a way back. Do not build it.

### 4.5 Track C — "Get updates" (the second-most important track)

This track has **two checkpoints**, and both must be reachable in the demo.

**Checkpoint 1 — proposals are in, review pending.**
The assistant reports that the RFP attracted **4 proposals**, renders them as real cards (§6.2),
and states that peer review is in progress. Tone: a status update from a competent chief of staff,
not a data dump. Lead with the count and the state, then show the cards.

**Checkpoint 2 — money has been disbursed.**
The assistant reports that it allocated funds under the policy set in Phase 5, and — critically —
**explains its reasoning per proposal**. For each funded proposal: amount, the peer-review score
that qualified it, and one sentence of rationale. For the held proposal: why it was held and what
would unblock it.

This is the emotional peak of the demo. The rationale text must be specific to the actual proposals
(§5.4) — generic "this proposal scored well" copy kills it.

Use real review scores to produce a clean, honest story against the 3.5 threshold:

| Proposal | PI | Avg review score | Outcome |
|---|---|---|---|
| Experimental Replication, Characterization, and Feasibility… | Narayanan Neithalath | 4.0 (3 reviews) | Funded |
| Validation of Fóti's Protocol… Historical Feasibility | Ange Therese Akono | 4.0 (2 reviews) | Funded |
| Experimental Validation of Low-Temperature Alkali Silicate Synthesis… | Michel Barsoum | 3.5 (2 reviews) | Funded |
| Is it really a geopolymer? | Waltraud M. Kriven | 3.0 (1 review) | **Held** — below the 3.5 bar, and only one review so far |

Allocations must sum to the $200,000 committed in Phase 4. Suggested split: $75k / $75k / $50k,
with the fourth held pending a second review. Show the arithmetic — a visible "$200,000 committed ·
$200,000 allocated · 1 held" summary.

Nice-to-have that lands well: one of the reviews on the Neithalath proposal is authored by an
account literally named **"AI Review"** (score 4.0), alongside human reviewers Muhammad Zulfiqar
and Florencia Renteria del Toro. Having the assistant cite both AI and human peer review as inputs
is real, verifiable, and on-message.

### 4.6 Starting state

AI Mode opens on a blank slate: an empty sidebar and the home state. There is no seeded history,
because "Reset demo" has to return the operator to exactly this state, and a sidebar that repopulates
itself on reset does not read as a reset.

Nothing is lost by starting empty, because the **Get updates** tile on the home state drops straight
into updates checkpoint 1 in one click. The sidebar fills as the operator works, with each row
showing a title, a one-line subtitle of the last state, and a relative timestamp. Selecting a
conversation restores its full state, including whether the document panel was open.

**Demo-robustness requirement:** the operator must be able to reach any beat within ~10 seconds,
either by clicking through quick replies from a track tile or by selecting a conversation already in
the sidebar. Assume the funder interrupts and asks to see the ending first.

---

## 5. Data: use the real thing

All of this is verified live data. Hardcode it as fixtures; do not make the demo depend on the
network at runtime (but see §6.2 — the *card components* should still be the real ones).

### 5.1 The grant / RFP

| Field | Value |
|---|---|
| Post ID | `13741` |
| Grant ID | `32` |
| Slug | `megalithic-geopolymer-studies` |
| Title | Megalithic Geopolymer Studies |
| URL | `https://www.researchhub.com/grant/13741/megalithic-geopolymer-studies` |
| Amount | **$200,000 USD** (≈ 3,146,278 RSC) |
| Organization | Pseudonymous |
| Applications | 4 |
| Hero image | `https://storage.prod.researchhub.com/uploads/posts/users/36837/480728e5-3e19-4fda-9a6e-77e4b9c1986a/cast.png` |

### 5.2 What the operator pastes

The Phase 1 ask is answered with the protocol video plus a line or two of the funder's own reasoning:

```
https://www.youtube.com/watch?v=v1qf9QbWbP8
```

The assistant's reply is scripted against this, so it names Davidovits, the water-glass gap, the
168 °C eutectic, and the absence of an independent replication. Any text alongside the link is fine —
the script does not parse the input — but the link is what makes the "watched it end to end" beat
land.

### 5.3 Source text for the drafted document

The real grant body is available from `GET https://api.researchhub.com/api/researchhubpost/13741/`
(`renderable_text` / `full_markdown`). It already has the structure the draft should converge on:
**Context** (Davidovits' geopolymer hypothesis; the gap Fóti's 2025 protocol claims to fill),
**Key Questions** (replication / materials analysis / historical feasibility), and **Objective**.

Use it. The drafted RFP should read as a slightly-condensed version of the real thing. The funder
will recognize his own grant, which is the point — but the assistant should appear to have *arrived*
at that text through the Phase 1–3 conversation, so the brainstorm beats must plausibly lead there
(e.g. the assistant proposing "independent replication vs. materials characterization vs.
pre-industrial feasibility" as the three axes, and him agreeing).

### 5.4 The four proposals

Source: `GET https://api.researchhub.com/api/funding_feed/?page=1&page_size=20&content_type=PREREGISTRATION&grant_id=32&ordering=best`

| Post ID | Title (short) | PI | Fundraise | Score |
|---|---|---|---|---|
| `32055` | Experimental Replication, Characterization, and Feasibility of Low-Temperature Alkali-Silicate Stone Formation | Narayanan Neithalath | $90,216 raised / $100k · COMPLETED | 4.0 (3) |
| `32125` | Experimental Validation of Low-Temperature Alkali Silicate Synthesis… Fóti's Protocol | Michel Barsoum | $90,294 / $100k · COMPLETED | 3.5 (2) |
| `32220` | Validation of Fóti's Protocol, Experimental Characterization, Historical Feasibility | Ange Therese Akono | $8 / $200k · OPEN | 4.0 (2) |
| `32249` | Is it really a geopolymer? | Waltraud M. Kriven | $90,443 / $100k · COMPLETED | 3.0 (1) |

Each has a real `slug`, `image_url`, author, and nested `fundraise` object. Capture the full raw
API response as the fixture so the real transformers and card components can consume it unmodified
(§6.2).

---

## 6. Reuse of existing ResearchHub components (must-haves)

The prototype must look like it belongs in the product. These are hard requirements.

### 6.1 Color

The overlay is a **light gray surface** — `linear-gradient(180deg, #f8f9fa 0%, #f1f2f4 100%)` — with
brand blue used only as an accent.

This started as a deep-blue treatment derived from the `brand` gradient in
`components/Activity/work/WorkPreviewCard.tsx`, and it was wrong: every card, payment widget, and
markdown block reused from the product is built for a white background, so a dark surface meant
re-theming each one and the result read as a separate app wearing ResearchHub's parts.

The rules that follow from a light surface:
- Cards and panels are white on the gray, separated by `border-gray-200` and `shadow-sm` rather than
  by luminance. The reused components then need no color changes at all.
- Text is the product's own ramp: `text-gray-900` for primary, `text-gray-500`/`text-gray-400` for
  secondary and metadata.
- Blue (`#3971ff`, exposed as both `primary-500` and `rhBlue-500` in `app/styles/colors.ts` →
  `tailwind.config.ts`) is reserved for what the AI is doing or asking: the thinking line, the
  streaming caret, quick-reply hovers, the send button, active document sections.

### 6.2 Proposal cards

Proposal lists in chat must render with the real feed card, not a bespoke one.

- The canonical card is **`components/Funding/ProposalWorkCard.tsx`**, which composes
  `components/Activity/work/WorkPreviewCard.tsx` (frosted full-bleed image + metadata bar) with
  `ActivityWorkMetadata` and `ActivityWorkActions`, minus the activity-feed actor header. It is
  exactly the card used on the real grant page's Proposals tab.
- It takes a single prop: `entry: FeedEntry`. Produce `FeedEntry` objects by running the captured
  raw API JSON through the existing `transformFeedEntry` (`types/feed.ts`) — the same path
  `FeedService.getFeed` uses. **Do not hand-author `FeedEntry` objects.**
- Its context dependencies (`CurrencyPreferenceContext`, `ExchangeRateContext`,
  `NavigationContext`) are all already mounted in `ClientProviders`, so it works inside the overlay
  as-is.
- If the card's light styling fights the blue background, adjust the *container* around it. Do not
  fork the card.

### 6.3 Payment

The funding step must present the real ResearchHub payment options, so the funder recognizes the
flow he would actually use.

- Reference: **`components/Funding/PaymentWidget.tsx`** — an expandable method selector offering
  Funding Credits, ResearchCoin (RSC), Donor-Advised Fund via Endaoment, Credit Card, and Apple Pay
  / Google Pay (PayPal is hidden; there is no on-chain crypto option — do not invent one).
- Reusing it verbatim requires `StripeProvider`, `useWalletAvailability()`, `EndaomentProvider`,
  and real balances. **Prefer** wrapping the real widget with mocked props if that can be made to
  render reliably; **fall back** to a faithful visual clone driven by fixtures if Stripe/Endaoment
  initialization proves flaky in the demo environment. A crashing overlay is far worse than a
  mocked widget.
- Either way: the method list, ordering, labels, and the confirm affordance must match the real
  widget, and confirming must advance the conversation rather than open a modal.

### 6.4 The drafted document

The right panel must read as **an actual document**, not a bulleted summary of one: document
typography, section headings, body prose, generous margins.

- Strongest option: render it with the existing TipTap editor
  (`components/Editor/components/BlockEditor/BlockEditor.tsx` + `useBlockEditor` + `ExtensionKit`)
  in read-only mode, so it uses the same type stack as the notebook and grant pages.
- If TipTap setup is disproportionate to the demo, a static renderer is acceptable — but it must
  match ResearchHub document typography, not chat typography.

---

## 7. What to steal from the notebook

`app/notebook/NotebookClientLayout.tsx` → `components/Notebook/NoteEditorLayout.tsx` →
`components/Notebook/AgentChat/*` is a working, production AI-alongside-document system. It is the
closest prior art in the repo and should be read before designing anything, but it should not
constrain the design — it is a right-side assistant next to a document, and AI Mode inverts that.

Worth borrowing:

| From | File | Why |
|---|---|---|
| Chat transcript + composer structure | `AgentChat/ChatTranscript.tsx`, `ChatComposer.tsx` | Established message/composer layout and send/stop affordances |
| Markdown message rendering | `AgentChat/MarkdownMessage.tsx` | Consistent assistant prose styling |
| Progress + activity narration | `AgentChat/ExecutionProgress.tsx`, `ActivityFeed.tsx` | The "thinking / doing" texture that makes streaming feel real; `humanizeLabel` for tool-step copy |
| Resizable docked panel | `hooks/useAgentChatWidth.ts` | Min/max-clamped, localStorage-persisted width |
| Streaming edits into a document | `Notebook/NoteReview/noteDiffOverlay.ts` | The precedent for AI-authored content appearing inside a real editor with visible insertions |
| Chat history picker | `AgentChat/ChatPicker.tsx` | Prior art for the conversation sidebar |

Deliberately **not** borrowed: the real REST/WebSocket streaming stack (`useNotebookChat`,
`useNotebookChatSocket`, `services/notebookChat.service.ts`) and the accept/reject review gate.
AI Mode is scripted and its document is authored by the assistant alone.

---

## 8. Must-have checklist

Explicit constraints from the brief, plus the ones that make or break the demo:

- [x] New top-bar icon; opens an overlay, **never navigates**; snappy, lazy-loaded, `Esc` closes
- [x] Three-panel layout: conversations (left) + chat (center) always; document (right) contextual
- [x] For a **new** conversation, the composer is **centered in the middle of the panel**
      (Claude/Cursor home state) with the three options — Open an RFP / Draft a new proposal /
      Get updates — presented alongside it. It docks to the bottom once the conversation starts
- [x] Light gray surface with brand blue as the accent; reused components need no re-theming
- [x] Proposals render via `WorkPreviewCard` / `ProposalWorkCard`, fed by `transformFeedEntry`
- [x] Right panel is a real, progressively-assembled document with document typography
- [x] Simulated thinking + progressive text streaming on every assistant turn
- [x] Quick replies on every assistant turn that waits on the funder. The opening ask wants his own
      material, and the drafting turns don't wait at all — they chain on a timer
- [x] Assistant turns are unadorned text at reading size, with no avatar or role badge per message
- [x] Guardrails step with working AI-managed / self-managed modes at a 3.5 minimum review score,
      defaulting to self-managed and hidden entirely unless the demo controls turn it on
- [x] Payment step presenting the real ResearchHub payment methods at $200,000
- [x] "RFP is live" state links out to the real grant page on production
- [x] Updates checkpoints 1–4: reviewers invited, 4 real proposals, peer reviews, then allocations
      with **per-proposal rationale**, one proposal held, totals reconciling to $200,000
- [x] Conversations persist across navigation **and** reload
- [x] "Reset demo" control returns to a blank slate, leaving the demo-control switches alone
- [x] Demo-control panel bottom-right; hiding a beat drops its stage rather than rewriting neighbors
- [x] Overlay z-index below `BaseModal` (9999) and `Tooltip` (10000); body scroll locked

---

## 9. Build order

Each milestone should be independently demoable, so the build can be cut short at any point and
still show something.

1. **Shell.** Context + provider wiring + top-bar icon + three-panel frame + surface treatment +
   open/close/persist. Demoable: an empty but beautiful AI Mode.
2. **Chat engine.** Block model, script state machine, streaming simulation, quick replies,
   composer, home state, conversation sidebar.
3. **RFP track phases 1–3.** Conversation beats plus the document panel assembling section by
   section. This is the longest single piece of copywriting — budget real time for the prose.
4. **RFP track phases 4–6.** Payment, guardrails, live-RFP confirmation and link-out.
5. **Updates track.** Both checkpoints, real proposal cards, allocation summary with rationale.
6. **Polish pass.** Timing of the streaming beats, transitions, empty/loading states, one
   end-to-end rehearsal on the actual demo machine and browser.

Copy quality is a first-class deliverable, not a finishing touch. The assistant's voice — concise,
domain-fluent, always proposing the next step — is most of what will be judged.

---

## 10. Acceptance: the demo run-through

The prototype is done when this can be performed start to finish without a stumble:

1. Open ResearchHub. Click the AI icon in the top bar. The overlay appears instantly over the page.
2. The home state shows a centered composer and three options. Choose **Open an RFP**.
3. It asks what you want to be true a year from now, and invites the source. Paste the protocol
   video and a line of your own reasoning. It comes back having read both: the Davidovits
   hypothesis, the water-glass gap, the 168 °C eutectic, and the fact that nobody has replicated it.
   Type **200K**. It brainstorms three research axes; agree.
4. The document panel opens and the RFP assembles section by section, hands off, and keeps drafting
   with no further input, ending in a complete Megalithic Geopolymer Studies RFP. Touch nothing here.
5. Fund it: $200,000, real payment methods, confirm. The assistant confirms the money and reads the
   supervised policy back — a 3.5 bar, recommendations only, nothing moving without you.
6. The RFP goes live. Click through to the real grant page on researchhub.com; it opens in a new tab
   with the conversation still on screen behind it.
7. Ask for updates and keep asking. Reviewers invited, then 4 real proposal cards, then a peer review
   per proposal with its reviewer, then $200,000 allocated across three proposals with per-proposal
   rationale and one held at 3.0 pending a second review. Open a proposal along the way: the overlay
   closes and navigates; reopen AI Mode and the conversation is exactly where it was.
8. Hit "Reset demo". The sidebar empties and the home state returns. Do it again.
9. Flip **Offer AI-managed funding** on in the bottom-right panel and run the RFP track again: the
   delegation step now appears after payment, and choosing AI-managed changes the policy read-back
   and the tone of the allocation checkpoint.

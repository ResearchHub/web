'use client';

import type { ComponentType } from 'react';
import { ClipboardCheck, HandCoins, Lightbulb, PenLine, SquarePen, Telescope } from 'lucide-react';
import { cn } from '@/utils/styles';

/** What kind of document the note is, which decides its opening moves. */
export type ChatPresetNoteKind = 'rfp' | 'proposal' | 'other';

export interface ChatPreset {
  readonly id: string;
  readonly label: string;
  /** Short form for the chips over the document. */
  readonly chipLabel: string;
  /** One line under the label: what the move does, in the user's own terms. */
  readonly description: string;
  readonly icon: ComponentType<{ className?: string }>;
  /** Loaded into the composer as an editable starting point, not sent. */
  readonly message: string;
}

// ---- Proposals: the side asking for money ----

/**
 * When the note already names the RFP it answers, the writing presets lead
 * with it: the assistant has a tool that reads the selection, and the draft
 * is only as good as its fit to that call.
 */
const READ_RFP_FIRST =
  'Read the RFP this proposal applies to first and shape the work to its requirements. ';

const draftProposal = (hasRfp: boolean): ChatPreset => ({
  id: 'draft-proposal',
  label: 'Draft a proposal',
  chipLabel: 'Draft',
  description: 'Based on your researcher profile',
  icon: PenLine,
  message:
    (hasRfp ? READ_RFP_FIRST : '') +
    'Draft this proposal from my researcher profile. Read my profile, ask me only what it ' +
    'does not cover, then write the draft into the note, starting with three hypotheses.',
});

const strengthenProposal = (hasRfp: boolean): ChatPreset => ({
  id: 'strengthen-proposal',
  label: 'Strengthen this proposal',
  chipLabel: 'Strengthen',
  description: 'Tighten it and fill the gaps',
  icon: SquarePen,
  message:
    (hasRfp ? 'Check it against the RFP it applies to. ' : '') +
    'Review the proposal in this note and make it stronger: tighten the writing, fill in what ' +
    'is missing, and flag anything a reviewer would push back on.',
});

const PEER_REVIEW_PROPOSAL: ChatPreset = {
  id: 'peer-review',
  label: 'Peer review',
  chipLabel: 'Peer review',
  description: 'Peer review this document',
  icon: ClipboardCheck,
  message:
    'Peer review this proposal as a reviewer would: assess methodology, significance, and ' +
    'feasibility, and list concrete revisions ranked by impact. Do not edit the note.',
};

const BRAINSTORM_PROPOSAL: ChatPreset = {
  id: 'brainstorm',
  label: 'Help me brainstorm',
  chipLabel: 'Brainstorm',
  description: 'Ideas about this research proposal',
  icon: Lightbulb,
  message:
    'Brainstorm with me on this proposal: alternative hypotheses, study designs, and angles I ' +
    'have not considered. Give me a short list to react to.',
};

/**
 * The funding search in a note-shaped and an author-shaped form. A written
 * note is the better brief, and an empty one is no brief at all, so the search
 * falls back to the person doing it. Only offered while no RFP is selected:
 * once one is, the question is answered.
 */
const FUNDING_FROM_NOTE: ChatPreset = {
  id: 'funding',
  label: 'Find me funding',
  chipLabel: 'Find funding',
  description: 'Open RFPs that fit this work',
  icon: HandCoins,
  message:
    'Find open RFPs I could apply to that fit this work, and tell me why each one is a match.',
};

const FUNDING_FROM_EXPERTISE: ChatPreset = {
  id: 'funding',
  label: 'Find me funding',
  chipLabel: 'Find funding',
  description: 'Open RFPs that fit your expertise',
  icon: HandCoins,
  message:
    'Find open RFPs I could apply to based on my expertise, and tell me why each one is a match.',
};

// ---- RFPs: the side handing out money ----

const DRAFT_RFP: ChatPreset = {
  id: 'draft-rfp',
  label: 'Draft an RFP',
  chipLabel: 'Draft',
  description: 'From what you want to fund',
  icon: PenLine,
  message:
    'Help me draft this RFP. Ask me for anything you still need to know about the work I want to ' +
    'fund, then write the draft into the note.',
};

const STRENGTHEN_RFP: ChatPreset = {
  id: 'strengthen-rfp',
  label: 'Strengthen this RFP',
  chipLabel: 'Strengthen',
  description: 'Tighten it and fill the gaps',
  icon: SquarePen,
  message:
    'Review the RFP in this note and make it stronger: tighten the writing, fill in what ' +
    'applicants would need to know, and flag anything ambiguous about scope, budget, or deadline.',
};

const REVIEW_RFP: ChatPreset = {
  id: 'review-rfp',
  label: 'Review this RFP',
  chipLabel: 'Review',
  description: 'How it reads to applicants',
  icon: ClipboardCheck,
  message:
    'Read this RFP as an applicant would and tell me where it is unclear or incomplete: scope, ' +
    'eligibility, budget, deadline, and evaluation criteria. List concrete fixes ranked by ' +
    'impact. Do not edit the note.',
};

const BRAINSTORM_RFP: ChatPreset = {
  id: 'brainstorm',
  label: 'Help me brainstorm',
  chipLabel: 'Brainstorm',
  description: 'Topics worth funding in this area',
  icon: Lightbulb,
  message:
    'Brainstorm with me on this RFP: topics worth funding in this area, gaps in the field, and ' +
    'what a strong proposal would look like. Give me a short list to react to.',
};

// ---- Everything else ----

const RESEARCH_FROM_NOTE: ChatPreset = {
  id: 'research',
  label: 'Help me research',
  chipLabel: 'Research',
  description: 'Web and scholarly sources, summarised',
  icon: Telescope,
  message:
    'Help me research this. Search the web and the scholarly literature for the work most ' +
    'relevant to this note, and summarise what I should know, with sources.',
};

const RESEARCH_FROM_EXPERTISE: ChatPreset = {
  id: 'research',
  label: 'Help me research',
  chipLabel: 'Research',
  description: 'Web and scholarly sources, summarised',
  icon: Telescope,
  message:
    'Help me research. Search the web and the scholarly literature for the work most relevant ' +
    'to my expertise, and summarise what I should know, with sources.',
};

export interface ChatPresetContext {
  readonly noteIsEmpty: boolean;
  readonly noteKind: ChatPresetNoteKind;
  readonly hasSelectedRfp: boolean;
}

/**
 * The moves are tied to what the document is. A proposal is written, reviewed
 * and brainstormed as an application; an RFP as a call to the field. Reviewing
 * needs something to review, so it waits for a draft, and the writing move
 * turns from drafting into strengthening once there is one.
 */
export function chatPresetsFor({
  noteIsEmpty,
  noteKind,
  hasSelectedRfp,
}: ChatPresetContext): ChatPreset[] {
  switch (noteKind) {
    case 'proposal': {
      const presets = [
        noteIsEmpty ? draftProposal(hasSelectedRfp) : strengthenProposal(hasSelectedRfp),
        ...(noteIsEmpty ? [] : [PEER_REVIEW_PROPOSAL]),
        BRAINSTORM_PROPOSAL,
      ];
      if (!hasSelectedRfp) presets.push(noteIsEmpty ? FUNDING_FROM_EXPERTISE : FUNDING_FROM_NOTE);
      return presets;
    }
    case 'rfp':
      return [
        noteIsEmpty ? DRAFT_RFP : STRENGTHEN_RFP,
        ...(noteIsEmpty ? [] : [REVIEW_RFP]),
        BRAINSTORM_RFP,
      ];
    default:
      return [noteIsEmpty ? RESEARCH_FROM_EXPERTISE : RESEARCH_FROM_NOTE];
  }
}

interface ChatPresetsProps extends ChatPresetContext {
  readonly onSelect: (message: string) => void;
  readonly disabled: boolean;
}

/**
 * Opening moves offered on the empty chat screen. Picking one writes its
 * message into the composer for the user to edit and send, so the specifics a
 * generic instruction can't carry go in before the assistant sees it.
 */
export function ChatPresets({
  noteIsEmpty,
  noteKind,
  hasSelectedRfp,
  onSelect,
  disabled,
}: ChatPresetsProps) {
  return (
    // Stacked, not the grid this pattern usually wears: the panel is 360px at
    // its narrowest, where side-by-side cards would wrap every label.
    <div className="flex w-full max-w-sm flex-col gap-2">
      {chatPresetsFor({ noteIsEmpty, noteKind, hasSelectedRfp }).map((preset) => (
        <button
          key={preset.id}
          type="button"
          onClick={() => onSelect(preset.message)}
          disabled={disabled}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5',
            'text-left transition-colors hover:border-primary-200 hover:bg-primary-50',
            'focus:outline-none focus-visible:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-500',
            'disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-gray-200 disabled:hover:bg-white'
          )}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
            <preset.icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-gray-900">{preset.label}</span>
            <span className="block text-xs text-gray-500">{preset.description}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

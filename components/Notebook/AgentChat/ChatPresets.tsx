'use client';

import type { ComponentType } from 'react';
import { HandCoins, PenLine, SquarePen, Telescope } from 'lucide-react';
import { cn } from '@/utils/styles';

interface ChatPreset {
  readonly id: string;
  readonly label: string;
  readonly icon: ComponentType<{ className?: string }>;
  /** Loaded into the composer as an editable starting point, not sent. */
  readonly message: string;
}

/**
 * An RFP is the funder's own call, so it takes one writing preset in both
 * states — worded to work whether the note is blank or half-written, since the
 * assistant reads the note either way.
 */
const DRAFT_RFP: ChatPreset = {
  id: 'draft-rfp',
  label: 'Draft RFP',
  icon: PenLine,
  message:
    'Help me draft this RFP. Ask me for anything you still need to know about the work I want to ' +
    'fund, then write the draft into the note.',
};

const DRAFT_PROPOSAL: ChatPreset = {
  id: 'draft-proposal',
  label: 'Draft proposal',
  icon: PenLine,
  message:
    'Help me draft this proposal. Ask me for anything you still need to know about the work, ' +
    'then generate me three hypotheses to start.',
};

const EDIT_PROPOSAL: ChatPreset = {
  id: 'edit-proposal',
  label: 'Edit proposal',
  icon: SquarePen,
  message:
    'Review the proposal in this note and make it stronger — tighten the writing, fill in what ' +
    'is missing, and flag anything a reviewer would push back on.',
};

/**
 * The two searches, each in a note-shaped and an author-shaped form. Both have
 * to match on something: a written note is the better brief, and an empty one
 * is no brief at all, so the search falls back to the person doing it. A pair
 * shares its id, since the two never appear together.
 */
const RESEARCH_FROM_NOTE: ChatPreset = {
  id: 'research',
  label: 'Help me research',
  icon: Telescope,
  message:
    'Help me research this. Search the web and the scholarly literature for the work most ' +
    'relevant to this note, and summarise what I should know, with sources.',
};

const RESEARCH_FROM_EXPERTISE: ChatPreset = {
  id: 'research',
  label: 'Help me research',
  icon: Telescope,
  message:
    'Help me research. Search the web and the scholarly literature for the work most relevant ' +
    'to my expertise, and summarise what I should know, with sources.',
};

const FUNDING_FROM_NOTE: ChatPreset = {
  id: 'funding',
  label: 'Find me funding',
  icon: HandCoins,
  message:
    'Find open RFPs I could apply to that fit this work, and tell me why each one is a match.',
};

const FUNDING_FROM_EXPERTISE: ChatPreset = {
  id: 'funding',
  label: 'Find me funding',
  icon: HandCoins,
  message:
    'Find open RFPs I could apply to based on my expertise, and tell me why each one is a match.',
};

/**
 * An RFP note is written by the side handing out the money, so it gets neither
 * the funding search nor the proposal-shaped review — only the call itself and
 * the field it is calling into. A proposal note takes all three, its writing
 * preset turning on whether there is a draft to improve yet.
 */
function presetsFor(noteIsEmpty: boolean, isRfp: boolean): ChatPreset[] {
  const research = noteIsEmpty ? RESEARCH_FROM_EXPERTISE : RESEARCH_FROM_NOTE;
  if (isRfp) return [DRAFT_RFP, research];
  return [
    noteIsEmpty ? DRAFT_PROPOSAL : EDIT_PROPOSAL,
    research,
    noteIsEmpty ? FUNDING_FROM_EXPERTISE : FUNDING_FROM_NOTE,
  ];
}

interface ChatPresetsProps {
  readonly noteIsEmpty: boolean;
  readonly isRfp: boolean;
  readonly onSelect: (message: string) => void;
  readonly disabled: boolean;
}

/**
 * Opening moves offered on the empty chat screen. Picking one writes its
 * message into the composer for the user to edit and send, so the specifics a
 * generic instruction can't carry go in before the assistant sees it.
 */
export function ChatPresets({ noteIsEmpty, isRfp, onSelect, disabled }: ChatPresetsProps) {
  return (
    // Stacked, not the grid this pattern usually wears: the panel is 360px at
    // its narrowest, where side-by-side cards would wrap every label.
    <div className="flex w-full max-w-xs flex-col gap-2">
      {presetsFor(noteIsEmpty, isRfp).map((preset) => (
        <button
          key={preset.id}
          type="button"
          onClick={() => onSelect(preset.message)}
          disabled={disabled}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3 py-2.5',
            'text-left text-sm font-medium text-gray-700 transition-colors',
            'hover:border-primary-200 hover:bg-primary-50 hover:text-gray-900',
            'focus:outline-none focus-visible:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-500',
            'disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-gray-200',
            'disabled:hover:bg-white disabled:hover:text-gray-700'
          )}
        >
          <preset.icon className="h-4 w-4 shrink-0 text-primary-500" aria-hidden="true" />
          {preset.label}
        </button>
      ))}
    </div>
  );
}

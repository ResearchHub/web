import type { ComponentType } from 'react';
import { HandCoins, Megaphone, PenLine, Telescope } from 'lucide-react';

/**
 * User-facing copy for AI Mode, in one place so the product name and the
 * empty-state wording can change without touching components.
 */
export const AI_MODE_NAME = 'Assistant';

export const AI_MODE_EMPTY_HEADING = 'What do you want to work on?';

export const AI_MODE_EMPTY_SUBHEADING =
  'Describe what you need. The assistant will ask a few questions, then write it up as a document you keep in your notebook.';

export interface StarterPrompt {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: ComponentType<{ className?: string }>;
  /** Loaded into the composer as an editable starting point, never sent as-is. */
  readonly message: string;
}

/**
 * Static starter prompts for the empty state. They only prefill the composer;
 * the backend does not supply suggestions. The two writing prompts mirror the
 * notebook's own presets: a funder drafting a request for proposals, and a
 * researcher drafting a proposal. Placeholder wording, to be replaced by
 * product copy.
 */
export const AI_MODE_STARTER_PROMPTS: readonly StarterPrompt[] = [
  {
    id: 'draft-rfp',
    title: 'Draft a request for proposals',
    description: 'Fund specific research you care about',
    icon: Megaphone,
    message:
      'Help me draft a request for proposals. Ask me for anything you still need to know about ' +
      'the work I want to fund, then create a note and write the RFP into it.',
  },
  {
    id: 'draft-proposal',
    title: 'Draft a proposal',
    description: 'Raise money for your research',
    icon: PenLine,
    message:
      'Help me draft a research proposal. Ask me for anything you still need to know about the ' +
      'work, then create a note and write the proposal into it, starting with three hypotheses.',
  },
  {
    id: 'research',
    title: 'Help me research',
    description: 'Cited overview of the literature',
    icon: Telescope,
    message:
      'Help me research a topic. Search the web and the scholarly literature for the most ' +
      'relevant work and summarise what I should know, with sources. The topic is ',
  },
  {
    id: 'funding',
    title: 'Find me funding',
    description: 'Open RFPs that fit your work',
    icon: HandCoins,
    message:
      'Find open RFPs I could apply to based on my expertise, and tell me why each one is a match.',
  },
];

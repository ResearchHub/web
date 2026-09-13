import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faBullhorn,
  faFileSignature,
  faMagnifyingGlassDollar,
} from '@fortawesome/pro-light-svg-icons';

/**
 * User-facing copy for AI Mode, in one place so the product name and the
 * empty-state wording can change without touching components.
 */
export const AI_MODE_NAME = 'ResearchHub AI';

/** Greeting on the new-conversation screen; the name is filled in at render. */
export const aiModeGreeting = (firstName: string | null | undefined): string =>
  firstName?.trim() ? `Welcome, ${firstName.trim()}` : 'Welcome';

export interface StarterPrompt {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  /** Same icon family as the sidebar's Publish menu. */
  readonly icon: IconDefinition;
  /** Sent as the conversation's first message when the card is picked. */
  readonly message: string;
}

/**
 * Starter cards for the new-conversation screen. Picking one starts the
 * conversation with its message; the backend does not supply suggestions.
 * Titles and subtext mirror the sidebar's Publish menu.
 */
export const AI_MODE_STARTER_PROMPTS: readonly StarterPrompt[] = [
  {
    id: 'draft-rfp',
    title: 'Draft a Request for Proposal',
    description: 'Fund specific research you care about',
    icon: faBullhorn,
    message:
      'Help me draft a request for proposals. Ask me for anything you still need to know about ' +
      'the work I want to fund, then create a note and write the RFP into it.',
  },
  {
    id: 'draft-proposal',
    title: 'Draft a Research Proposal',
    description: 'Raise money for your research',
    icon: faFileSignature,
    message:
      'Help me draft a research proposal. Ask me for anything you still need to know about the ' +
      'work, then create a note and write the proposal into it, starting with three hypotheses.',
  },
  {
    id: 'funding',
    title: 'Find me funding',
    description: 'Open RFPs that fit your work',
    icon: faMagnifyingGlassDollar,
    message:
      'Find open RFPs I could apply to based on my expertise, and tell me why each one is a match.',
  },
];

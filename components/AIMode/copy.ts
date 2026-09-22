import type { FundingIntent } from '@/components/Funding/fundingDirection';

/**
 * User-facing copy for AI Mode, in one place so the product name and the
 * new-conversation wording can change without touching components.
 */
export const AI_MODE_NAME = 'ResearchHub AI';

/** Greeting on the new-conversation screen; the name is filled in at render. */
export const aiModeGreeting = (firstName: string | null | undefined): string =>
  firstName?.trim() ? `Welcome, ${firstName.trim()}` : 'Welcome';

/** What the intent toggle calls each side, and what the composer asks for. */
export const INTENT_COPY: Record<FundingIntent, { label: string; placeholder: string }> = {
  fund: {
    label: 'I want to fund',
    placeholder: 'Describe the research you want to fund…',
  },
  need_funding: {
    label: 'I need funding',
    placeholder: 'Describe the research you need funding for…',
  },
};

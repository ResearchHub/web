import type { FundingIntent } from '@/components/Funding/fundingDirection';

/**
 * User-facing copy for AI Mode, in one place so the product name and the
 * new-conversation wording can change without touching components.
 */
export const AI_MODE_NAME = 'Workspace';

/** Greeting on the new-conversation screen; the name is filled in at render. */
export const aiModeGreeting = (firstName: string | null | undefined): string =>
  firstName?.trim() ? `Welcome, ${firstName.trim()}` : 'Welcome';

/** What the intent tabs call each side, the line under the greeting, and what the composer asks for. */
export const INTENT_COPY: Record<
  FundingIntent,
  { label: string; tagline: string; placeholder: string }
> = {
  fund: {
    label: 'I want to fund',
    tagline: 'The most efficient way to fund science.',
    placeholder: 'Describe the research you want to fund…',
  },
  need_funding: {
    label: 'I need funding',
    tagline: 'Turn your proposal into funded science.',
    placeholder: 'Describe the research you need funding for…',
  },
};

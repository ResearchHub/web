import type { FundingIntent } from '@/components/Funding/fundingDirection';

/**
 * User-facing copy for AI Mode, in one place so the product name and the
 * new-conversation wording can change without touching components.
 */
export const AI_MODE_NAME = 'Workspace';

/**
 * What the new-conversation screen is called, in the top strip and on the
 * sidebar's button: named for what it will produce, not for the chat.
 */
export const newConversationTitle = (intent: FundingIntent): string =>
  intent === 'fund' ? 'New RFP' : 'New proposal';

/** The heading of the new-conversation screen. */
export const AI_MODE_GREETING = 'Let’s get started';

/** The line under the greeting and what the composer asks for, per side of the money. */
export const INTENT_COPY: Record<FundingIntent, { tagline: string; placeholder: string }> = {
  fund: {
    tagline: 'The most efficient way to fund science.',
    placeholder: 'Describe the research you want to fund…',
  },
  need_funding: {
    tagline: 'Turn your proposal into funded science.',
    placeholder: 'Describe the research you need funding for…',
  },
};

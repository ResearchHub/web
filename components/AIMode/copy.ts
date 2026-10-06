import type { FundingIntent } from '@/components/Funding/fundingDirection';

/**
 * User-facing copy for the workspace, in one place so the product name and
 * the new-draft wording can change without touching components.
 */
export const AI_MODE_NAME = 'Workspace';

/**
 * What the new-draft screen is called, in the app's top bar: named for what
 * it will produce, not for the chat.
 */
export const newDraftTitle = (intent: FundingIntent): string =>
  intent === 'fund' ? 'New RFP' : 'New proposal';

/** A new draft's title until the assistant (or the user) names it. */
export const untitledDraftTitle = (intent: FundingIntent): string =>
  intent === 'fund' ? 'Untitled RFP' : 'Untitled proposal';

/** The heading of the new-draft screen. */
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

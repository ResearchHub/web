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
    tagline: 'The fastest way to fund science.',
    placeholder: 'Describe the research you want to fund…',
  },
  need_funding: {
    tagline: 'Turn your proposal into funded science.',
    placeholder: 'Describe the research you need funding for…',
  },
};

/**
 * Examples under a new RFP's composer, to show a funder what the assistant
 * can do. The label is what the pill reads; clicking it sends the message as
 * the user's first, so the chat shows exactly what was asked. No amounts: the
 * assistant asks about the budget itself.
 */
export const RFP_START_PRESETS: readonly { readonly label: string; readonly message: string }[] = [
  {
    label: 'Fund a cure for cancer',
    message:
      'I want to fund research toward a cure for cancer. Help me write an RFP that will reach the labs doing the most promising work.',
  },
  {
    label: 'Fund novel longevity research',
    message:
      'I want to fund novel research on the biology of aging that could lead to longer, healthier lives. Help me write an RFP for it.',
  },
  {
    label: 'Back new Alzheimer’s treatments',
    message:
      'I want to back research into new ways to prevent or treat Alzheimer’s disease. Help me write an RFP for it.',
  },
  {
    label: 'Support rare disease research',
    message:
      'I want to support research on a rare disease that few others fund. Help me write an RFP that will reach the right labs.',
  },
  {
    label: 'Advance mental health care',
    message:
      'I want to fund research that could lead to better treatments for depression and anxiety. Help me write an RFP for it.',
  },
];

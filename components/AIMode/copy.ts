/**
 * User-facing copy for AI Mode, in one place so the product name and the
 * empty-state wording can change without touching components.
 */
export const AI_MODE_NAME = 'Assistant';

export const AI_MODE_EMPTY_HEADING = 'What do you want to work on?';

export const AI_MODE_EMPTY_SUBHEADING =
  'Describe what you need. The assistant will ask a few questions, then write it up as a document you keep in your notebook.';

/**
 * Static starter prompts for the empty state. They only prefill the composer;
 * the backend does not supply suggestions. Placeholder wording — to be
 * replaced by product copy.
 */
export const AI_MODE_STARTER_PROMPTS: readonly { title: string; message: string }[] = [
  {
    title: 'Write a request for proposals',
    message: 'Help me write a request for proposals to fund research on ',
  },
  {
    title: 'Scope a funding program',
    message:
      'I want to fund research in a specific area. Help me decide what to ask for and how to judge applications. The area is ',
  },
  {
    title: 'Summarize the literature',
    message: 'Give me a short, cited overview of the current evidence on ',
  },
];

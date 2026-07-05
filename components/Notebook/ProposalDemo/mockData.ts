/**
 * Mock data powering the proposal-demo chat prototype. Nothing here touches
 * the network — the "AI" is fully scripted for demo purposes.
 */

export interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
}

export const RH_AI_AVATAR_SRC = '/images/rh-ai-avatar.png';

export const DEMO_USER_FIRST_NAME = 'Ruslan';

export const ORCID_PROFILE = {
  id: '0000-0003-3376-3453',
  url: 'https://orcid.org/0000-0003-3376-3453',
};

export const OPENALEX_PROFILE = {
  id: 'A5002943149',
  url: 'https://openalex.org/authors/A5002943149',
};

export const SEED_MESSAGES: ChatMessage[] = [
  {
    id: 'seed-1',
    role: 'assistant',
    content: `Hi ${DEMO_USER_FIRST_NAME} — I drafted this preregistration for you based on your ORCID and OpenAlex profiles. It builds on your work in vascular biology and cellular senescence, framing a proposal around Sirt6 in microvascular mural cells.`,
  },
  {
    id: 'seed-2',
    role: 'assistant',
    content:
      'Everything in the document is fully editable. Tell me what you want to change and I can revise sections, tighten the scope, expand the methods, or draft a budget.',
  },
];

export const SUGGESTION_CHIPS: string[] = [
  'Tighten the methods section',
  'Suggest a budget breakdown',
  'Find related funding',
];

// Rotating pool of canned replies. We cycle through these as the user sends
// messages so the conversation feels responsive without a real model.
export const CANNED_REPLIES: string[] = [
  "Good call. I've sharpened that section — I made the aims more specific, tied each one to a measurable outcome, and trimmed the background so the rationale reads faster. Want me to apply the same treatment to the rest of the document?",
  'Here is a first pass at a budget: personnel (2 postdocs, 1 technician), consumables for the mural-cell isolation and senescence assays, small-animal costs for the ischemic limb model, and 10% for dissemination. I can break this into a per-year table if that helps.',
  'Based on your profile, a few funding routes fit well: NIH R01 (NHLBI), AHA Innovative Project Award, and the ResearchHub Foundation open call for aging and regeneration. I can tailor the proposal framing to whichever you prefer.',
  "Done — I revised the language to be more precise and added a sentence connecting it back to your prior findings. Let me know if the tone feels right or if you'd like it more concise.",
];

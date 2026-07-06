/**
 * Mock data powering the proposal-demo chat prototype. Nothing here touches
 * the network — the "AI" is fully scripted for demo purposes.
 */

export interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
}

export const DEMO_USER_FIRST_NAME = 'Ruslan';

export const ORCID_PROFILE = {
  id: '0000-0003-3376-3453',
  url: 'https://orcid.org/0000-0003-3376-3453',
};

export const OPENALEX_PROFILE = {
  id: 'A5002943149',
  url: 'https://openalex.org/authors/A5002943149',
};

// Scripted "tool calls" shown while the AI pretends to research the user and
// draft the proposal during the cinematic intro sequence.
export interface IntroToolStep {
  id: string;
  /** Label shown while the step is "running" (with a spinner). */
  runningLabel: string;
  /** Label shown once the step completes (with a check). */
  doneLabel: string;
  /** Supporting detail (e.g. the profile ID that was read). */
  detail?: string;
}

export const INTRO_TOOL_STEPS: IntroToolStep[] = [
  {
    id: 'orcid',
    runningLabel: 'Reading your ORCID profile…',
    doneLabel: 'Read your ORCID profile',
    detail: ORCID_PROFILE.id,
  },
  {
    id: 'openalex',
    runningLabel: 'Scanning your publications on OpenAlex…',
    doneLabel: 'Found your OpenAlex author record',
    detail: OPENALEX_PROFILE.id,
  },
  {
    id: 'draft',
    runningLabel: 'Drafting your preregistration…',
    doneLabel: 'Drafted your preregistration',
  },
];

// Copy for the artifact card that represents the generated document in chat.
export const ARTIFACT_CARD = {
  kind: 'Preregistration',
  status: 'Draft ready',
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

// Google-Docs-"suggesting-mode" color used for the fake AI edits in the doc
// (strikethrough on removed text, colored insertions).
export const SUGGESTION_COLOR = '#B80672';

// Scripted document edits applied when the user sends a message: the Nth send
// "revises" the Nth body paragraph — a phrase gets struck through and a
// replacement is typed in word by word, Google Docs suggesting-mode style.
export interface SuggestedEditSpec {
  /** Index of the first word to strike through (0-based, within the paragraph). */
  deleteWordStart: number;
  /** Number of words to strike through. */
  deleteWordCount: number;
  /** Replacement text typed in (colored) right after the struck phrase. */
  insertText: string;
}

export const SUGGESTED_EDITS: SuggestedEditSpec[] = [
  {
    deleteWordStart: 6,
    deleteWordCount: 9,
    insertText:
      'with a sharper focus on how mural-cell Sirt6 loss propagates paracrine senescence to the neighboring endothelium',
  },
  {
    deleteWordStart: 10,
    deleteWordCount: 8,
    insertText:
      'which we will quantify with single-cell transcriptomics of the ischemic hindlimb at days 3, 7, and 14',
  },
];

// One-click rewrite instructions offered in the selection toolbar's Rewrite
// input. Each maps to a canned "rewritten" replacement so the demo is
// deterministic regardless of what text is selected. Free-typed instructions
// fall back to REWRITE_DEFAULT_RESULT.
export interface RewritePreset {
  label: string;
  result: string;
}

export const REWRITE_PRESETS: RewritePreset[] = [
  {
    label: 'Make it more concise',
    result:
      'Sirt6 loss in mural cells drives paracrine senescence and stalls regeneration in ischemic limbs.',
  },
  {
    label: 'Strengthen the impact',
    result:
      'these findings could establish the first senescence-targeted therapy for the millions living with non-healing ischemic limbs.',
  },
  {
    label: 'Add a supporting citation',
    result:
      'an effect consistent with recent single-cell evidence linking mural-cell dysfunction to impaired revascularization (Turiel et al., 2025).',
  },
];

export const REWRITE_DEFAULT_RESULT =
  'a clearer, more direct formulation that ties this claim back to the study’s central hypothesis.';

// Rotating pool of canned replies. We cycle through these as the user sends
// messages so the conversation feels responsive without a real model.
export const CANNED_REPLIES: string[] = [
  "Good call. I've sharpened that section — I made the aims more specific, tied each one to a measurable outcome, and trimmed the background so the rationale reads faster. Want me to apply the same treatment to the rest of the document?",
  'Here is a first pass at a budget: personnel (2 postdocs, 1 technician), consumables for the mural-cell isolation and senescence assays, small-animal costs for the ischemic limb model, and 10% for dissemination. I can break this into a per-year table if that helps.',
  'Based on your profile, a few funding routes fit well: NIH R01 (NHLBI), AHA Innovative Project Award, and the ResearchHub Foundation open call for aging and regeneration. I can tailor the proposal framing to whichever you prefer.',
  "Done — I revised the language to be more precise and added a sentence connecting it back to your prior findings. Let me know if the tone feels right or if you'd like it more concise.",
];

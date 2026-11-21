import type { SelectedGrantDetails } from '@/types/grant';

/**
 * What an RFP expects from a proposal, shown beside the workspace's start
 * screen once an RFP is picked, and the text its composer opens with. A
 * landing page that has one hands it over with the RFP (`handOffRfp`); every
 * other RFP gets `genericRfpGuide`.
 */
export interface RfpGuide {
  /** One or two sentences on what the call is after; a generic guide has none. */
  readonly summary?: string;
  /** What a proposal should cover, in order. */
  readonly include: readonly { readonly title: string; readonly text: string }[];
  /** How long a proposal should be, mid-sentence: "about 2 pages". */
  readonly length: string;
  /**
   * What the RFP offers, when its page states it better than the grant's
   * amount does: "$100k goal". Without it, the grant's amount is shown.
   */
  readonly fundingLabel?: string;
  /** What the composer opens with. `[brackets]` are for the applicant to fill in. */
  readonly starter: string;
  /** The RFP's landing page, for the full call. */
  readonly pageHref?: string;
  /** True for the guide every RFP gets, rather than one written for this RFP. */
  readonly generic?: boolean;
}

/** The composer's opening text for an RFP with no guide of its own. */
export function genericRfpStarter(rfpTitle: string): string {
  const named = rfpTitle.trim() ? `“${rfpTitle.trim()}”` : 'this RFP';
  return [
    `I’m applying to ${named}.`,
    'About me: [your background, and why you’re the right person for this]',
    'What I propose: [the question, and how you would answer it]',
  ].join('\n\n');
}

/** The guide for an RFP whose page wrote none: what any proposal covers. */
export function genericRfpGuide(grant: SelectedGrantDetails): RfpGuide {
  return {
    include: [
      { title: 'Who you are', text: 'Your background, and why you can do this.' },
      { title: 'The question', text: 'What you would find out, and why it fits the call.' },
      { title: 'How you would do it', text: 'Methods, and what result would change your mind.' },
      { title: 'What comes out', text: 'What you publish, with data and code.' },
      { title: 'Budget and timeline', text: 'What it costs, and when results are public.' },
    ],
    length: 'about 2 pages',
    starter: genericRfpStarter(grant.shortTitle),
    pageHref: grant.pageHref,
    generic: true,
  };
}

const BLANK = /\[[^\]\n]+\]/;

/** Where the first `[blank]` in `text` is, to select it; null when none is left. */
export function firstBlank(text: string): { start: number; end: number } | null {
  const match = BLANK.exec(text);
  return match ? { start: match.index, end: match.index + match[0].length } : null;
}

import {
  Building2,
  DollarSign,
  FileText,
  Image as ImageIcon,
  Target,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { PublishingFieldKey } from '@/components/Notebook/PublishingForm/completion';
import type {
  ArticleType,
  PublishingFormData,
  SelectOption,
} from '@/components/Notebook/PublishingForm/schema';

/**
 * How a detail shows its value and how it is edited:
 * - `cover`: the image across the column, above the title; set from the file picker.
 * - `people`: names after a label; edited in a search field that keeps chips.
 * - `amount`: whole US dollars after a label; edited as digits.
 * - `grant`: the Request for Proposal a proposal answers; picked in a modal.
 * - `text`: one line after a label.
 * - `paragraph`: a few sentences that stand as a paragraph under the byline.
 */
export type MastheadWidgetKind = 'cover' | 'people' | 'amount' | 'grant' | 'text' | 'paragraph';

export interface MastheadWidgetConfig {
  readonly id: string;
  /** The form field the detail shows and edits. */
  readonly field: PublishingFieldKey;
  readonly kind: MastheadWidgetKind;
  /** What the detail is called in the publish dialog's list of what is still empty. */
  readonly name: string;
  /** Leads the byline's offer to add the detail while it has no value. */
  readonly icon: LucideIcon;
  /** The byline's offer while the detail has no value, said as the thing to do: "Add cover". */
  readonly addLabel: string;
  /** What leads the value once it is set: "By Kobe Attias". A cover or a paragraph has none. */
  readonly label: string;
  /** What the detail is for, said on hover: what it means and where it shows. */
  readonly hint: string;
  /** Gets a line to itself under the title, above the other details, when this holds. */
  readonly ownLineWhen?: (values: PublishingFormData) => boolean;
  /** The detail disappears when this holds. */
  readonly hiddenWhen?: (values: PublishingFormData) => boolean;
  /** The value still shows, but can no longer be changed, when this holds. */
  readonly lockedWhen?: (values: PublishingFormData) => boolean;
}

const COVER_IMAGE: MastheadWidgetConfig = {
  id: 'coverImage',
  field: 'coverImage',
  kind: 'cover',
  icon: ImageIcon,
  name: 'Cover image',
  addLabel: 'Add cover',
  label: 'Cover image',
  hint: 'An image that represents this at a glance. It heads the published page and its card in the feed.',
};

const AUTHORS: MastheadWidgetConfig = {
  id: 'authors',
  field: 'authors',
  kind: 'people',
  icon: Users,
  name: 'Authors',
  addLabel: 'Add authors',
  label: 'By',
  hint: 'The people credited for this work, shown under its title once it is published.',
  // With none there is only the offer to add some, and that sits with the others.
  ownLineWhen: (values) => values.authors.length > 0,
};

const FUNDING_GOAL: MastheadWidgetConfig = {
  id: 'fundingGoal',
  field: 'budget',
  kind: 'amount',
  icon: DollarSign,
  name: 'Funding goal',
  addLabel: 'Set funding goal',
  label: 'Funding goal',
  hint: 'How much you are raising for this work. It cannot be changed once the fundraise is open.',
  // A fundraise that is open keeps the goal it opened with.
  lockedWhen: (values) => Boolean(values.workId),
};

const APPLYING_TO: MastheadWidgetConfig = {
  id: 'applyingTo',
  field: 'selectedGrant',
  kind: 'grant',
  icon: Target,
  name: 'RFP',
  addLabel: 'Apply to an RFP',
  label: 'Applying to',
  hint: 'The RFP this proposal answers. Its funder reviews it alongside the other applications.',
  // The offer sits among the other details; the answer gets its own line.
  ownLineWhen: (values) => values.selectedGrant != null,
  // The answer to a Request for Proposal cannot change once published.
  hiddenWhen: (values) => Boolean(values.workId),
};

const ORGANIZATION: MastheadWidgetConfig = {
  id: 'organization',
  field: 'organization',
  kind: 'text',
  icon: Building2,
  name: 'Organization',
  addLabel: 'Add organization',
  label: 'Offered by',
  hint: 'The organization offering this funding, shown as “Offered by” on the RFP.',
};

const FUNDING_AMOUNT: MastheadWidgetConfig = {
  id: 'fundingAmount',
  field: 'budget',
  kind: 'amount',
  icon: DollarSign,
  name: 'Funding amount',
  addLabel: 'Set funding amount',
  label: 'Funding amount',
  hint: 'The total you are offering through this RFP, across the proposals you fund.',
};

const CONTACTS: MastheadWidgetConfig = {
  id: 'contacts',
  field: 'contacts',
  kind: 'people',
  icon: Users,
  name: 'Contact',
  addLabel: 'Add contact',
  label: 'Contact',
  hint: 'The main point of contact for this RFP: the person responsible for it, who hears when someone comments or submits a proposal.',
};

const SHORT_DESCRIPTION: MastheadWidgetConfig = {
  id: 'shortDescription',
  field: 'shortDescription',
  kind: 'paragraph',
  icon: FileText,
  name: 'Short description',
  addLabel: 'Add short description',
  label: 'Short description',
  hint: 'A sentence or two on what this RFP funds, shown where it is listed before someone opens it.',
};

/**
 * In the order the byline keeps, lines of their own first. The cover is not
 * part of the byline once it is set, and its offer to add one comes last.
 */
const WIDGETS_BY_TYPE: Record<ArticleType, readonly MastheadWidgetConfig[]> = {
  preregistration: [COVER_IMAGE, AUTHORS, FUNDING_GOAL, APPLYING_TO],
  grant: [COVER_IMAGE, ORGANIZATION, FUNDING_AMOUNT, CONTACTS, SHORT_DESCRIPTION],
  registered_report: [COVER_IMAGE, AUTHORS],
  discussion: [AUTHORS],
};

/** The details a work of this type carries in its masthead. */
export function mastheadWidgetsFor(
  articleType: ArticleType | undefined
): readonly MastheadWidgetConfig[] {
  return articleType ? WIDGETS_BY_TYPE[articleType] : [];
}

/** "A", "A and B", "A, B and C". */
export function joinNames(names: readonly string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

export const peopleOf = (values: PublishingFormData, field: PublishingFieldKey): SelectOption[] => {
  const people = values[field];
  return Array.isArray(people) ? (people as SelectOption[]) : [];
};

/** `50000` as `$50,000`; null while there is no amount. */
export function formatAmount(budget: string | undefined): string | null {
  const value = Number(budget);
  return value > 0 ? `$${value.toLocaleString('en-US')}` : null;
}

/**
 * A detail's value as the byline and the publish dialog show it, or null
 * while it has none. The cover is a picture, not text: null here, and read
 * by whoever shows it.
 */
export function detailValue(
  config: MastheadWidgetConfig,
  values: PublishingFormData
): string | null {
  switch (config.kind) {
    case 'cover':
      return null;
    case 'people': {
      const people = peopleOf(values, config.field);
      return people.length > 0 ? joinNames(people.map((person) => person.label)) : null;
    }
    case 'amount':
      return formatAmount(values.budget);
    case 'grant':
      return values.selectedGrant?.shortTitle ?? null;
    case 'text':
      return values.organization?.trim() || null;
    case 'paragraph':
      return values.shortDescription?.trim() || null;
  }
}

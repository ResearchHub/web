import type { ComponentType } from 'react';
import {
  DollarSign,
  FileText,
  Image as ImageIcon,
  Target,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { AuthorsSection } from '@/components/Notebook/PublishingForm/components/AuthorsSection';
import { ContactsSection } from '@/components/Notebook/PublishingForm/components/ContactsSection';
import { FundingGoalSection } from '@/components/Notebook/PublishingForm/components/FundingGoalSection';
import { GrantDescriptionSection } from '@/components/Notebook/PublishingForm/components/GrantDescriptionSection';
import { GrantFundingAmountSection } from '@/components/Notebook/PublishingForm/components/GrantFundingAmountSection';
import type { SectionProps } from '@/components/Notebook/PublishingForm/components/SectionProps';
import { WorkImageSection } from '@/components/Notebook/PublishingForm/components/WorkImageSection';
import type {
  ArticleType,
  PublishingFormData,
  SelectOption,
} from '@/components/Notebook/PublishingForm/schema';
import { SelectGrantForNoteModal, type NoteModalProps } from './SelectGrantForNoteModal';

/** How a block is edited when clicked. */
export type DetailBlockEditor =
  /** A small panel over the document holding just this section of the form. */
  | { readonly kind: 'popover'; readonly Section: ComponentType<SectionProps> }
  /** A full modal the block owns; it stays mounted while the modal is open. */
  | { readonly kind: 'modal'; readonly Modal: ComponentType<NoteModalProps> };

export interface DetailBlockConfig {
  readonly id: string;
  readonly label: string;
  readonly icon: LucideIcon;
  /** Shown in place of a value while nothing is set. */
  readonly emptyLabel: string;
  /** The value to show once set; null while it is not. */
  readonly summarize: (values: PublishingFormData) => string | null;
  /** The type can publish without it. */
  readonly optional?: boolean;
  /** The block disappears when this holds. */
  readonly hiddenWhen?: (values: PublishingFormData) => boolean;
  readonly editor: DetailBlockEditor;
}

const people = (options: SelectOption[] | undefined, noun: string): string | null => {
  if (!options?.length) return null;
  return options.length === 1 ? options[0].label : `${options.length} ${noun}`;
};

const amount = (budget: string | undefined): string | null => {
  const value = Number(budget);
  return value > 0 ? `$${value.toLocaleString('en-US')}` : null;
};

const coverImage = (values: PublishingFormData): string | null =>
  values.coverImage?.file?.name ?? (values.coverImage?.url ? 'Image added' : null);

const APPLYING_TO: DetailBlockConfig = {
  id: 'applyingTo',
  label: 'Applying to',
  icon: Target,
  emptyLabel: 'Select an RFP',
  optional: true,
  summarize: (values) => values.selectedGrant?.shortTitle ?? null,
  // The answer to a Request for Proposal cannot change once published; the
  // field renders nothing then either.
  hiddenWhen: (values) => Boolean(values.workId),
  editor: { kind: 'modal', Modal: SelectGrantForNoteModal },
};

const FUNDING_GOAL: DetailBlockConfig = {
  id: 'fundingGoal',
  label: 'Funding goal',
  icon: DollarSign,
  emptyLabel: 'Add amount',
  summarize: (values) => amount(values.budget),
  editor: { kind: 'popover', Section: FundingGoalSection },
};

const FUNDING_AMOUNT: DetailBlockConfig = {
  id: 'fundingAmount',
  label: 'Funding amount',
  icon: DollarSign,
  emptyLabel: 'Add amount',
  summarize: (values) => amount(values.budget),
  editor: { kind: 'popover', Section: GrantFundingAmountSection },
};

const SHORT_DESCRIPTION: DetailBlockConfig = {
  id: 'shortDescription',
  label: 'Short description',
  icon: FileText,
  emptyLabel: 'Add description',
  summarize: (values) => values.shortDescription?.trim() || null,
  editor: { kind: 'popover', Section: GrantDescriptionSection },
};

const AUTHORS: DetailBlockConfig = {
  id: 'authors',
  label: 'Authors',
  icon: Users,
  emptyLabel: 'Add authors',
  summarize: (values) => people(values.authors, 'authors'),
  editor: { kind: 'popover', Section: AuthorsSection },
};

const CONTACTS: DetailBlockConfig = {
  id: 'contacts',
  label: 'Contacts',
  icon: Users,
  emptyLabel: 'Add contact',
  summarize: (values) => people(values.contacts, 'contacts'),
  editor: { kind: 'popover', Section: ContactsSection },
};

const COVER_IMAGE: DetailBlockConfig = {
  id: 'coverImage',
  label: 'Cover image',
  icon: ImageIcon,
  emptyLabel: 'Add image',
  summarize: coverImage,
  editor: { kind: 'popover', Section: WorkImageSection },
};

const BLOCKS_BY_TYPE: Record<ArticleType, readonly DetailBlockConfig[]> = {
  preregistration: [APPLYING_TO, FUNDING_GOAL, AUTHORS, COVER_IMAGE],
  grant: [FUNDING_AMOUNT, SHORT_DESCRIPTION, CONTACTS, { ...COVER_IMAGE, optional: true }],
  registered_report: [AUTHORS, COVER_IMAGE],
  discussion: [AUTHORS],
};

/** The blocks a work of this type shows, in the order they keep. */
export function detailBlocksFor(
  articleType: ArticleType | undefined
): readonly DetailBlockConfig[] {
  return articleType ? BLOCKS_BY_TYPE[articleType] : [];
}

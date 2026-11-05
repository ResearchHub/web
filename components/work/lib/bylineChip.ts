import { cn } from '@/utils/styles';

/**
 * The box a work's byline sits in, as the sidebar's cards do, so it reads
 * apart from the body under it. Phones pad the page's top by half as much, so
 * the box adds the rest and sits as far under the tabs there as elsewhere.
 */
export const BYLINE_BOX_CLASS =
  'mb-4 mt-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:mt-0';

/** A chip in a work's byline: a review score, a date, the RFP it answers, a count. */
export const BYLINE_CHIP_CLASS =
  'inline-flex max-w-full items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-[12.5px] font-medium text-gray-700';

/** A byline chip that links somewhere. */
export const BYLINE_LINK_CHIP_CLASS = cn(BYLINE_CHIP_CLASS, 'transition-colors hover:bg-gray-200');

import { cn } from '@/utils/styles';

/** A chip in a work's byline: a review score, a date, the RFP it answers, a count. */
export const BYLINE_CHIP_CLASS =
  'inline-flex max-w-full items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-[12.5px] font-medium text-gray-700';

/** A byline chip that links somewhere. */
export const BYLINE_LINK_CHIP_CLASS = cn(BYLINE_CHIP_CLASS, 'transition-colors hover:bg-gray-200');

'use client';

import { FC } from 'react';
import { HashtagBadge } from '@/components/ui/badges/HashtagBadge';
import { Journal } from '@/types/journal';
import { getSourceLogo } from '@/utils/preprintUtil';

interface FeedItemJournalBadgeProps {
  journal?: Journal;
}

/**
 * The hashtag-style journal badge (e.g. #biorxiv) on a paper feed item. Only
 * the ResearchHub Journal has a page to link to.
 */
export const FeedItemJournalBadge: FC<FeedItemJournalBadgeProps> = ({ journal }) => {
  if (!journal?.name || !journal.slug) return null;
  const logo = getSourceLogo(journal.slug);
  if (!logo) return null;
  return (
    <HashtagBadge label={journal.slug} href={logo === 'rhJournal2' ? '/journal' : undefined} />
  );
};

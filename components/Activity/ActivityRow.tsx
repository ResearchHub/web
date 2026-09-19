'use client';

import { FC } from 'react';
import { ActivityCard } from './cards/ActivityCard';
import { ActivityCommentGroupCard } from './cards/ActivityCommentGroupCard';
import { ActivityFundingGroupCard } from './cards/ActivityFundingGroupCard';
import type { ActivityRow as ActivityRowType } from './lib/activityGrouping.utils';
import type { AuthorProfile } from '@/types/authorProfile';

interface ActivityRowProps {
  row: ActivityRowType;
  /** Author whose profile the row sits on, credited ahead of a document's lead author. */
  profileAuthor?: AuthorProfile;
}

/** Renders whichever card `groupActivityRows` decided a row should be. */
export const ActivityRow: FC<ActivityRowProps> = ({ row, profileAuthor }) => {
  switch (row.kind) {
    case 'funding-group':
      return <ActivityFundingGroupCard row={row} />;
    case 'comment-group':
      return <ActivityCommentGroupCard row={row} />;
    default:
      return <ActivityCard entry={row.entry} profileAuthor={profileAuthor} />;
  }
};

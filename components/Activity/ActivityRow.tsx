'use client';

import { FC } from 'react';
import { ActivityCard } from './cards/ActivityCard';
import { ActivityCommentGroupCard } from './cards/ActivityCommentGroupCard';
import { ActivityFundingGroupCard } from './cards/ActivityFundingGroupCard';
import type { ActivityRow as ActivityRowType } from './lib/activityGrouping.utils';

interface ActivityRowProps {
  row: ActivityRowType;
}

/** Renders whichever card `groupActivityRows` decided a row should be. */
export const ActivityRow: FC<ActivityRowProps> = ({ row }) => {
  switch (row.kind) {
    case 'funding-group':
      return <ActivityFundingGroupCard row={row} />;
    case 'comment-group':
      return <ActivityCommentGroupCard row={row} />;
    default:
      return <ActivityCard entry={row.entry} />;
  }
};

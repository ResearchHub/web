'use client';

import { FC } from 'react';
import { Content, FeedEntry } from '@/types/feed';
import { MessageCircle, Repeat, MoreHorizontal, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FeedItemMenu } from '@/components/menus/FeedItemMenu';

interface ActionButtonProps {
  icon: any;
  count?: number;
  label: string;
  tooltip?: string;
}

const ActionButton: FC<ActionButtonProps> = ({ icon: Icon, count, label, tooltip }) => (
  <Button
    variant="ghost"
    size="sm"
    className="flex items-center space-x-1.5 text-gray-900 hover:text-gray-900"
    tooltip={tooltip}
  >
    <Icon className="w-5 h-5" />
    {count !== undefined && count > 0 && <span className="text-sm font-medium">{count}</span>}
    <span className="sr-only">{label}</span>
  </Button>
);

interface FeedItemActionsProps {
  metrics?: FeedEntry['metrics'];
  content: Content;
  target?: Content;
}

export const FeedItemActions: FC<FeedItemActionsProps> = ({ metrics, content, target }) => {
  return (
    <div className="flex items-center space-x-4">
      <ActionButton icon={ArrowUp} count={metrics?.votes} tooltip="Upvote" label="Upvote" />
      <ActionButton
        icon={MessageCircle}
        count={metrics?.comments}
        tooltip="Comment"
        label="Comment"
      />
      <FeedItemMenu>
        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
          <MoreHorizontal className="w-5 h-5" />
          <span className="sr-only">More options</span>
        </Button>
      </FeedItemMenu>
    </div>
  );
};

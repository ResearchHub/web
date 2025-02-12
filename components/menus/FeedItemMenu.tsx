'use client';

import { FC, ReactNode } from 'react';
import { Flag, Share } from 'lucide-react';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';

interface FeedItemMenuProps {
  children: ReactNode;
}

export const FeedItemMenu: FC<FeedItemMenuProps> = ({ children }) => {
  return (
    <BaseMenu trigger={children}>
      <BaseMenuItem onSelect={() => console.log('Share content')}>
        <Share className="mr-2 h-4 w-4" />
        <span>Share</span>
      </BaseMenuItem>
      <BaseMenuItem onSelect={() => console.log('Flag content')}>
        <Flag className="mr-2 h-4 w-4" />
        <span>Flag content</span>
      </BaseMenuItem>
    </BaseMenu>
  );
};

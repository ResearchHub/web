'use client'

import { FC } from 'react';
import { Button } from '@/components/ui/Button';
import { Sparkles, Users, TrendingUp, Clock } from 'lucide-react';

type FeedTab = 'for-you' | 'following' | 'popular' | 'latest';

interface FeedTabsProps {
  activeTab: FeedTab;
  onTabChange: (tab: FeedTab) => void;
}

export const FeedTabs: FC<FeedTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'for-you',
      label: 'For You',
      icon: Sparkles,
    },
    {
      id: 'following',
      label: 'Following',
      icon: Users,
    },
    {
      id: 'popular',
      label: 'Popular',
      icon: TrendingUp,
    },
    {
      id: 'latest',
      label: 'Latest',
      icon: Clock,
    },
  ] as const;

  return (
    <div className="flex items-center space-x-2">
      {tabs.map(({ id, label, icon: Icon }) => (
        <Button
          key={id}
          variant={activeTab === id ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onTabChange(id)}
          className="flex items-center space-x-1.5"
        >
          <Icon className="w-4 h-4" />
          <span>{label}</span>
        </Button>
      ))}
    </div>
  );
};
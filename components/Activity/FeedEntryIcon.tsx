'use client';

import { FC } from 'react';
import { Bell, MessageCircle, type LucideIcon } from 'lucide-react';
import Icon from '@/components/ui/icons/Icon';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import type { FeedEntryIconName } from './lib/feedEntryAdapters';

const ICONS: Record<Exclude<FeedEntryIconName, 'coins' | 'fund' | 'earn' | null>, LucideIcon> = {
  bell: Bell,
  message: MessageCircle,
};

interface FeedEntryIconProps {
  name: FeedEntryIconName;
}

export const FeedEntryIcon: FC<FeedEntryIconProps> = ({ name }) => {
  const { showUSD } = useCurrencyPreference();

  if (!name) return null;
  if (name === 'coins') {
    if (showUSD) return null;
    return <ResearchCoinIcon outlined size={14} className="inline -mt-0.5 ml-1 flex-shrink-0" />;
  }
  if (name === 'fund') {
    return (
      <Icon name="fund" size={14} color="#374151" className="inline -mt-0.5 ml-1 flex-shrink-0" />
    );
  }
  if (name === 'earn') {
    return (
      <Icon name="earn1" size={14} color="#6B7280" className="inline -mt-0.5 ml-1 flex-shrink-0" />
    );
  }
  const IconComponent = ICONS[name];
  return <IconComponent size={14} className="inline -mt-0.5 ml-1 text-gray-600" />;
};

import { FC } from 'react';
import { Bell, Coins, MessageCircle, type LucideIcon } from 'lucide-react';
import type { FeedEntryIconName } from './lib/feedEntryAdapters';

const ICONS: Record<Exclude<FeedEntryIconName, null>, LucideIcon> = {
  coins: Coins,
  bell: Bell,
  message: MessageCircle,
};

interface FeedEntryIconProps {
  name: FeedEntryIconName;
}

export const FeedEntryIcon: FC<FeedEntryIconProps> = ({ name }) => {
  if (!name) return null;
  const Icon = ICONS[name];
  return <Icon size={14} className="inline -mt-0.5 ml-1 text-gray-600" />;
};

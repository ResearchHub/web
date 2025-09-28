'use client';

import { Topic } from '@/types/topic';
import { ManageTopics } from '@/components/Topic/ManageTopics';

interface BrowsePageClientProps {
  initialTopics: Topic[];
}

export function BrowsePageClient({ initialTopics }: BrowsePageClientProps) {
  return <ManageTopics initialTopics={initialTopics} showFollowingTab={true} defaultTab="all" />;
}

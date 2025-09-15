import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { TopicAndJournalBadge } from './TopicAndJournalBadge';
import { Topic } from '@/types/topic';
import { Plus } from 'lucide-react';

export interface TopicAndJournalBadgesProps {
  topics: Topic[];
}

export default function TopicAndJournalBadges({ topics }: TopicAndJournalBadgesProps) {
  if (!topics || topics.length === 0) {
    return null; // No topics to display
  }
  const firstTopic = topics[0];
  if (topics.length === 1) {
    return (
      <TopicAndJournalBadge
        key={firstTopic.id || firstTopic.slug}
        type="topic"
        name={firstTopic.name}
        slug={firstTopic.slug}
        imageUrl={firstTopic.imageUrl}
      />
    );
  }

  const additionalTopics = topics.slice(1);

  return (
    <>
      <TopicAndJournalBadge
        key={firstTopic.id || firstTopic.slug}
        type="topic"
        name={firstTopic.name}
        slug={firstTopic.slug}
        imageUrl={firstTopic.imageUrl}
      />
      <Popover className="relative">
        <PopoverButton className="relative rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 h-8 w-8 focus:outline-none focus-visible:outline-none cursor-pointer text-primary-700 border border-primary-200 bg-primary-50 hover:bg-primary-100">
          <Plus className="h-4 w-4" />
        </PopoverButton>
        <PopoverPanel
          transition
          anchor="bottom"
          className="z-10 flex flex-wrap gap-2 w-2/5 max-w-100 max-h-20 rounded-md bg-white p-2 mt-1 shadow-lg border border-gray-200"
        >
          {additionalTopics.map((topic) => (
            <TopicAndJournalBadge
              key={topic.id || topic.slug}
              type="topic"
              name={topic.name}
              slug={topic.slug}
              imageUrl={topic.imageUrl}
            />
          ))}
        </PopoverPanel>
      </Popover>
    </>
  );
}

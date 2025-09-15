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
        <PopoverButton className="relative rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 border border-primary-200 bg-primary-50 hover:bg-primary-100 h-6 w-6 focus:outline-none focus-visible:outline-none cursor-pointer">
          <span className="absolute inset-0 flex items-center justify-center font-medium text-indigo-700 text-sm">
            <Plus className="h-4 w-4" />
          </span>
        </PopoverButton>
        <PopoverPanel
          transition
          anchor="bottom"
          className="z-50 flex flex-wrap gap-2 p-2 mt-1 rounded-lg bg-white border-none shadow-lg overflow-visible min-w-[8rem] !w-[300px] max-w-[60vw]"
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

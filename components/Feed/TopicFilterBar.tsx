'use client';

import { FC, useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Pill } from '@/components/ui/nav/Pill';
import { Topic } from '@/types/topic';
import { cn } from '@/utils/styles';

interface TopicFilterBarProps {
  topics: Topic[];
  activeTopicSlug: string | null;
  onSelectTopic: (slug: string | null) => void;
}

export const TopicFilterBar: FC<TopicFilterBarProps> = ({
  topics,
  activeTopicSlug,
  onSelectTopic,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    const observer = new ResizeObserver(checkScroll);
    observer.observe(el);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      observer.disconnect();
    };
  }, [checkScroll, topics]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction === 'left' ? -200 : 200,
      behavior: 'smooth',
    });
  };

  if (topics.length === 0) return null;

  return (
    <div className="relative flex items-center">
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 z-10 h-8 w-8 flex items-center justify-center rounded-full bg-white shadow-md border border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      {canScrollLeft && (
        <div className="absolute left-8 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent z-[5] pointer-events-none" />
      )}

      <div ref={scrollRef} className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth py-1">
        <Pill
          active={activeTopicSlug === null}
          onClick={() => onSelectTopic(null)}
          className="px-3 py-1.5 text-xs"
        >
          All
        </Pill>
        {topics.map((topic) => (
          <Pill
            key={topic.id}
            active={activeTopicSlug === topic.slug}
            onClick={() => onSelectTopic(topic.slug)}
            className="px-3 py-1.5 text-xs"
          >
            {topic.name}
          </Pill>
        ))}
      </div>

      {canScrollRight && (
        <div className="absolute right-8 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent z-[5] pointer-events-none" />
      )}

      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 z-10 h-8 w-8 flex items-center justify-center rounded-full bg-white shadow-md border border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

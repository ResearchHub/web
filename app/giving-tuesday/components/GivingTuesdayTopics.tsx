'use client';

import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { GiftConciergeModal } from '@/components/modals/GiftConciergeModal';
import { cn } from '@/utils/styles';
import { TOPICS, type Topic } from '@/app/giving-tuesday/lib/topics';
import { DISPLAY_FONT } from '@/app/giving-tuesday/components/displayFont';
import { ANIMATE_ART_ON_HOVER, TopicArt } from '@/app/giving-tuesday/components/TopicArt';

/** Sized so the eleven cards fill a 4-by-4 grid on desktop and pair up on phones. */
const CARD_SPANS: Partial<Record<Topic['id'], string>> = {
  ai: 'col-span-2 row-span-2',
  cancer: 'col-span-2',
  other: 'col-span-2',
};

export function GivingTuesdayTopics() {
  const [topic, setTopic] = useState<Topic>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  function pickTopic(picked: Topic) {
    setTopic(picked);
    setIsModalOpen(true);
  }

  return (
    <section id="fields" className="scroll-mt-4 px-6 pb-24 md:pb-32">
      <div className="mx-auto max-w-[1240px]">
        <h2
          className="max-w-[620px] text-[40px] font-bold leading-[1.05] tracking-[-0.03em] text-white md:text-[56px]"
          style={DISPLAY_FONT}
        >
          What science do you want to fund?
        </h2>
        <div className="mt-12 grid auto-rows-[200px] grid-flow-dense grid-cols-2 gap-4 lg:auto-rows-[240px] lg:grid-cols-4">
          {TOPICS.map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              onClick={() => pickTopic(candidate)}
              className={cn(
                'relative isolate flex flex-col justify-end overflow-hidden rounded-3xl text-left ring-1 ring-white/10 transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_-24px_rgba(57,113,255,0.6)] hover:ring-white/40',
                ANIMATE_ART_ON_HOVER,
                CARD_SPANS[candidate.id]
              )}
            >
              <TopicArt
                topicId={candidate.id}
                className="absolute inset-0 -z-10 h-full w-full transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <span className="flex items-end justify-between gap-3 p-4 sm:p-5">
                <span>
                  <span
                    className={cn(
                      'block font-bold leading-tight text-white',
                      candidate.id === 'ai'
                        ? 'text-[28px] md:text-[36px]'
                        : 'text-[17px] sm:text-xl'
                    )}
                    style={DISPLAY_FONT}
                  >
                    {candidate.label}
                  </span>
                  <span className="mt-1 hidden text-sm text-white/70 sm:block">
                    {candidate.blurb}
                  </span>
                </span>
                <span className="absolute right-3 top-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition group-hover:bg-white group-hover:text-black sm:static sm:h-10 sm:w-10">
                  <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {topic && (
        <GiftConciergeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          topic={topic}
        />
      )}
    </section>
  );
}

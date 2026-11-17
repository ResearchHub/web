'use client';

import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { GiftConciergeModal } from '@/components/modals/GiftConciergeModal';
import { cn } from '@/utils/styles';
import { TOPICS, type Topic } from '@/app/giving/lib/topics';
import { DISPLAY_FONT } from '@/app/giving/components/displayFont';
import { BLUE_TEXT } from '@/app/giving/components/accents';
import { TopicArt } from '@/app/giving/components/TopicArt';
import { TOPIC_PALETTES } from '@/app/giving/lib/topicSymbols';

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
    <section id="fields" className="scroll-mt-4 bg-white px-6 py-24 md:py-32">
      <div className="mx-auto max-w-[1240px]">
        <h2
          className="text-center text-[40px] font-bold leading-[1.05] tracking-[-0.03em] text-[#0b1530] md:text-[56px]"
          style={DISPLAY_FONT}
        >
          What research <span className={BLUE_TEXT}>do you care about?</span>
        </h2>
        <p className="mx-auto mt-5 max-w-[560px] text-center text-lg text-[#1f2937]">
          Pick one. Your gift and our match both go there.
        </p>
        <div className="mt-12 grid auto-rows-[200px] grid-flow-dense grid-cols-2 gap-4 lg:auto-rows-[240px] lg:grid-cols-4">
          {TOPICS.map((candidate) => {
            const { background, isDark } = TOPIC_PALETTES[candidate.id];
            return (
              <button
                key={candidate.id}
                type="button"
                onClick={() => pickTopic(candidate)}
                className={cn(
                  'group relative isolate flex flex-col overflow-hidden rounded-3xl text-left shadow-[0_18px_40px_-20px_rgba(13,30,80,0.35)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_-24px_rgba(57,113,255,0.6)] hover:ring-[#3971ff]/40',
                  CARD_SPANS[candidate.id]
                )}
                style={{ background }}
              >
                <TopicArt topicId={candidate.id} className="min-h-0 flex-1" />
                <span className="flex items-end justify-between gap-3 px-4 pb-4 sm:px-5 sm:pb-5">
                  <span>
                    <span
                      className={cn(
                        'block font-bold leading-tight',
                        isDark ? 'text-white' : 'text-[#0b1530]',
                        candidate.id === 'ai'
                          ? 'text-[28px] md:text-[36px]'
                          : 'text-[17px] sm:text-xl'
                      )}
                      style={DISPLAY_FONT}
                    >
                      {candidate.label}
                    </span>
                    <span
                      className={cn(
                        'mt-1 hidden text-sm sm:block',
                        isDark ? 'text-white/70' : 'text-[#0b1530]/65'
                      )}
                    >
                      {candidate.blurb}
                    </span>
                  </span>
                  <span
                    className={cn(
                      'absolute right-3 top-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full backdrop-blur transition sm:static sm:h-10 sm:w-10',
                      isDark
                        ? 'bg-white/15 text-white group-hover:bg-white group-hover:text-black'
                        : 'bg-white/80 text-[#0b1530] group-hover:bg-[#0b1530] group-hover:text-white'
                    )}
                  >
                    <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </span>
                </span>
              </button>
            );
          })}
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

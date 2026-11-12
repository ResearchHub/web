'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { GiftConciergeModal } from '@/components/modals/GiftConciergeModal';
import { cn } from '@/utils/styles';
import { TOPICS, type Topic } from '@/app/giving-tuesday/lib/topics';
import { DISPLAY_FONT } from '@/app/giving-tuesday/components/displayFont';

/** The areas of science to give to. Picking one opens the call to set up the gift. */
export function GivingTuesdayTopics() {
  const [topic, setTopic] = useState<Topic>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  function pickTopic(picked: Topic) {
    setTopic(picked);
    setIsModalOpen(true);
  }

  return (
    <section id="topics" className="scroll-mt-4 px-5 pt-16 lg:px-7 lg:pt-20">
      <div className="mx-auto max-w-[1180px]">
        <h2
          className="text-[30px] font-bold leading-[1.08] text-navy lg:text-[40px]"
          style={DISPLAY_FONT}
        >
          What science do you want to fund?
        </h2>
        <p className="mt-3 max-w-[640px] text-lg text-gray-600">
          Pick the area you care about most. Your gift goes to open research in that field.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
          {TOPICS.map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              onClick={() => pickTopic(candidate)}
              className="group flex min-h-[176px] flex-col rounded-2xl border-2 border-gray-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-navy hover:shadow-lg lg:min-h-[200px] lg:p-6"
            >
              <span
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-2xl',
                  candidate.iconClassName
                )}
              >
                <candidate.Icon className="h-6 w-6" />
              </span>
              <span className="mt-auto block pt-4 text-lg font-semibold leading-tight text-navy">
                {candidate.label}
              </span>
              <span className="mt-1 block text-sm leading-snug text-gray-500">
                {candidate.blurb}
              </span>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary-600 transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
                Give
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>
          ))}
        </div>
      </div>

      {topic && (
        <GiftConciergeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          topicLabel={topic.label}
        />
      )}
    </section>
  );
}

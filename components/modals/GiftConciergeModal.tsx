'use client';

import { CalendarCheck } from 'lucide-react';
import { BaseModal } from '@/components/ui/BaseModal';
import { cn } from '@/utils/styles';
import type { Topic } from '@/app/giving-tuesday/lib/topics';
import { DISPLAY_FONT } from '@/app/giving-tuesday/components/displayFont';
import { BLUE_BUTTON } from '@/app/giving-tuesday/components/accents';
import { TopicArt } from '@/app/giving-tuesday/components/TopicArt';
import { GiftChecks } from '@/app/giving-tuesday/components/GiftChecks';

const TALK_TO_TEAM_URL = 'https://cal.com/tyler-diorio/15min';

interface GiftConciergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** The area of science the donor picked; its label goes to the booking as a note. */
  topic: Topic;
}

/**
 * The next step after a donor picks an area of science: a call with the team.
 * Large gifts arrive by wire, and its details belong on a call, not on a public page.
 */
export function GiftConciergeModal({ isOpen, onClose, topic }: Readonly<GiftConciergeModalProps>) {
  const note = encodeURIComponent(`Giving Tuesday gift: ${topic.label}`);
  const bookingUrl = `${TALK_TO_TEAM_URL}?notes=${note}`;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      className="!h-[100dvh] md:!h-auto"
      title={
        <span className="font-semibold" style={DISPLAY_FONT}>
          Give to <span className="text-primary-500">{topic.label}</span>
        </span>
      }
      footer={
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(BLUE_BUTTON, 'h-12 w-full text-[15px]')}
        >
          <CalendarCheck className="h-5 w-5" /> Book a call
        </a>
      }
    >
      <div className="relative h-40 overflow-hidden rounded-2xl ring-1 ring-gray-200">
        <TopicArt topicId={topic.id} className="h-full w-full" />
        <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#0b1530]">
          {topic.label}
        </span>
      </div>
      <GiftChecks size="sm" className="mt-5" />
      <div className="mt-5 rounded-2xl bg-[#f3f6ff] p-5">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#3971ff]">Next step</p>
        <h3 className="mt-2 text-[26px] leading-tight text-[#0b1530]" style={DISPLAY_FONT}>
          Jump on a quick call with us
        </h3>
        <p className="mt-2 text-[15px] leading-relaxed text-[#4b5563]">
          We’ll make sure your money goes to the research you care about.
        </p>
      </div>
    </BaseModal>
  );
}

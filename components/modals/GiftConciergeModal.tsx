'use client';

import { CalendarCheck, Landmark, Lock, Sparkles } from 'lucide-react';
import { BaseModal } from '@/components/ui/BaseModal';
import { cn } from '@/utils/styles';
import type { Topic } from '@/app/giving-tuesday/lib/topics';
import { DISPLAY_FONT } from '@/app/giving-tuesday/components/displayFont';
import { BLUE_BUTTON, BLUE_TEXT } from '@/app/giving-tuesday/components/accents';
import { TopicArt } from '@/app/giving-tuesday/components/TopicArt';

const TALK_TO_TEAM_URL = 'https://cal.com/tyler-diorio/15min';

const PERKS = [
  { label: 'Matched 1:1', detail: 'On every gift before 2027', Icon: Sparkles },
  { label: 'Tax-deductible', detail: 'Through Endaoment, a 501(c)(3)', Icon: Landmark },
  { label: 'Wire or DAF', detail: 'Details shared on the call', Icon: Lock },
];

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
      tone="dark"
      size="lg"
      title={
        <span className="font-semibold" style={DISPLAY_FONT}>
          Give to <span className={BLUE_TEXT}>{topic.label}</span>
        </span>
      }
      footer={
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(BLUE_BUTTON, 'h-12 w-full text-[15px]')}
        >
          <CalendarCheck className="h-5 w-5" /> Schedule a call with Tyler
        </a>
      }
    >
      <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
        <span className="h-20 w-28 shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10">
          <TopicArt topicId={topic.id} className="h-full w-full" />
        </span>
        <span>
          <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#7fb0ff]">
            Your field
          </span>
          <span className="block text-lg font-bold text-white">{topic.label}</span>
          <span className="block text-sm text-[#98a4ba]">{topic.blurb}</span>
        </span>
      </div>
      <p className="mt-5 text-[15px] leading-relaxed text-[#98a4ba]">
        The next step is a 15-minute call with Tyler from our team. He’ll walk you through giving
        and confirm your match. Wire details are shared on the call, never on a public page.
      </p>
      <ul className="mt-5 space-y-2.5">
        {PERKS.map(({ label, detail, Icon }) => (
          <li key={label} className="flex items-center gap-3 text-sm">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#3971ff]/15 text-[#7fb0ff]">
              <Icon className="h-4 w-4" />
            </span>
            <span className="flex flex-col sm:flex-row sm:gap-3">
              <span className="font-semibold text-white">{label}</span>
              <span className="text-[#6b7690]">{detail}</span>
            </span>
          </li>
        ))}
      </ul>
    </BaseModal>
  );
}

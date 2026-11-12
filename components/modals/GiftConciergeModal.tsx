'use client';

import { CalendarCheck, Landmark, Lock, Sparkles } from 'lucide-react';
import { BaseModal } from '@/components/ui/BaseModal';
import { cn } from '@/utils/styles';
import type { Topic } from '@/app/giving-tuesday/lib/topics';
import { DISPLAY_FONT } from '@/app/giving-tuesday/components/displayFont';
import { BLUE_BUTTON } from '@/app/giving-tuesday/components/accents';
import { TopicArt } from '@/app/giving-tuesday/components/TopicArt';

const TALK_TO_TEAM_URL = 'https://cal.com/tyler-diorio/15min';

const PERKS = [
  { label: 'Matched 1:1', Icon: Sparkles },
  { label: 'Tax-deductible', Icon: Landmark },
  { label: 'Wire or DAF', Icon: Lock },
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
          <CalendarCheck className="h-5 w-5" /> Book a call with us
        </a>
      }
    >
      <div className="h-40 overflow-hidden rounded-2xl ring-1 ring-gray-200">
        <TopicArt topicId={topic.id} className="h-full w-full" />
      </div>
      <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
        {PERKS.map(({ label, Icon }) => (
          <li key={label} className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-500">
              <Icon className="h-4 w-4" />
            </span>
            {label}
          </li>
        ))}
      </ul>
    </BaseModal>
  );
}

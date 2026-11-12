'use client';

import { Check } from 'lucide-react';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';

const TALK_TO_TEAM_URL = 'https://cal.com/tyler-diorio/15min';

const PERKS = [
  'Matched 1:1 on every gift made before 2027',
  'Tax-deductible through Endaoment, a 501(c)(3) public charity',
  'Give by wire transfer or from your donor-advised fund',
];

interface GiftConciergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** The area of science the donor picked, passed to the booking as a note. */
  topicLabel: string;
}

/**
 * The next step after a donor picks an area of science: a call with the team.
 * Large gifts arrive by wire, and its details belong on a call, not on a public page.
 */
export function GiftConciergeModal({
  isOpen,
  onClose,
  topicLabel,
}: Readonly<GiftConciergeModalProps>) {
  const note = encodeURIComponent(`Giving Tuesday gift: ${topicLabel}`);
  const bookingUrl = `${TALK_TO_TEAM_URL}?notes=${note}`;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Give to ${topicLabel}`}
      size="md"
      footer={
        <Button asChild className="w-full">
          <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
            Schedule a call with Tyler
          </a>
        </Button>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          The next step is a 15-minute call with Tyler from our team. He’ll walk you through giving
          and confirm your match. We share wire details on the call, never on a public page.
        </p>
        <ul className="space-y-2">
          {PERKS.map((perk) => (
            <li key={perk} className="flex gap-2 text-sm text-gray-700">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              {perk}
            </li>
          ))}
        </ul>
      </div>
    </BaseModal>
  );
}

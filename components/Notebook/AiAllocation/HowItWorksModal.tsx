'use client';

import { BaseModal } from '@/components/ui/BaseModal';
import { Timeline, type TimelineStep } from '@/components/ui/Timeline';
import type { AllocationPolicy } from './rules';

/**
 * The path from this tab to a payout, per policy. Money only appears on the
 * last step, which is what tells a funder that nothing they do here allocates
 * anything.
 */
const STEPS: Record<AllocationPolicy, TimelineStep[]> = {
  SELF_MANAGED: [
    {
      id: 'publish',
      title: 'You publish the RFP',
      description: 'Set the scope, budget and deadline.',
    },
    {
      id: 'review',
      title: 'You review proposals',
      description: 'Read each one alongside its peer reviews.',
    },
    {
      id: 'award',
      title: 'You award, funds move',
      description: 'Nothing is paid until you pick the awards.',
    },
  ],
  AI_ASSISTED: [
    {
      id: 'rules',
      title: 'You set the rules',
      description: 'Accept suggestions from your RFP or write your own.',
    },
    {
      id: 'recommend',
      title: 'AI recommends',
      description: 'Every proposal is checked against your rules and ranked in a report.',
    },
    {
      id: 'approve',
      title: 'You approve, funds move',
      description: 'Nothing is paid until you sign off on the awards.',
    },
  ],
};

const TITLES: Record<AllocationPolicy, string> = {
  SELF_MANAGED: 'How self-managed funding works',
  AI_ASSISTED: 'How AI-assisted funding works',
};

interface HowItWorksModalProps {
  policy: AllocationPolicy;
  isOpen: boolean;
  onClose: () => void;
}

export function HowItWorksModal({ policy, isOpen, onClose }: Readonly<HowItWorksModalProps>) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={TITLES[policy]} size="md">
      <Timeline steps={STEPS[policy]} aria-label={TITLES[policy]} />
    </BaseModal>
  );
}

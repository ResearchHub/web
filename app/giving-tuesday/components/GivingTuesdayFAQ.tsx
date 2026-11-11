import { FundingFAQSection, type FundingFAQItem } from '@/components/landing/FundingFAQSection';

const FAQ_ITEMS: FundingFAQItem[] = [
  {
    q: 'What happens when I give to science?',
    a: 'Your gift goes straight to the open project closest to being fully funded, so it helps get the work started sooner.',
  },
  {
    q: 'What happens when I pick a cause?',
    a: 'Your gift goes straight to the RFP or project you chose. A gift to an RFP joins its funding pool, which the funder awards to the proposals it selects.',
  },
  {
    q: 'How will I know what my gift did?',
    a: 'Every project is preregistered with a public plan, and researchers post updates as the work moves from funded to published.',
  },
];

export function GivingTuesdayFAQ() {
  return <FundingFAQSection items={FAQ_ITEMS} />;
}

import { FundingFAQSection, type FundingFAQItem } from '@/components/landing/FundingFAQSection';

const FAQ_ITEMS: FundingFAQItem[] = [
  {
    q: 'What does my gift pay for?',
    a: 'The project you pick: the researcher’s time, supplies and experiments laid out in its public plan. Every project is run at a nonprofit institution, and your gift goes to that one project.',
  },
  {
    q: 'Can I give from my donor-advised fund (DAF)?',
    a: 'Yes, if your DAF is held at Endaoment: choose the DAF option when you pay and grant straight from your fund. If your DAF is with another sponsor, use the link under the projects to schedule a call with Tyler, and he’ll help you set up your gift.',
  },
  {
    q: 'Is my gift matched?',
    a: 'Yes. Every gift made through December 31 is matched 1:1, so $100 becomes $200 for research.',
  },
  {
    q: 'How will I know what my gift did?',
    a: 'Every project publishes its plan before the work starts, and researchers post updates as the work moves from funded to published.',
  },
];

export function GivingTuesdayFAQ() {
  return <FundingFAQSection items={FAQ_ITEMS} />;
}

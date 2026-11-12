import { FundingFAQSection, type FundingFAQItem } from '@/components/landing/FundingFAQSection';

const FAQ_ITEMS: FundingFAQItem[] = [
  {
    q: 'Where does my gift go?',
    a: 'To the ResearchHub Foundation’s fund at Endaoment, a 501(c)(3) public charity. From there it funds open research in the area of science you choose.',
  },
  {
    q: 'Is my gift matched?',
    a: 'Yes. ResearchHub matches every gift made before 2027 dollar for dollar, so $100,000 becomes $200,000 for research.',
  },
  {
    q: 'How do I give?',
    a: 'Pick an area of science and schedule a 15-minute call with Tyler from our team. He’ll share how to give by wire transfer or from your donor-advised fund. We never post bank details on a public page.',
  },
  {
    q: 'Is my gift tax-deductible?',
    a: 'Your gift goes to Endaoment, a 501(c)(3) public charity, so it’s generally tax-deductible in the US. Tyler can help with the paperwork you need.',
  },
];

export function GivingTuesdayFAQ() {
  return <FundingFAQSection items={FAQ_ITEMS} />;
}

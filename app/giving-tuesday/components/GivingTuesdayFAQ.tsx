import { Plus } from 'lucide-react';
import type { FundingFAQItem } from '@/components/landing/FundingFAQSection';
import { DISPLAY_FONT } from '@/app/giving-tuesday/components/displayFont';
import { BLUE_TEXT } from '@/app/giving-tuesday/components/accents';

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
    a: 'Pick an area of science and book a short call with us. We’ll help you give by wire transfer or from your donor-advised fund.',
  },
  {
    q: 'Is my gift tax-deductible?',
    a: 'Your gift goes to Endaoment, a 501(c)(3) public charity, so it’s generally tax-deductible in the US. We can help with the paperwork you need.',
  },
];

/** The site's "Funding, explained." accordion, on the page's dark ground. */
export function GivingTuesdayFAQ() {
  return (
    <section className="px-6 pb-24 md:pb-32">
      <div className="mx-auto max-w-[1100px]">
        <h2
          className="text-center text-[38px] font-bold leading-[1.08] tracking-[-0.024em] text-white md:text-[52px]"
          style={DISPLAY_FONT}
        >
          Funding, <span className={BLUE_TEXT}>explained.</span>
        </h2>
        <div className="mt-10 flex flex-col gap-3">
          {FAQ_ITEMS.map((item, index) => (
            <details
              key={item.q}
              open={index === 0}
              className="group rounded-[14px] border border-white/10 bg-white/[0.03] transition hover:border-[#3971ff]/50 open:border-[#3971ff] open:bg-[#3971ff]/[0.06] open:shadow-[0_8px_24px_-12px_rgba(57,113,255,0.5)]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-[22px] text-[17px] font-semibold text-white [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white/70 transition group-open:rotate-45 group-open:bg-[#3971ff] group-open:text-white">
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                </span>
              </summary>
              <p className="max-w-[800px] px-6 pb-[22px] text-[15px] leading-[1.65] text-[#98a4ba]">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

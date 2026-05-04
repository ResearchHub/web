import { Check, X } from 'lucide-react';
import { AboutContainer } from './AboutContainer';
import { SectionHeader } from './SectionHeader';
import { MonoLabel } from './MonoLabel';

interface ComparisonRow {
  old: string;
  next: string;
}

const rows: ComparisonRow[] = [
  {
    old: 'Peer reviewers work for free',
    next: 'Peer reviewers are paid for fast, rigorous reviews',
  },
  {
    old: 'Papers locked behind paywalls',
    next: 'Research articles published openly — no paywalls, no delays',
  },
  {
    old: 'Grants take months or years to review',
    next: 'Funding opportunities are easy to find and simple to apply to',
  },
  {
    old: 'Most grant money goes to indirect costs',
    next: 'Capped indirect costs — more money to the actual experiments',
  },
];

export const Solution = () => {
  return (
    <section className="relative py-12 sm:py-20 md:py-28 lg:py-32 bg-gray-50">
      <AboutContainer>
        <SectionHeader
          eyebrow="§ 02 · The solution"
          title={
            <>
              Imagine if we could redesign <br className="hidden md:block" />
              the entire system{' '}
              <span className="italic font-light text-primary-600">from the ground up.</span>
            </>
          }
          lead="These are some of the features you'll find on ResearchHub — the hub for open science, where researchers, funders, and the public meet to share and discuss research."
        />

        <div className="mt-10 sm:mt-14 md:mt-16">
          <div className="md:hidden">
            <MonoLabel className="block text-[10px] uppercase tracking-[0.16em] text-primary-600 mb-3">
              On ResearchHub
            </MonoLabel>
            <div className="grid gap-3">
              {rows.map((row) => (
                <div
                  key={row.old}
                  className="rounded-2xl border border-primary-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3 text-gray-900">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary-600" aria-hidden />
                    <span className="text-[15px] leading-[1.45] font-medium">{row.next}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden md:block rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <div className="grid grid-cols-2 px-10 py-4 border-b border-gray-200">
              <MonoLabel className="text-[11px] uppercase tracking-[0.16em] text-gray-500">
                → Today
              </MonoLabel>
              <MonoLabel className="text-[11px] uppercase tracking-[0.16em] text-primary-600">
                → On ResearchHub
              </MonoLabel>
            </div>
            {rows.map((row, index) => (
              <div
                key={row.old}
                className={`px-10 py-7 grid grid-cols-2 ${
                  index < rows.length - 1 ? 'border-b border-gray-200' : ''
                }`}
              >
                <div className="pr-6">
                  <div className="flex items-start gap-4 text-gray-500">
                    <X className="w-5 h-5 mt-0.5 flex-shrink-0 opacity-50" aria-hidden />
                    <span className="text-[17px] leading-[1.55]">{row.old}</span>
                  </div>
                </div>
                <div className="pl-6 border-l border-gray-200">
                  <div className="flex items-start gap-4 text-gray-900">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary-600" aria-hidden />
                    <span className="text-[17px] leading-[1.55] font-medium">{row.next}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AboutContainer>
    </section>
  );
};

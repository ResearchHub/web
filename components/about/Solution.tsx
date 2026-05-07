import { Check, X } from 'lucide-react';
import { cn } from '@/utils/styles';
import { AboutContainer } from './AboutContainer';
import { SectionHeader } from './SectionHeader';
import { MonoLabel } from './MonoLabel';

interface ComparisonRow {
  before: string;
  after: string;
}

const rows: ComparisonRow[] = [
  {
    before: 'Peer reviewers work for free',
    after: 'Peer reviewers are paid for fast, rigorous reviews',
  },
  {
    before: 'Papers locked behind paywalls',
    after: 'Research articles published openly — no paywalls, no delays',
  },
  {
    before: 'Grants take months or years to review',
    after: 'Funding opportunities are easy to find and simple to apply to',
  },
  {
    before: 'Most grant money goes to indirect costs',
    after: 'Capped indirect costs — more money to the actual experiments',
  },
];

export const Solution = () => (
  <section className="relative py-12 sm:py-16 md:py-24 lg:py-28 bg-white border-t border-gray-100">
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
        className="max-w-3xl"
      />

      <div className="mt-10 sm:mt-14 md:mt-16">
        {/* Mobile: card list showing the "after" column only */}
        <div className="md:hidden">
          <MonoLabel className="block text-[10px] uppercase tracking-[0.16em] text-primary-600 mb-3">
            On ResearchHub
          </MonoLabel>
          <div className="grid gap-3">
            {rows.map((row) => (
              <div
                key={row.before}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start gap-3 text-gray-900">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary-600" aria-hidden />
                  <span className="text-[15px] leading-[1.45] font-medium">{row.after}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: side-by-side comparison table */}
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
              key={row.before}
              className={cn(
                'px-10 py-7 grid grid-cols-2',
                index < rows.length - 1 && 'border-b border-gray-200'
              )}
            >
              <div className="pr-6">
                <div className="flex items-start gap-4 text-gray-500">
                  <X className="w-5 h-5 mt-0.5 flex-shrink-0 opacity-50" aria-hidden />
                  <span className="text-[17px] leading-[1.6]">{row.before}</span>
                </div>
              </div>
              <div className="pl-6 border-l border-gray-200">
                <div className="flex items-start gap-4 text-gray-900">
                  <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary-600" aria-hidden />
                  <span className="text-[17px] leading-[1.6] font-medium">{row.after}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AboutContainer>
  </section>
);

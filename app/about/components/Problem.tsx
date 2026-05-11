import { X } from 'lucide-react';
import { AboutContainer } from './AboutContainer';
import { SectionHeader } from './SectionHeader';
import { MonoLabel } from './MonoLabel';

interface Issue {
  number: string;
  title: string;
  description: string;
}

const issues: Issue[] = [
  {
    number: '01',
    title: "Peer reviewers aren't paid",
    description:
      'Slow reviews, inconsistent quality — scientists donate their time while publishers profit.',
  },
  {
    number: '02',
    title: 'Publishing takes years',
    description:
      'Convincing reviewers to work for free gets harder every year. Findings sit in limbo.',
  },
  {
    number: '03',
    title: 'Paywalls gatekeep research',
    description:
      "Taxpayers fund studies they can't read. Science is locked behind journal subscriptions.",
  },
  {
    number: '04',
    title: 'Grants are broken',
    description:
      'Review processes drag on for months or years — and much of the money goes to indirect costs, not experiments.',
  },
];

export const Problem = () => (
  <section id="problem" className="relative py-12 sm:py-20 md:py-28 lg:py-32 bg-white">
    <AboutContainer>
      <div className="grid gap-6 md:grid-cols-12 md:gap-10">
        <SectionHeader
          eyebrow="§ 01 · The problem"
          title={
            <>
              Science works,{' '}
              <span className="italic font-light text-gray-500">but could it work better?</span>
            </>
          }
          lead="It's no secret — just ask any scientist. The system is antiquated, and science is suffering as a result. There must be a better way."
          className="md:col-span-5"
        />
        <div className="md:col-span-7">
          {/* Mobile: compact cards */}
          <div className="md:hidden">
            <MonoLabel className="block text-[10px] uppercase tracking-[0.16em] text-gray-500 mb-3">
              Traditionally
            </MonoLabel>
            <div className="grid gap-3">
              {issues.map((issue) => (
                <div
                  key={issue.number}
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3 text-gray-900">
                    <X className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" aria-hidden />
                    <span className="text-[15px] leading-[1.45] font-medium">{issue.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop: detailed rows */}
          <div className="hidden md:block space-y-px bg-gray-200 border border-gray-200 rounded-2xl overflow-hidden">
            {issues.map((issue) => (
              <div
                key={issue.number}
                className="bg-white p-7 grid grid-cols-[auto_1fr] gap-7 items-start"
              >
                <MonoLabel className="text-[11px] uppercase tracking-[0.16em] text-gray-500 pt-1">
                  {issue.number}
                </MonoLabel>
                <div>
                  <h3 className="text-[21px] font-medium text-gray-900 tracking-[-0.015em]">
                    {issue.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-[1.6] text-gray-500">
                    {issue.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AboutContainer>
  </section>
);

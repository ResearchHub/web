import { AboutContainer } from './AboutContainer';
import { Eyebrow } from './Eyebrow';
import { MonoLabel } from './MonoLabel';

interface Issue {
  key: string;
  title: string;
  description: string;
}

const issues: Issue[] = [
  {
    key: '01',
    title: "Peer reviewers aren't paid",
    description:
      'Slow reviews, inconsistent quality — scientists donate their time while publishers profit.',
  },
  {
    key: '02',
    title: 'Publishing takes years',
    description:
      'Convincing reviewers to work for free gets harder every year. Findings sit in limbo.',
  },
  {
    key: '03',
    title: 'Paywalls gatekeep research',
    description:
      "Taxpayers fund studies they can't read. Science is locked behind journal subscriptions.",
  },
  {
    key: '04',
    title: 'Grants are broken',
    description:
      'Review processes drag on for months or years — and much of the money goes to indirect costs, not experiments.',
  },
];

export const Problem = () => {
  return (
    <section id="problem" className="relative py-12 sm:py-20 md:py-28 lg:py-32 bg-white">
      <AboutContainer>
        <div className="grid gap-6 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-5">
            <Eyebrow className="mb-4 sm:mb-5">§ 01 · The problem</Eyebrow>
            <h2
              className="font-medium tracking-[-0.022em] leading-[1.05] md:leading-[1.02] text-gray-900"
              style={{ fontSize: 'clamp(28px, 6vw, 56px)', textWrap: 'balance' }}
            >
              Science works, <span className="italic font-light text-gray-500">but barely.</span>
            </h2>
            <p className="mt-4 sm:mt-6 text-base sm:text-[17px] leading-[1.6] text-gray-500 max-w-md">
              It&apos;s no secret — just ask any scientist. The system is antiquated, and science is
              suffering as a result. There must be a better way.
            </p>
          </div>
          <div className="md:col-span-7 space-y-px bg-gray-200 border border-gray-200 rounded-xl sm:rounded-2xl overflow-hidden">
            {issues.map((issue) => (
              <div
                key={issue.key}
                className="bg-white p-4 sm:p-6 md:p-7 grid grid-cols-[auto_1fr] gap-4 sm:gap-5 md:gap-7 items-start"
              >
                <MonoLabel className="text-[11px] uppercase tracking-[0.16em] text-gray-500 pt-1">
                  {issue.key}
                </MonoLabel>
                <div>
                  <h3 className="text-[17px] sm:text-[19px] md:text-[21px] font-medium text-gray-900 tracking-[-0.01em]">
                    {issue.title}
                  </h3>
                  <p className="hidden sm:block mt-2 text-[14px] sm:text-[15px] leading-[1.6] text-gray-500">
                    {issue.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AboutContainer>
    </section>
  );
};

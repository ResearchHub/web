import 'cal-sans/index.css';
import Link from 'next/link';
import { Metadata } from 'next';
import { cn } from '@/utils/styles';
import { buildOpenGraphMetadata } from '@/lib/metadata';
import { PageLayout } from '@/app/layouts/PageLayout';
import { AboutTheJournal, RHJRightSidebar } from '@/components/Journal/RHJRightSidebar';
import { JournalNewPageContent } from './JournalNewPageContent';

export const metadata: Metadata = buildOpenGraphMetadata({
  title: 'ResearchHub Journal',
  description:
    'Where funded science becomes published science. Peer-reviewed registered reports from fully funded research proposals.',
  url: '/journal-new',
});

const PIPELINE_STEPS = [
  {
    label: 'Funded Proposal',
    description: 'Peer reviewed preregistrations',
    href: '/fund',
  },
  {
    label: 'ResearchHub Journal',
    description: 'Published as registered report',
    href: null,
  },
] as const;

const JournalFlaskMark = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 578 578" fill="currentColor" className={className} aria-hidden="true">
    <path d="M228.759 376.474L277.96 298.011V223.649H300.041V298.004L349.242 376.466H228.761V376.474H228.759ZM407.567 428.608L321.763 291.754V223.649H332.631C338.633 223.649 343.499 218.783 343.499 212.781C343.499 206.78 338.633 201.914 332.631 201.914H293.63H289.382H245.354C239.352 201.914 234.486 206.78 234.486 212.781C234.486 218.783 239.352 223.649 245.354 223.649H256.222V291.754L170.418 428.608C164.761 437.148 165.691 448.769 173.217 456.295C177.478 460.555 183.046 462.699 188.634 462.737H389.356C394.937 462.699 400.511 460.555 404.773 456.295C412.294 448.769 413.231 437.148 407.567 428.608Z" />
    <path d="M288.993 110.638C296.809 110.638 303.146 104.301 303.146 96.4848C303.146 88.6682 296.809 82.3315 288.993 82.3315C281.176 82.3315 274.839 88.6682 274.839 96.4848C274.839 104.301 281.176 110.638 288.993 110.638Z" />
    <path d="M235.998 171.879C247.214 171.879 256.306 162.787 256.306 151.571C256.306 140.356 247.214 131.263 235.998 131.263C224.783 131.263 215.691 140.356 215.691 151.571C215.691 162.787 224.783 171.879 235.998 171.879Z" />
    <path d="M362.086 154.823C363.883 143.752 356.365 133.321 345.294 131.524C334.223 129.727 323.792 137.245 321.995 148.316C320.198 159.387 327.716 169.819 338.787 171.615C349.858 173.412 360.29 165.894 362.086 154.823Z" />
  </svg>
);

const JournalIssueCards = () => {
  return (
    <div className="relative aspect-[3/4] w-[11.7rem] flex-shrink-0 sm:w-[13.5rem]">
      <div
        aria-hidden="true"
        className="absolute -inset-6 origin-bottom -rotate-[6deg] rounded-[2.5rem] bg-primary-500/25 blur-2xl"
      />

      {/* Back issue */}
      <div className="absolute inset-0 origin-bottom translate-x-3 translate-y-1 rotate-[4deg] rounded-2xl bg-gradient-to-br from-primary-300 to-primary-500 shadow-xl ring-1 ring-primary-400/30" />

      {/* Front issue */}
      <div className="absolute inset-0 origin-bottom -rotate-[5deg] flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 p-5 text-white shadow-2xl shadow-primary-900/40 ring-1 ring-primary-700/40">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '26px 26px',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-0 h-full w-px bg-white/15"
        />

        <div className="relative flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
          <span>Vol. 1 · 2026</span>
          <span>Open Access</span>
        </div>

        <div className="relative flex flex-1 items-center justify-center">
          <JournalFlaskMark className="h-20 w-20 text-white drop-shadow-lg" />
        </div>

        <div className="relative">
          <p className="text-2xl font-bold leading-tight tracking-tight">ResearchHub</p>
          <p className="text-2xl font-bold leading-tight tracking-tight">Journal</p>
          <p className="mt-2 text-[11px] font-medium tracking-wider text-white/60">
            ISSN 2837-5085
          </p>
        </div>
      </div>
    </div>
  );
};

const JournalTimeline = () => {
  return (
    <div className="mt-8 w-full max-w-lg overflow-x-auto pb-1">
      {/* Numbers + connecting line */}
      <div className="grid grid-cols-2">
        {PIPELINE_STEPS.map((step, index) => {
          const isCurrent = step.href === null;
          const isLast = index === PIPELINE_STEPS.length - 1;
          const number = String(index + 1).padStart(2, '0');

          return (
            <div key={step.label} className={cn('flex items-center', index > 0 && 'pl-6')}>
              <span
                className={cn(
                  'font-mono text-2xl font-medium tracking-wide',
                  isCurrent ? 'text-primary-600' : 'text-gray-400'
                )}
              >
                {number}
              </span>
              {!isLast && (
                <span
                  aria-hidden="true"
                  className="ml-6 h-px flex-1 bg-gradient-to-r from-gray-300 to-primary-400"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Labels + descriptions */}
      <div className="mt-3 grid grid-cols-2">
        {PIPELINE_STEPS.map((step, index) => {
          const isCurrent = step.href === null;

          const content = (
            <>
              <p
                className={cn(
                  'text-base font-semibold leading-tight',
                  isCurrent ? 'text-primary-700' : 'text-gray-900 group-hover:text-primary-700'
                )}
              >
                {step.label}
              </p>
              <p className="mt-1 text-xs leading-snug text-gray-500">{step.description}</p>
            </>
          );

          return (
            <div key={step.label} className={cn(index > 0 && 'pl-6')}>
              {step.href ? (
                <Link href={step.href} className="group block">
                  {content}
                </Link>
              ) : (
                content
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const JournalHero = () => {
  return (
    <div className="relative border-b border-gray-200 bg-gray-50">
      <div className="relative z-10 mx-auto max-w-[1180px] px-4 py-16 tablet:!px-8 sm:py-20">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h1
              className="text-4xl font-bold leading-[1.05] tracking-[-0.032em] text-[#0b1530] sm:text-5xl"
              style={{
                fontFamily: "'Cal Sans', var(--font-geist-sans), system-ui, sans-serif",
                textWrap: 'balance',
              }}
            >
              Where <span className="text-[#3971ff]">funded science</span> becomes published
              science.
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Funded science published as registered reports.
            </p>

            <JournalTimeline />
          </div>

          <div className="flex justify-center lg:justify-end lg:pr-6">
            <JournalIssueCards />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function JournalNewPage() {
  return (
    <PageLayout
      topBanner={<JournalHero />}
      rightSidebarAbove={<AboutTheJournal />}
      rightSidebar={<RHJRightSidebar showBanner={false} showAbout={false} />}
    >
      <JournalNewPageContent />
    </PageLayout>
  );
}

import 'cal-sans/index.css';
import Link from 'next/link';
import { Metadata } from 'next';
import { Landmark } from 'lucide-react';
import { cn } from '@/utils/styles';
import { buildOpenGraphMetadata } from '@/lib/metadata';
import { PageLayout } from '@/app/layouts/PageLayout';
import { Icon } from '@/components/ui/icons/Icon';
import {
  AboutTheJournal,
  AboutTheJournalContent,
  CollapsibleEditorialBoardSection,
  JournalResources,
  RHJRightSidebar,
} from '@/components/Journal/RHJRightSidebar';
import { JournalCollapsibleSection } from '@/components/Journal/JournalCollapsibleSection';
import { JournalPageContent } from './JournalPageContent';

export const metadata: Metadata = buildOpenGraphMetadata({
  title: 'ResearchHub Journal',
  description:
    'Where funded science becomes published science. Peer-reviewed registered reports from fully funded research proposals.',
  url: '/journal',
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

const JournalIssueCards = () => (
  <div className="relative aspect-[3/4] w-[11.7rem] flex-shrink-0 sm:w-[13.5rem]">
    <div
      aria-hidden="true"
      className="absolute -inset-6 origin-bottom -rotate-[6deg] rounded-[2.5rem] bg-primary-500/25 blur-2xl"
    />

    <div className="absolute inset-0 origin-bottom translate-x-3 translate-y-1 rotate-[4deg] rounded-2xl bg-gradient-to-br from-primary-300 to-primary-500 shadow-xl ring-1 ring-primary-400/30" />

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
        <Icon name="rhJournal2" size={80} color="white" className="drop-shadow-lg" />
      </div>

      <div className="relative">
        <p className="text-2xl font-bold leading-tight tracking-tight">ResearchHub</p>
        <p className="text-2xl font-bold leading-tight tracking-tight">Journal</p>
        <p className="mt-2 text-[11px] font-medium tracking-wider text-white/60">ISSN 2837-5085</p>
      </div>
    </div>
  </div>
);

const JournalTimeline = () => (
  <div className="mt-8 w-full max-w-lg overflow-x-auto pb-1">
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

const MOBILE_SECTION_CLASS = 'rounded-xl border-t-0 bg-gray-50 px-4 py-3';

/**
 * The right sidebar is hidden below `lg`, and this page has no trigger for the
 * layout's mobile sidebar drawer, so mobile users get the same details here.
 * Both sections start collapsed to keep the reports themselves above the fold.
 */
const MobileJournalDetails = () => (
  <div className="my-4 space-y-2 lg:!hidden">
    <JournalCollapsibleSection
      title="Journal details"
      icon={<Landmark size={16} />}
      className={MOBILE_SECTION_CLASS}
    >
      <AboutTheJournalContent />
      <JournalResources className="mt-4 border-t border-gray-200 pt-3" />
    </JournalCollapsibleSection>

    <CollapsibleEditorialBoardSection className={MOBILE_SECTION_CLASS} />
  </div>
);

const JournalHero = () => (
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
            Where <span className="text-[#3971ff]">funded science</span> becomes published science.
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

export default function JournalNewPage() {
  return (
    <PageLayout
      topBanner={<JournalHero />}
      rightSidebar={
        <div className="space-y-3">
          <AboutTheJournal />
          <RHJRightSidebar showBanner={false} />
        </div>
      }
    >
      <MobileJournalDetails />
      <JournalPageContent />
    </PageLayout>
  );
}

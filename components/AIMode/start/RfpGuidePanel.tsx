'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, ChevronRight, CircleCheck } from 'lucide-react';
import { SwipeableDrawer } from '@/components/ui/SwipeableDrawer';
import AnalyticsService, { LogEvent } from '@/services/analytics.service';
import type { SelectedGrantDetails } from '@/types/grant';
import { formatCompactAmount } from '@/utils/currency';
import type { RfpGuide } from '../rfpGuide';

interface RfpGuideProps {
  readonly guide: RfpGuide;
  /** The RFP the guide is for, picked on the start screen. */
  readonly grant: SelectedGrantDetails;
}

/** A way back to the RFP's page from the guide, for the funnel. */
function logReadRfp(grant: SelectedGrantDetails, placement: 'cover' | 'button' | 'sheet') {
  AnalyticsService.logEvent(LogEvent.RFP_GUIDE_READ_CLICKED, { grant_id: grant.id, placement });
}

/** "ResearchHub · $100k goal · about 2 pages" */
function factsLine(guide: RfpGuide, grant: SelectedGrantDetails): string {
  const funding =
    guide.fundingLabel ??
    (grant.fundingAmount > 0 ? `${formatCompactAmount(grant.fundingAmount)} funding` : null);
  return [grant.organization.trim(), funding, guide.length].filter(Boolean).join(' · ');
}

/**
 * The column beside the start screen's chat, where the document will be once
 * drafting starts: the RFP's cover and name, what it is after, the parts a
 * proposal should cover, numbered, and a way back to the full call.
 */
export function RfpGuidePanel({ guide, grant }: RfpGuideProps) {
  return (
    <section
      aria-labelledby="rfp-guide-title"
      data-testid="workspace-rfp-guide"
      className="flex h-full flex-col overflow-y-auto"
    >
      {grant.imageUrl &&
        (guide.pageHref ? (
          <Link
            href={guide.pageHref}
            aria-label={`Read the RFP: ${grant.shortTitle}`}
            onClick={() => logReadRfp(grant, 'cover')}
            className="block shrink-0 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-300"
          >
            <GuideCover src={grant.imageUrl} />
          </Link>
        ) : (
          <GuideCover src={grant.imageUrl} />
        ))}
      <div className="flex flex-1 flex-col gap-4 px-7 pb-6 pt-5">
        <header className="flex flex-col gap-1.5">
          <h3 id="rfp-guide-title" className="font-serif text-[22px] leading-tight text-gray-900">
            {grant.shortTitle}
          </h3>
          <p className="text-[13px] text-gray-500">{factsLine(guide, grant)}</p>
        </header>
        {guide.summary && <p className="text-sm leading-relaxed text-gray-600">{guide.summary}</p>}

        <ol aria-label="What to put in your proposal" className="flex flex-col">
          {guide.include.map((item, index) => (
            <li
              key={item.title}
              className="grid grid-cols-[28px_minmax(0,1fr)] gap-1 border-t border-gray-100 py-2.5"
            >
              <span className="text-[13px] tabular-nums text-gray-400">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="flex flex-col gap-px">
                <span className="text-sm font-medium text-gray-900">{item.title}</span>
                <span className="text-[13px] text-gray-500">{item.text}</span>
              </span>
            </li>
          ))}
        </ol>

        {guide.pageHref && (
          <Link
            href={guide.pageHref}
            onClick={() => logReadRfp(grant, 'button')}
            className="mt-auto inline-flex h-9 items-center gap-1.5 self-start rounded-lg border border-gray-300 px-3.5 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50"
          >
            Read the RFP
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        )}
      </div>
    </section>
  );
}

/**
 * Under the composer, where there is no room for the column: one row naming
 * the guide, which opens it in a sheet from the bottom of the screen.
 */
export function RfpGuideRow({ guide, grant }: RfpGuideProps) {
  const [open, setOpen] = useState(false);
  const parts = `${guide.include.length} parts · ${guide.length}`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        data-testid="workspace-rfp-guide"
        className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-left transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
      >
        <GuideThumb grant={grant} />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-sm font-semibold text-gray-900">What to put in your proposal</span>
          <span className="text-[13px] text-gray-500">{parts}</span>
        </span>
        <ChevronRight className="h-[18px] w-[18px] shrink-0 text-gray-400" aria-hidden="true" />
      </button>

      <SwipeableDrawer
        isOpen={open}
        onClose={() => setOpen(false)}
        height="auto"
        className="max-h-[calc(100dvh-2rem)]"
        header={
          <div className="flex items-center gap-3 pr-8">
            <GuideThumb grant={grant} large />
            <span className="flex min-w-0 flex-col gap-px">
              <span className="text-[15px] font-semibold text-gray-900">
                What to put in your proposal
              </span>
              <span className="line-clamp-2 text-[13px] text-gray-500">
                {grant.shortTitle} · {guide.length}
              </span>
            </span>
          </div>
        }
      >
        <ul className="flex flex-col pb-2">
          {guide.include.map((item) => (
            <li key={item.title} className="flex gap-3 border-t border-gray-100 py-2.5">
              <CircleCheck
                className="mt-px h-[18px] w-[18px] shrink-0 text-gray-400"
                strokeWidth={1.8}
                aria-hidden="true"
              />
              <span className="flex flex-col gap-px">
                <span className="text-sm font-medium text-gray-900">{item.title}</span>
                <span className="text-[13px] leading-snug text-gray-500">{item.text}</span>
              </span>
            </li>
          ))}
        </ul>
        {guide.pageHref && (
          <Link
            href={guide.pageHref}
            onClick={() => logReadRfp(grant, 'sheet')}
            className="inline-flex items-center gap-1 pb-4 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Read the RFP
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        )}
      </SwipeableDrawer>
    </>
  );
}

/** The RFP's cover across the top of the column. */
function GuideCover({ src }: { src: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className="h-[150px] w-full border-b border-gray-100 object-cover" />
  );
}

function GuideThumb({ grant, large = false }: { grant: SelectedGrantDetails; large?: boolean }) {
  const size = large ? 'h-11 w-11' : 'h-10 w-10';
  if (!grant.imageUrl) {
    return <span aria-hidden="true" className={`${size} shrink-0 rounded-lg bg-gray-100`} />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={grant.imageUrl}
      alt=""
      className={`${size} shrink-0 rounded-lg object-cover ring-1 ring-black/5`}
    />
  );
}

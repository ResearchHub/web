'use client';

import { FC, useMemo } from 'react';
import { ClipboardCheck, Lock, HandCoins, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Icon from '@/components/ui/icons/Icon';
import { FeedItemPaper } from '@/components/Feed/items/FeedItemPaper';
import { registeredReports, buildFeedEntry, buildReportUrl } from './lib/mockData';

const STAGE_LABEL: Record<string, string> = {
  funding: 'Funding opportunity',
  proposal: 'Funded proposal',
  report: 'Registered Report · Stage 1 accepted',
  results: 'Results · Stage 2 published',
};

export const RhJournalFeed: FC = () => {
  const cards = useMemo(
    () =>
      registeredReports.map((report) => ({
        report,
        entry: buildFeedEntry(report),
        href: buildReportUrl(report),
      })),
    []
  );

  return (
    <div className="space-y-5">
      {/* Journal masthead */}
      <div className="overflow-hidden rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 via-white to-white">
        <div className="p-6 sm:!p-8">
          <div className="mb-3 flex items-center gap-2">
            <Icon name="rhJournal2" size={28} color="#3971ff" />
            <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary-700">
              Peer-reviewed · Open access
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 sm:!text-3xl">
            The Journal of Registered Reports
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-gray-600">
            A journal for proposals funded on ResearchHub. Every study here was crowdfunded as a
            proposal, had its methods peer reviewed and <span className="font-medium">locked</span>{' '}
            before any data were collected, and is committed to publication{' '}
            <span className="font-medium">regardless of the outcome</span> — so the scientific
            record isn&apos;t skewed toward positive results.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:!grid-cols-3">
            {[
              {
                icon: HandCoins,
                title: 'Funded first',
                text: 'Backed by the community as a proposal',
              },
              {
                icon: Lock,
                title: 'Reviewed pre-results',
                text: 'Protocol locked before data collection',
              },
              {
                icon: ClipboardCheck,
                title: 'Published either way',
                text: 'Null results count too',
              },
            ].map((f) => {
              const F = f.icon;
              return (
                <div
                  key={f.title}
                  className="flex items-start gap-2.5 rounded-lg border border-gray-100 bg-white/70 p-3"
                >
                  <div className="rounded-full bg-primary-50 p-1.5">
                    <F size={16} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{f.title}</p>
                    <p className="text-xs leading-snug text-gray-500">{f.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              href="/paper/create"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-700"
            >
              Submit a Registered Report
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/fund"
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Browse funding opportunities
            </Link>
          </div>
        </div>
      </div>

      {/* Section heading */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-semibold text-gray-900">Latest registered reports</h2>
        <span className="text-sm text-gray-500">{cards.length} accepted protocols</span>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {cards.map(({ report, entry, href }) => (
          <div key={report.id} className="relative">
            <div className="mb-2 flex items-center gap-2 px-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700">
                <ClipboardCheck size={13} />
                {STAGE_LABEL[report.stage]}
              </span>
              <span className="text-xs text-gray-400">
                Funded ${report.funding.amountUsd.toLocaleString()} · {report.funding.contributors}{' '}
                backers
              </span>
            </div>
            <FeedItemPaper entry={entry} href={href} showActions maxLength={260} />
          </div>
        ))}
      </div>
    </div>
  );
};

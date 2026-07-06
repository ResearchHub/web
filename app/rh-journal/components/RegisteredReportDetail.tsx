'use client';

import { FC, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Star,
  Bookmark,
  Share2,
  Quote,
  Lock,
  BadgeCheck,
  HandCoins,
  Users,
  CalendarDays,
  FileText,
  ClipboardCheck,
  MessageSquare,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/utils/styles';
import Icon from '@/components/ui/icons/Icon';
import { Avatar } from '@/components/ui/Avatar';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { TopicAndJournalBadge } from '@/components/ui/TopicAndJournalBadge';
import { PageLayout } from '@/app/layouts/PageLayout';
import { formatTimestamp } from '@/utils/date';
import { RegisteredReport } from '../lib/mockData';
import { RegisteredReportTracker } from './RegisteredReportTracker';

type Tab = 'report' | 'reviews' | 'discussion';

interface RegisteredReportDetailProps {
  report: RegisteredReport;
}

const formatUsd = (n: number) => `$${n.toLocaleString()}`;

export const RegisteredReportDetail: FC<RegisteredReportDetailProps> = ({ report }) => {
  const [activeTab, setActiveTab] = useState<Tab>('report');

  const topBanner = (
    <div className="border-b border-gray-200 bg-white">
      <div className="mx-auto w-full max-w-[1180px] px-4 pb-2 pt-4 tablet:!px-8">
        {/* Breadcrumb */}
        <div className="mb-3 flex flex-wrap items-center gap-1.5 text-sm text-gray-500">
          <Link
            href="/rh-journal"
            className="inline-flex items-center gap-1 hover:text-primary-600"
          >
            <ArrowLeft size={14} />
            Journal of Registered Reports
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-700">{report.topics[0]?.name}</span>
        </div>

        {/* Eyebrow */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            <ClipboardCheck size={13} />
            Registered Report
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <BadgeCheck size={13} />
            Stage 1 · In-principle acceptance
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            <Lock size={12} />
            Protocol locked
          </span>
        </div>

        {/* Title */}
        <h1 className="max-w-4xl text-2xl font-bold leading-tight text-gray-900 sm:!text-3xl">
          {report.title}
        </h1>

        {/* Author + meta row */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
          <div className="flex items-center -space-x-2">
            {report.authors.slice(0, 4).map((a) => (
              <Avatar
                key={a.id}
                src={a.image || ''}
                alt={a.name}
                size={28}
                authorId={a.id}
                disableTooltip
                className="ring-2 ring-white"
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1">
            {report.authors.map((a, i) => (
              <span key={a.id} className="inline-flex items-center gap-1 text-gray-700">
                <span className="hover:text-primary-600">{a.name}</span>
                {a.verified && <VerifiedBadge size="sm" />}
                {i < report.authors.length - 1 && <span className="text-gray-400">,</span>}
              </span>
            ))}
          </div>
          <span className="text-gray-300">•</span>
          <span className="whitespace-nowrap">{formatTimestamp(report.stageDate, false)}</span>
          <span className="text-gray-300">•</span>
          <span className="inline-flex items-center gap-1">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            <span className="font-medium text-gray-700">{report.reviewScore.toFixed(1)}</span>
            <span className="text-gray-400">({report.reviewCount} reviews)</span>
          </span>
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
            <Quote size={15} />
            Cite
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
            <Bookmark size={15} />
            Save
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
            <Share2 size={15} />
            Share
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex items-center gap-1 border-t border-gray-100 pt-1">
          {(
            [
              { key: 'report', label: 'Registered Report', icon: FileText },
              { key: 'reviews', label: `Reviews (${report.reviewCount})`, icon: Star },
              { key: 'discussion', label: 'Discussion', icon: MessageSquare },
            ] as { key: Tab; label: string; icon: typeof FileText }[]
          ).map((t) => {
            const T = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={cn(
                  'inline-flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
                  activeTab === t.key
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                )}
              >
                <T size={15} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <PageLayout topBanner={topBanner} rightSidebar={<ReportSidebar report={report} />}>
      <div className="space-y-6 py-2">
        {/* Pizza tracker */}
        <RegisteredReportTracker currentStage={report.stage} />

        {activeTab === 'report' && <ReportBody report={report} />}
        {activeTab === 'reviews' && <ReviewsTab report={report} />}
        {activeTab === 'discussion' && <DiscussionTab />}
      </div>
    </PageLayout>
  );
};

const ReportBody: FC<{ report: RegisteredReport }> = ({ report }) => (
  <>
    {/* Hero image */}
    <div className="relative aspect-[16/7] w-full overflow-hidden rounded-xl border border-gray-200">
      <Image src={report.image} alt={report.title} fill className="object-cover" sizes="860px" />
    </div>

    {/* Abstract */}
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-gray-900">Abstract</h2>
      <p className="leading-relaxed text-gray-700">{report.fullAbstract}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {report.topics.map((t) => (
          <TopicAndJournalBadge key={t.id} name={t.name} slug={t.slug} disableLink />
        ))}
      </div>
    </section>

    {/* Stage-1 callout */}
    <section className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-emerald-100 p-2">
          <BadgeCheck size={18} className="text-emerald-600" />
        </div>
        <div>
          <h3 className="font-semibold text-emerald-900">
            This protocol received in-principle acceptance
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-emerald-800">
            The introduction, hypotheses, and full methods below were peer reviewed and approved
            before any data were collected. The journal is committed to publishing the Stage 2
            results whether or not the hypotheses are supported, as long as the authors follow this
            registered protocol.
          </p>
        </div>
      </div>
    </section>

    {/* Hypotheses */}
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Hypotheses & predictions</h2>
      <div className="space-y-4">
        {report.hypotheses.map((h) => (
          <div key={h.label} className="flex gap-3">
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-primary-100 text-xs font-bold text-primary-700">
              {h.label}
            </span>
            <div>
              <p className="font-medium text-gray-900">{h.statement}</p>
              <p className="mt-1 text-sm text-gray-600">
                <span className="font-medium text-gray-500">Prediction: </span>
                {h.prediction}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* Study design table */}
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Study design at a glance</h2>
      <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:!grid-cols-2">
        {report.design.map((d) => (
          <div key={d.label} className="flex flex-col border-b border-gray-100 pb-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{d.label}</dt>
            <dd className="mt-0.5 text-sm text-gray-800">{d.value}</dd>
          </div>
        ))}
      </dl>
    </section>

    {/* Narrative sections */}
    {report.sections.map((s) => (
      <section key={s.heading} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">{s.heading}</h2>
        <div className="space-y-3">
          {s.paragraphs.map((p, i) => (
            <p key={i} className="leading-relaxed text-gray-700">
              {p}
            </p>
          ))}
        </div>
      </section>
    ))}

    {/* Results placeholder */}
    <section className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
      <FileText size={22} className="mx-auto mb-2 text-gray-400" />
      <h3 className="font-semibold text-gray-700">Stage 2 results — coming soon</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
        Data collection is underway. Once complete, the authors will add results and discussion to
        this registered report and it will advance to the{' '}
        <span className="font-medium text-gray-700">Results</span> stage.
      </p>
    </section>
  </>
);

const ReviewsTab: FC<{ report: RegisteredReport }> = ({ report }) => (
  <div className="space-y-4">
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900">{report.reviewScore.toFixed(1)}</div>
          <div className="mt-1 flex items-center justify-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={14}
                className={cn(
                  i <= Math.round(report.reviewScore)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-gray-200 text-gray-200'
                )}
              />
            ))}
          </div>
          <div className="mt-1 text-xs text-gray-500">{report.reviewCount} reviews</div>
        </div>
        <div className="flex-1 border-l border-gray-100 pl-4 text-sm text-gray-600">
          These reviews evaluated the Stage 1 protocol — the rationale, hypotheses, and methods —
          before data collection. Reviewers assessed whether the design can deliver an interpretable
          answer regardless of outcome.
        </div>
      </div>
    </div>

    {report.reviews.map((r) => (
      <div key={r.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Avatar
              src=""
              alt={r.author.fullName}
              size={32}
              authorId={r.author.id}
              disableTooltip
            />
            <div>
              <div className="flex items-center gap-1 text-sm font-medium text-gray-800">
                {r.author.fullName}
                {r.author.isVerified && <VerifiedBadge size="sm" />}
              </div>
              <div className="text-xs text-gray-400">Verified peer reviewer</div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-sm font-semibold text-amber-700">
            <Star size={13} className="fill-amber-400 text-amber-400" />
            {r.score.toFixed(1)}
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          The hypotheses are clearly falsifiable and the analysis plan is fully specified with
          appropriate power. Sampling and blinding safeguards are adequate; I recommend in-principle
          acceptance with minor clarifications to the exclusion criteria.
        </p>
      </div>
    ))}
  </div>
);

const DiscussionTab: FC = () => (
  <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
    <MessageSquare size={22} className="mx-auto mb-2 text-gray-400" />
    <h3 className="font-semibold text-gray-700">Join the discussion</h3>
    <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
      Comments and open questions about this registered report will appear here.
    </p>
  </div>
);

const ReportSidebar: FC<{ report: RegisteredReport }> = ({ report }) => (
  <div className="space-y-4">
    {/* Funding provenance */}
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <div className="rounded-full bg-emerald-50 p-1.5">
          <HandCoins size={16} className="text-emerald-600" />
        </div>
        <h3 className="text-base font-semibold text-gray-800">Funded on ResearchHub</h3>
      </div>
      <div className="text-2xl font-bold text-gray-900">{formatUsd(report.funding.amountUsd)}</div>
      <p className="text-xs text-gray-500">
        {report.funding.amountRsc.toLocaleString()} RSC raised from {report.funding.contributors}{' '}
        backers
      </p>
      <div className="mt-3 space-y-2 border-t border-gray-100 pt-3 text-sm">
        <div className="flex items-start gap-2">
          <Users size={14} className="mt-0.5 flex-shrink-0 text-gray-400" />
          <span className="text-gray-600">{report.funding.funder}</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays size={14} className="flex-shrink-0 text-gray-400" />
          <span className="text-gray-600">
            Funded {formatTimestamp(report.funding.fundedDate, false)}
          </span>
        </div>
      </div>
      <Link
        href="/fund"
        className="mt-3 block text-center text-sm font-medium text-primary-600 hover:text-primary-700"
      >
        View funding opportunity →
      </Link>
    </div>

    {/* Registration details */}
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-800">
        <Lock size={15} className="text-gray-400" />
        Registration
      </h3>
      <dl className="space-y-2.5 text-sm">
        <div>
          <dt className="text-xs text-gray-400">In-principle acceptance</dt>
          <dd className="text-gray-700">
            {formatTimestamp(report.inPrincipleAcceptanceDate, false)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-gray-400">Protocol DOI</dt>
          <dd className="break-all font-mono text-xs text-primary-600">{report.registrationDoi}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-400">Report DOI</dt>
          <dd className="break-all font-mono text-xs text-primary-600">{report.doi}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-400">Keywords</dt>
          <dd className="mt-1 flex flex-wrap gap-1">
            {report.keywords.map((k) => (
              <span key={k} className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                {k}
              </span>
            ))}
          </dd>
        </div>
      </dl>
    </div>

    {/* Peer review summary */}
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-800">
        <Icon name="peerReview1" size={18} color="#3971ff" />
        Peer review
      </h3>
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold text-gray-900">{report.reviewScore.toFixed(1)}</span>
        <div>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={13}
                className={cn(
                  i <= Math.round(report.reviewScore)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-gray-200 text-gray-200'
                )}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">{report.reviewCount} verified reviewers</span>
        </div>
      </div>
      <div className="mt-3 flex -space-x-2">
        {report.reviews.map((r) => (
          <Avatar
            key={r.id}
            src=""
            alt={r.author.fullName}
            size={28}
            authorId={r.author.id}
            disableTooltip
            className="ring-2 ring-white"
          />
        ))}
      </div>
    </div>
  </div>
);

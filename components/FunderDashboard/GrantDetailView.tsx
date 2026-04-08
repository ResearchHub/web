'use client';

import { FC, useState } from 'react';
import {
  GrantSummary,
  ProposalSummary,
  HumanReview,
  StoryUpdate,
  getAllStories,
  getPrimaryStory,
  getFundingQualityConfig,
  formatStoryDate,
} from './mockData';
import { cn } from '@/utils/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faCircleExclamation } from '@fortawesome/pro-solid-svg-icons';
import { Tabs } from '@/components/ui/Tabs';
import {
  ArrowLeft,
  ChevronDown,
  Star,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Globe,
  Music,
} from 'lucide-react';

interface GrantDetailViewProps {
  grant: GrantSummary;
  onBack: () => void;
}

// ─── Snapshot Stats ───────────────────────────────────────────────

const SnapshotStats: FC<{ grant: GrantSummary }> = ({ grant }) => {
  const fmt = (n: number) => {
    if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
    return `$${n}`;
  };

  const stats = [
    { label: 'Available', value: fmt(grant.budgetAmount.usd), subtitle: 'Total funding budget' },
    { label: 'Distributed', value: fmt(grant.distributedAmount.usd), subtitle: 'Funded by you' },
    { label: 'Matched', value: fmt(grant.matchedAmount.usd), subtitle: 'Community contributions' },
    { label: 'Applicants', value: String(grant.proposals.length), subtitle: 'Active proposals' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-xl border border-gray-200 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
        >
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            {stat.label}
          </div>
          <div className="text-xl font-extrabold font-mono tracking-tight mt-0.5 text-gray-900">
            {stat.value}
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">{stat.subtitle}</div>
        </div>
      ))}
    </div>
  );
};

// ─── Expandable Proposal Row ──────────────────────────────────────

const FundingQualityBadge: FC<{ quality: ProposalSummary['fundingQuality'] }> = ({ quality }) => {
  const config = getFundingQualityConfig(quality);
  const Icon =
    quality === 'safe' ? ShieldCheck : quality === 'caution' ? ShieldAlert : AlertTriangle;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold border',
        config.className
      )}
    >
      <Icon size={12} />
      {config.label}
    </span>
  );
};

const HumanReviewCard: FC<{ review: HumanReview }> = ({ review }) => (
  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
    <div className="flex items-center justify-between mb-1.5">
      <div className="flex items-center gap-2">
        <img
          src={`https://i.pravatar.cc/40?u=${review.reviewerName.toLowerCase().replace(/\s+/g, '-')}`}
          alt={review.reviewerName}
          className="w-7 h-7 rounded-full object-cover flex-shrink-0"
        />
        <div>
          <span className="text-[12px] font-semibold text-gray-900">{review.reviewerName}</span>
          <span className="text-[11px] text-gray-400 ml-1.5">{review.institution}</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Star size={12} className="fill-amber-400 text-amber-400" />
        <span className="text-[12px] font-bold text-gray-700">{review.score.toFixed(1)}</span>
      </div>
    </div>
    <p className="text-[12px] text-gray-600 leading-relaxed">{review.comment}</p>
    <div className="text-[10px] text-gray-400 mt-1.5">{formatStoryDate(review.date)}</div>
  </div>
);

const ProposalRowExpandable: FC<{
  proposal: ProposalSummary;
  isLast: boolean;
}> = ({ proposal, isLast }) => {
  const [expanded, setExpanded] = useState(false);

  const askAmount = proposal.goalAmount.usd;
  const fmt = (n: number) => {
    if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
    return `$${n}`;
  };

  return (
    <div className={cn(!isLast && !expanded && 'border-b border-gray-100')}>
      {/* Main row */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={cn(
          'w-full grid items-center gap-3 px-5 py-3 hover:bg-gray-50/80 transition-colors cursor-pointer text-left',
          expanded && 'bg-gray-50/60'
        )}
        style={{ gridTemplateColumns: '80px 1fr auto auto auto' }}
      >
        {/* Ask amount */}
        <div className="text-center py-1 px-0.5 border-r border-gray-200">
          <div className="text-sm font-extrabold font-mono tracking-tight text-gray-900">
            {fmt(askAmount)}
          </div>
          <div className="text-[8.5px] font-bold uppercase text-gray-400 tracking-wide">
            requested
          </div>
        </div>

        {/* Title + author */}
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-gray-900 truncate leading-snug mb-0.5">
            {proposal.title}
          </p>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0">
              {proposal.profile.fullName
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <span className="text-[12px] text-gray-500 truncate">{proposal.profile.fullName}</span>
            {proposal.profile.institution && (
              <>
                <span className="text-gray-300">·</span>
                <span className="text-[11px] text-gray-500 truncate">
                  {proposal.profile.institution}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Funding quality badge */}
        <div className="flex-shrink-0">
          <FundingQualityBadge quality={proposal.fundingQuality} />
        </div>

        {/* Review score */}
        <div className="flex-shrink-0">
          {proposal.reviewMetrics && proposal.reviewMetrics.avg > 0 ? (
            <span className="inline-flex items-center gap-1 text-[12px] font-medium text-gray-700">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              {proposal.reviewMetrics.avg.toFixed(1)}
              <span className="text-gray-400">({proposal.reviewMetrics.count})</span>
            </span>
          ) : (
            <span className="text-[10.5px] text-gray-400 whitespace-nowrap">No reviews</span>
          )}
        </div>

        {/* Chevron */}
        <div className="flex-shrink-0">
          <ChevronDown
            size={18}
            className={cn(
              'text-gray-400 transition-transform duration-200',
              expanded && 'rotate-180'
            )}
          />
        </div>
      </button>

      {/* Expanded panel */}
      {expanded && proposal.aiReview && (
        <div className="px-5 pb-4 bg-gray-50/40 border-b border-gray-200">
          <div className="ml-[92px]">
            {/* AI Review Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <div className="flex items-center gap-2 mb-2.5">
                <Sparkles size={16} className="text-primary-500" />
                <h4 className="text-[13px] font-bold text-gray-900">AI Peer Review Summary</h4>
                <span className="ml-auto">
                  <FundingQualityBadge quality={proposal.fundingQuality} />
                </span>
              </div>
              <p className="text-[12.5px] text-gray-600 leading-relaxed mb-3">
                {proposal.aiReview.summary}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <h5 className="text-[11px] font-bold text-emerald-500/80 uppercase tracking-wider mb-1.5">
                    Strengths
                  </h5>
                  <ul className="space-y-1.5">
                    {proposal.aiReview.strengths.map((s, i) => (
                      <li
                        key={i}
                        className="text-[12px] text-gray-600 leading-snug flex items-start gap-1.5"
                      >
                        <FontAwesomeIcon
                          icon={faCircleCheck}
                          className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0"
                        />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="text-[11px] font-bold text-red-400 uppercase tracking-wider mb-1.5">
                    Concerns
                  </h5>
                  <ul className="space-y-1.5">
                    {proposal.aiReview.concerns.map((c, i) => (
                      <li
                        key={i}
                        className="text-[12px] text-gray-600 leading-snug flex items-start gap-1.5"
                      >
                        <FontAwesomeIcon
                          icon={faCircleExclamation}
                          className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0"
                        />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Human Reviews */}
            <div>
              <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                Expert Reviews ({proposal.aiReview.humanReviews.length})
              </h4>
              <div className="space-y-2">
                {proposal.aiReview.humanReviews.map((review, i) => (
                  <HumanReviewCard key={i} review={review} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Activity Tab ─────────────────────────────────────────────────

const SourceLabel: FC<{ sourceType: StoryUpdate['sourceType']; source: string }> = ({
  sourceType,
  source,
}) => {
  switch (sourceType) {
    case 'x':
      return (
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-gray-900 text-white text-[10px] font-black leading-none">
            𝕏
          </span>
          <span className="text-[11px] font-semibold text-gray-500">x.com</span>
        </div>
      );
    case 'linkedin':
      return (
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-[#0A66C2] text-white text-[9px] font-extrabold leading-none">
            in
          </span>
          <span className="text-[11px] font-semibold text-gray-500">linkedin.com</span>
        </div>
      );
    case 'tiktok':
      return (
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-gray-900 text-white">
            <Music size={11} />
          </span>
          <span className="text-[11px] font-semibold text-gray-500">tiktok.com</span>
        </div>
      );
    default:
      return (
        <div className="flex items-center gap-1.5">
          <Globe size={14} className="text-gray-400 flex-shrink-0" />
          <span className="text-[11px] font-semibold text-gray-500">{source}</span>
        </div>
      );
  }
};

const ActivityTab: FC<{ grant: GrantSummary }> = ({ grant }) => {
  const stories = getAllStories(grant);

  return (
    <div className="divide-y divide-gray-100">
      {stories.map((story) => (
        <a
          key={story.id}
          href={story.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block py-3 px-5 group hover:bg-gray-50 transition-colors"
        >
          <SourceLabel sourceType={story.sourceType} source={story.source} />
          <p className="text-[13px] font-semibold text-gray-900 leading-snug group-hover:text-primary-600 transition-colors mt-1">
            {story.headline}
          </p>
          {story.excerpt && (
            <p className="text-[12px] text-gray-500 leading-relaxed mt-0.5 line-clamp-2">
              {story.excerpt}
            </p>
          )}
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[11px] text-gray-500">{formatStoryDate(story.date)}</span>
            <span className="text-gray-300">·</span>
            <span className="text-[11px] text-gray-600 font-medium">{story.researcherName}</span>
          </div>
        </a>
      ))}
    </div>
  );
};

// ─── Experts Tab ──────────────────────────────────────────────────

interface ExpertEntry {
  id: number;
  fullName: string;
  headline?: string;
  institution?: string;
  avatarUrl?: string;
  status: 'active' | 'invited';
}

const INVITED_EXPERTS: ExpertEntry[] = [
  {
    id: 901,
    fullName: 'Robin Carhart-Harris',
    headline: 'Professor of Neurology & Psychiatry',
    institution: 'UCSF',
    avatarUrl: 'https://i.pravatar.cc/80?u=robin-ch',
    status: 'invited',
  },
  {
    id: 902,
    fullName: 'Amanda Fielding',
    headline: 'Director, Beckley Foundation',
    institution: 'Beckley Foundation',
    avatarUrl: 'https://i.pravatar.cc/80?u=amanda-fielding',
    status: 'invited',
  },
  {
    id: 903,
    fullName: 'David Nutt',
    headline: 'Edmund J. Safra Professor of Neuropsychopharmacology',
    institution: 'Imperial College London',
    avatarUrl: 'https://i.pravatar.cc/80?u=david-nutt',
    status: 'invited',
  },
  {
    id: 904,
    fullName: 'Matthew Johnson',
    headline: 'Professor of Psychiatry',
    institution: 'Johns Hopkins',
    avatarUrl: 'https://i.pravatar.cc/80?u=matt-johnson',
    status: 'invited',
  },
];

const ExpertsTab: FC<{ grant: GrantSummary }> = ({ grant }) => {
  const activeExperts: ExpertEntry[] = grant.proposals.map((p) => ({
    id: p.profile.id,
    fullName: p.profile.fullName,
    headline: p.profile.headline,
    institution: p.profile.institution,
    avatarUrl: `https://i.pravatar.cc/80?u=${p.profile.fullName.toLowerCase().replace(/\s+/g, '-')}`,
    status: 'active' as const,
  }));

  const allExperts = [...activeExperts, ...INVITED_EXPERTS];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-5">
      {allExperts.map((expert) => (
        <div
          key={expert.id}
          className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
        >
          <img
            src={expert.avatarUrl}
            alt={expert.fullName}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
          <div className="min-w-0">
            <div className="text-[13px] font-bold text-gray-900">{expert.fullName}</div>
            {expert.headline && (
              <div className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">{expert.headline}</div>
            )}
            {expert.institution && (
              <div className="text-[11px] text-gray-400 mt-0.5">{expert.institution}</div>
            )}
            <span
              className={cn(
                'text-[10px] font-medium mt-1.5 block',
                expert.status === 'active' ? 'text-emerald-600' : 'text-primary-500'
              )}
            >
              {expert.status === 'active' ? 'Active Applicant' : 'Invited'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Proposals Tab ────────────────────────────────────────────────

const ProposalsTab: FC<{ grant: GrantSummary }> = ({ grant }) => {
  const sorted = [...grant.proposals].sort(
    (a, b) => (b.reviewMetrics?.avg ?? 0) - (a.reviewMetrics?.avg ?? 0)
  );

  return (
    <div>
      <div className="px-5 py-2.5 border-b border-gray-100 bg-gray-50/80 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
          {sorted.length} Proposals · Sorted by review score
        </span>
        <span className="text-[10px] text-gray-400">Click row to expand review details</span>
      </div>
      <div>
        {sorted.map((proposal, i) => (
          <ProposalRowExpandable
            key={proposal.id}
            proposal={proposal}
            isLast={i === sorted.length - 1}
          />
        ))}
      </div>
    </div>
  );
};

// ─── Main Detail View ─────────────────────────────────────────────

export const GrantDetailView: FC<GrantDetailViewProps> = ({ grant, onBack }) => {
  const [activeTab, setActiveTab] = useState('activity');

  const tabs = [
    { id: 'activity', label: 'Activity' },
    { id: 'experts', label: 'Experts' },
    { id: 'proposals', label: 'Proposals' },
  ];

  const primary = getPrimaryStory(grant);

  return (
    <div className="space-y-4">
      {/* Frosted header — mirrors FeedItemGrantWithApplicants */}
      <div className="relative h-[220px] sm:h-[180px] overflow-hidden rounded-2xl bg-gray-900">
        {grant.previewImage ? (
          <img
            src={grant.previewImage}
            alt={grant.shortTitle}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 25% 35%, rgba(251,146,60,0.55) 0%, transparent 50%), ' +
                'radial-gradient(ellipse at 55% 55%, rgba(59,130,246,0.45) 0%, transparent 45%), ' +
                'radial-gradient(ellipse at 80% 20%, rgba(244,63,94,0.35) 0%, transparent 40%), ' +
                'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            }}
          />
        )}
        <div className="absolute inset-0 bg-black/30" />

        {/* Back button */}
        <button
          type="button"
          onClick={onBack}
          className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-[12px] font-semibold transition-colors cursor-pointer border border-white/10"
        >
          <ArrowLeft size={14} />
          All Funding
        </button>

        {/* Frosted metadata bar */}
        <div
          className="absolute bottom-0 inset-x-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-0 px-6 py-3 border-t border-white/[0.06]"
          style={{
            backdropFilter: 'blur(16px) saturate(1.4)',
            WebkitBackdropFilter: 'blur(16px) saturate(1.4)',
            background: 'rgba(0,0,0,0.5)',
          }}
        >
          <div>
            <div className="text-[9px] font-semibold uppercase tracking-wider text-white/40 mb-0.5">
              {grant.organization}
            </div>
            <div className="text-lg font-extrabold text-white tracking-tight">
              {grant.shortTitle}
            </div>
          </div>
          <div className="flex gap-6">
            {[
              {
                label: 'Budget',
                value: `$${(grant.budgetAmount.usd / 1000).toFixed(0)}K`,
                accent: true,
              },
              { label: 'Proposals', value: String(grant.proposals.length), accent: false },
              { label: 'Status', value: grant.isActive ? 'Active' : 'Closed', accent: false },
            ].map((stat) => (
              <div key={stat.label} className="sm:text-right">
                <div className="text-[9px] uppercase tracking-wider font-semibold text-white/[0.38]">
                  {stat.label}
                </div>
                <div
                  className={cn(
                    'font-extrabold font-mono text-base',
                    stat.accent ? 'text-emerald-300' : 'text-white/80'
                  )}
                >
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Primary story */}
      {primary && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          {primary.embedType === 'tiktok' && primary.embedId ? (
            <div className="flex flex-col sm:flex-row">
              {/* Scaled-down TikTok embed */}
              <div className="sm:w-[200px] flex-shrink-0 bg-gray-950 flex items-center justify-center overflow-hidden">
                <iframe
                  src={`https://www.tiktok.com/player/v1/${primary.embedId}?rel=0`}
                  width="180"
                  height="320"
                  allowFullScreen
                  allow="encrypted-media"
                  frameBorder="0"
                  title="TikTok Video"
                  className="rounded-lg"
                />
              </div>
              <div className="p-5 flex flex-col justify-center">
                <div className="text-[13px] font-bold text-primary-600 mb-1">Top Story</div>
                <div className="flex items-center gap-2 mb-2">
                  <SourceLabel sourceType={primary.sourceType} source={primary.source} />
                  <span className="text-[11px] text-gray-500">{formatStoryDate(primary.date)}</span>
                </div>
                <h3 className="text-[17px] font-extrabold text-gray-900 leading-snug mb-1.5">
                  {primary.headline}
                </h3>
                {primary.excerpt && (
                  <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-2">
                    {primary.excerpt}
                  </p>
                )}
                <div className="mt-2 text-[12px] text-gray-400">{primary.researcherName}</div>
              </div>
            </div>
          ) : primary.embedType === 'linkedin' ? (
            <div className="flex flex-col sm:flex-row">
              {/* Scaled-down LinkedIn embed */}
              <div
                className="sm:w-[320px] flex-shrink-0 overflow-hidden"
                style={{ maxHeight: 300 }}
              >
                <iframe
                  src={`https://www.linkedin.com/embed/feed/update/urn:li:activity:${primary.url.match(/activity-(\d+)/)?.[1] || ''}`}
                  height="380"
                  width="calc(100% + 4px)"
                  frameBorder="0"
                  allowFullScreen
                  title="LinkedIn Post"
                  style={{ border: 'none', margin: '-2px' }}
                />
              </div>
              <div className="p-5 flex flex-col justify-center">
                <div className="text-[13px] font-bold text-primary-600 mb-1">Top Story</div>
                <div className="flex items-center gap-2 mb-2">
                  <SourceLabel sourceType={primary.sourceType} source={primary.source} />
                  <span className="text-[11px] text-gray-500">{formatStoryDate(primary.date)}</span>
                </div>
                <h3 className="text-[17px] font-extrabold text-gray-900 leading-snug mb-1.5">
                  {primary.headline}
                </h3>
                {primary.excerpt && (
                  <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-2">
                    {primary.excerpt}
                  </p>
                )}
                <div className="mt-2 text-[12px] text-gray-400">{primary.researcherName}</div>
              </div>
            </div>
          ) : (
            <a
              href={primary.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row">
                {primary.imageUrl && (
                  <div className="sm:w-[280px] h-[180px] sm:h-auto flex-shrink-0 relative overflow-hidden">
                    <img
                      src={primary.imageUrl}
                      alt={primary.headline}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-5 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <SourceLabel sourceType={primary.sourceType} source={primary.source} />
                    <span className="text-[11px] text-gray-500">
                      {formatStoryDate(primary.date)}
                    </span>
                    <span className="text-[11px] text-primary-500 font-medium ml-auto">
                      Top Story
                    </span>
                  </div>
                  <h3 className="text-[17px] font-extrabold text-gray-900 leading-snug mb-1.5 group-hover:text-primary-600 transition-colors">
                    {primary.headline}
                  </h3>
                  {primary.excerpt && (
                    <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-2">
                      {primary.excerpt}
                    </p>
                  )}
                  <div className="mt-2 text-[12px] text-gray-400">{primary.researcherName}</div>
                </div>
              </div>
            </a>
          )}
        </div>
      )}

      {/* Snapshot stats */}
      <SnapshotStats grant={grant} />

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="px-5">
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={(id) => setActiveTab(id)} />
        </div>

        {activeTab === 'activity' && <ActivityTab grant={grant} />}
        {activeTab === 'experts' && <ExpertsTab grant={grant} />}
        {activeTab === 'proposals' && <ProposalsTab grant={grant} />}
      </div>
    </div>
  );
};

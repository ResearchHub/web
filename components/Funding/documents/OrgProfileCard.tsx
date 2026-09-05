'use client';

import { Check, ExternalLink } from 'lucide-react';
import { cn } from '@/utils/styles';
import { WorkPreviewCard } from '@/components/Activity/work/WorkPreviewCard';
import { DocumentSection } from './DocumentSection';
import type { OrgProfile, OrgSectionId, PastGrant } from './types';

const formatUsd = (amount: number) => `$${amount.toLocaleString('en-US')}`;

const formatCompactUsd = (amount: number) =>
  amount >= 1_000_000
    ? `$${(amount / 1_000_000).toFixed(amount % 1_000_000 === 0 ? 0 : 1)}M`
    : `$${Math.round(amount / 1000)}K`;

/** Frosted pills that sit on the card image, so they read on any photo. */
const OUTCOME_LABEL: Record<
  PastGrant['outcome'],
  { label: string; className: string; dot: string }
> = {
  completed: {
    label: 'Completed',
    className: 'border-white/30 bg-white/85 text-gray-800',
    dot: 'bg-gray-500',
  },
  published: {
    label: 'Published',
    className: 'border-white/30 bg-white/85 text-emerald-800',
    dot: 'bg-emerald-500',
  },
  in_progress: {
    label: 'In progress',
    className: 'border-white/30 bg-white/85 text-amber-800',
    dot: 'bg-amber-500',
  },
};

const SectionHeading = ({ children }: { readonly children: string }) => (
  <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
    {children}
  </h3>
);

interface OrgProfileCardProps {
  readonly profile: OrgProfile;
  /** Section to scroll to and flash. */
  readonly highlightSectionId?: OrgSectionId | null;
  /** Bump to re-flash the same section. */
  readonly highlightKey?: string | number | null;
  readonly className?: string;
}

/**
 * Who the funder is and what they typically fund. Read-only everywhere it
 * appears today: in AI Mode the assistant reads this and cites it, and the
 * funder edits it on the org settings page rather than in a chat.
 */
export const OrgProfileCard = ({
  profile,
  highlightSectionId = null,
  highlightKey = null,
  className,
}: OrgProfileCardProps) => {
  const section = (id: OrgSectionId) => ({
    id,
    highlighted: highlightSectionId === id,
    highlightKey,
  });

  return (
    <div className={cn('text-[15px] leading-relaxed text-gray-800', className)}>
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-700 text-2xl font-bold text-white shadow-sm">
          {profile.name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-gray-900">
            {profile.name}
          </h1>
          <p className="mt-0.5 text-sm text-gray-600">{profile.tagline}</p>
          <a
            href={profile.website}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
          >
            {profile.website.replace(/^https?:\/\//, '')}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      <DocumentSection {...section('typicalGrant')} className="mt-7">
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: 'Typical grant',
              value: `${formatCompactUsd(profile.typicalGrantUsd.min)}–${formatCompactUsd(profile.typicalGrantUsd.max)}`,
            },
            { label: 'Programs per year', value: String(profile.grantsPerYear) },
            { label: 'Deployed to date', value: formatCompactUsd(profile.totalDeployedUsd) },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5"
            >
              <div className="text-lg font-semibold tracking-tight text-gray-900">{stat.value}</div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </DocumentSection>

      <DocumentSection {...section('mission')} className="mt-8">
        <SectionHeading>Mission</SectionHeading>
        <p>{profile.mission}</p>
      </DocumentSection>

      <DocumentSection {...section('focus')} className="mt-7">
        <SectionHeading>Focus areas</SectionHeading>
        <div className="flex flex-wrap gap-1.5">
          {profile.focusAreas.map((area) => (
            <span
              key={area}
              className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700"
            >
              {area}
            </span>
          ))}
        </div>
      </DocumentSection>

      <DocumentSection {...section('mechanisms')} className="mt-7">
        <SectionHeading>How they fund</SectionHeading>
        <ul className="space-y-1.5">
          {profile.mechanisms.map((mechanism) => (
            <li key={mechanism} className="flex gap-2.5">
              <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-gray-300" />
              <span>{mechanism}</span>
            </li>
          ))}
        </ul>
      </DocumentSection>

      <DocumentSection {...section('review')} className="mt-7">
        <SectionHeading>Conditions on every program</SectionHeading>
        <ul className="space-y-1.5">
          {profile.reviewPreferences.map((preference) => (
            <li key={preference} className="flex gap-2.5">
              <Check className="mt-[5px] h-4 w-4 shrink-0 text-emerald-600" />
              <span>{preference}</span>
            </li>
          ))}
        </ul>
      </DocumentSection>

      <DocumentSection {...section('history')} className="mt-7">
        <SectionHeading>Funding history</SectionHeading>
        <div className="grid gap-3">
          {profile.pastGrants.map((grant) => {
            const outcome = OUTCOME_LABEL[grant.outcome];
            return (
              <WorkPreviewCard
                key={grant.title}
                work={{ title: grant.title, href: '', imageUrl: grant.imageUrl }}
              >
                <WorkPreviewCard.Overlay position="top-right">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold backdrop-blur-md',
                      outcome.className
                    )}
                  >
                    <span className={cn('h-1.5 w-1.5 rounded-full', outcome.dot)} />
                    {outcome.label}
                  </span>
                </WorkPreviewCard.Overlay>
                <WorkPreviewCard.Metadata>
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="line-clamp-1 text-[14.5px] font-extrabold leading-snug tracking-tight text-white">
                        {grant.title}
                      </div>
                      <div className="mt-0.5 truncate text-[11px] text-white/70">
                        {grant.year} · {grant.note}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="whitespace-nowrap text-[9px] font-semibold uppercase tracking-wider text-white/50">
                        Funded
                      </div>
                      <div className="font-mono text-sm font-extrabold leading-tight text-white/80">
                        {formatUsd(grant.amountUsd)}
                      </div>
                    </div>
                  </div>
                </WorkPreviewCard.Metadata>
              </WorkPreviewCard>
            );
          })}
        </div>
      </DocumentSection>
    </div>
  );
};

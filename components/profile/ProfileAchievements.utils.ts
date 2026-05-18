import { Achievement, AchievementType } from '@/types/authorProfile';
import {
  faAward,
  faChartNetwork,
  faFire,
  faGlasses,
  faHandHoldingHeart,
  faQuoteLeft,
} from '@fortawesome/pro-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

const TIER_NAMES = ['Bronze', 'Silver', 'Gold'] as const;
type TierName = (typeof TIER_NAMES)[number];

export interface TierStyle {
  label: TierName;
  fill: string;
  facet: string;
  pillBg: string;
  pillText: string;
  pillBorder: string;
  barFill: string;
}

const TIER_STYLES: Record<TierName, Omit<TierStyle, 'label'>> = {
  Bronze: {
    fill: 'linear-gradient(145deg,#E0A26B 0%,#B57440 48%,#7C3A1A 100%)',
    facet:
      'linear-gradient(145deg,rgba(255,238,212,0.55) 0%,rgba(255,200,140,0.18) 48%,rgba(120,60,20,0) 100%)',
    pillBg: 'bg-amber-50',
    pillText: 'text-amber-800',
    pillBorder: 'border-amber-200',
    barFill: 'bg-gradient-to-r from-amber-700 to-amber-400',
  },
  Silver: {
    fill: 'linear-gradient(145deg,#E2E8F0 0%,#94A3B8 48%,#475569 100%)',
    facet:
      'linear-gradient(145deg,rgba(255,255,255,0.55) 0%,rgba(255,255,255,0.18) 48%,rgba(255,255,255,0) 100%)',
    pillBg: 'bg-slate-100',
    pillText: 'text-slate-700',
    pillBorder: 'border-slate-300',
    barFill: 'bg-gradient-to-r from-slate-600 to-slate-300',
  },
  Gold: {
    fill: 'linear-gradient(145deg,#FFE08A 0%,#D79A18 48%,#8A5A00 100%)',
    facet:
      'linear-gradient(145deg,rgba(255,255,255,0.55) 0%,rgba(255,235,170,0.18) 48%,rgba(255,255,255,0) 100%)',
    pillBg: 'bg-amber-100',
    pillText: 'text-amber-900',
    pillBorder: 'border-amber-300',
    barFill: 'bg-gradient-to-r from-yellow-600 to-yellow-300',
  },
};

const getTierStyleForIndex = (index: number): TierStyle => {
  const bounded = Math.min(Math.max(index, 0), TIER_NAMES.length - 1);
  const name = TIER_NAMES[bounded];
  return { label: name, ...TIER_STYLES[name] };
};

interface AchievementMeta {
  icon: IconDefinition;
  title: string;
  unit: string;
  /** Formats raw `Achievement.value` into the user-facing display value. */
  formatValue: (value: number) => string;
  /** Short narrative describing the achievement at the current value. */
  describe: (displayValue: string) => string;
}

const integerFormatter = (value: number) => Math.round(value).toLocaleString();

const percentFormatter = (value: number) => {
  const pct = value * 100;
  const formatted = Number.isInteger(pct) ? pct.toString() : pct.toFixed(1);
  return `${formatted}%`;
};

const ACHIEVEMENT_META: Record<AchievementType, AchievementMeta> = {
  OPEN_SCIENCE_SUPPORTER: {
    icon: faHandHoldingHeart,
    title: 'Open Science Supporter',
    unit: 'RSC',
    formatValue: integerFormatter,
    describe: (value) => `Funded open science using ${value} RSC.`,
  },
  CITED_AUTHOR: {
    icon: faQuoteLeft,
    title: 'Cited Author',
    unit: 'citations',
    formatValue: integerFormatter,
    describe: (value) => `Publications have been cited ${value} times.`,
  },
  EXPERT_PEER_REVIEWER: {
    icon: faGlasses,
    title: 'Peer Reviewer',
    unit: 'reviews',
    formatValue: integerFormatter,
    describe: (value) => `Peer reviewed ${value} publications.`,
  },
  HIGHLY_UPVOTED: {
    icon: faFire,
    title: 'Active User',
    unit: 'upvotes',
    formatValue: integerFormatter,
    describe: (value) => `Received ${value} upvotes from the community.`,
  },
  OPEN_ACCESS: {
    icon: faChartNetwork,
    title: 'Open Access Advocate',
    unit: '',
    formatValue: percentFormatter,
    describe: (value) => `${value} of works published as open access.`,
  },
};

const FALLBACK_META: AchievementMeta = {
  icon: faAward,
  title: 'Achievement',
  unit: '',
  formatValue: integerFormatter,
  describe: (value) => `Achieved ${value} points.`,
};

const toTitleCase = (text: string) =>
  text
    .replaceAll('_', ' ')
    .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.substring(1).toLowerCase());

const getAchievementMeta = (type: AchievementType): AchievementMeta => {
  return ACHIEVEMENT_META[type] ?? { ...FALLBACK_META, title: toTitleCase(type) };
};

export interface ResolvedAchievement {
  meta: AchievementMeta;
  tier: TierStyle;
  /** Styling for the next tier above the current one, when one exists. */
  nextTier: TierStyle | undefined;
  displayValue: string;
  /**
   * The value the progress row compares against on the right of the bar.
   * For in-progress tiers this is the next tier's milestone; for the top
   * tier it's the top tier's own milestone, so the row reads as
   * `value / threshold` (often value > threshold for max tier).
   */
  targetDisplayValue: string;
  progressPct: number;
  isTopTier: boolean;
}

export const resolveAchievement = (achievement: Achievement): ResolvedAchievement => {
  const meta = getAchievementMeta(achievement.type);
  const tier = getTierStyleForIndex(achievement.currentMilestoneIndex);

  const hasNextTier = achievement.currentMilestoneIndex + 1 < achievement.milestones.length;
  const nextTier = hasNextTier
    ? getTierStyleForIndex(achievement.currentMilestoneIndex + 1)
    : undefined;

  const isTopTier = !hasNextTier || achievement.currentMilestoneIndex >= TIER_NAMES.length - 1;

  const targetRawValue = isTopTier
    ? (achievement.milestones[achievement.currentMilestoneIndex] ?? 0)
    : (achievement.milestones[achievement.currentMilestoneIndex + 1] ?? 0);

  return {
    meta,
    tier,
    nextTier,
    displayValue: meta.formatValue(achievement.value),
    targetDisplayValue: meta.formatValue(targetRawValue),
    progressPct: Math.min(100, Math.max(0, achievement.pctProgress * 100)),
    isTopTier,
  };
};

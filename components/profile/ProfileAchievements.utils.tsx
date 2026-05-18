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

export const TIER_INDICES = ['Tier1', 'Tier2', 'Tier3'] as const;
export type TierName = (typeof TIER_INDICES)[number];

export interface TierStyle {
  name: TierName;
  label: string;
  fill: string;
  facet: string;
  iconColor: string;
  pillBg: string;
  pillText: string;
  pillBorder: string;
  barFill: string;
}

export const TIER_STYLES: Record<TierName, TierStyle> = {
  Tier1: {
    name: 'Tier1',
    label: 'Bronze',
    fill: 'linear-gradient(145deg,#E0A26B 0%,#B57440 48%,#7C3A1A 100%)',
    facet:
      'linear-gradient(145deg,rgba(255,238,212,0.55) 0%,rgba(255,200,140,0.18) 48%,rgba(120,60,20,0) 100%)',
    iconColor: '#FFFFFF',
    pillBg: 'bg-amber-50',
    pillText: 'text-amber-800',
    pillBorder: 'border-amber-200',
    barFill: 'bg-gradient-to-r from-amber-700 to-amber-400',
  },
  Tier2: {
    name: 'Tier2',
    label: 'Silver',
    fill: 'linear-gradient(145deg,#E2E8F0 0%,#94A3B8 48%,#475569 100%)',
    facet:
      'linear-gradient(145deg,rgba(255,255,255,0.55) 0%,rgba(255,255,255,0.18) 48%,rgba(255,255,255,0) 100%)',
    iconColor: '#FFFFFF',
    pillBg: 'bg-slate-100',
    pillText: 'text-slate-700',
    pillBorder: 'border-slate-300',
    barFill: 'bg-gradient-to-r from-slate-600 to-slate-300',
  },
  Tier3: {
    name: 'Tier3',
    label: 'Gold',
    fill: 'linear-gradient(145deg,#FFE08A 0%,#D79A18 48%,#8A5A00 100%)',
    facet:
      'linear-gradient(145deg,rgba(255,255,255,0.55) 0%,rgba(255,235,170,0.18) 48%,rgba(255,255,255,0) 100%)',
    iconColor: '#FFFFFF',
    pillBg: 'bg-amber-100',
    pillText: 'text-amber-900',
    pillBorder: 'border-amber-300',
    barFill: 'bg-gradient-to-r from-yellow-600 to-yellow-300',
  },
};

const getTierNameForIndex = (index: number): TierName => {
  const boundedIndex = Math.min(Math.max(index, 0), TIER_INDICES.length - 1);
  return TIER_INDICES[boundedIndex];
};

export const getTierStyleForIndex = (index: number): TierStyle => {
  const name = getTierNameForIndex(index);
  return TIER_STYLES[name];
};

export const getTierLabelForIndex = (index: number): string => getTierStyleForIndex(index).label;

export interface AchievementMeta {
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
  const percentage = value * 100;
  const displayValue = Number.isInteger(percentage) ? percentage.toString() : percentage.toFixed(1);
  return `${displayValue}%`;
};

const ACHIEVEMENT_META: Record<AchievementType, AchievementMeta> = {
  OPEN_SCIENCE_SUPPORTER: {
    icon: faHandHoldingHeart,
    title: 'Open Science Supporter',
    unit: ' RSC',
    formatValue: integerFormatter,
    describe: (value) => `Funded open science using ${value} RSC.`,
  },
  CITED_AUTHOR: {
    icon: faQuoteLeft,
    title: 'Cited Author',
    unit: ' citations',
    formatValue: integerFormatter,
    describe: (value) => `Publications have been cited ${value} times.`,
  },
  EXPERT_PEER_REVIEWER: {
    icon: faGlasses,
    title: 'Peer Reviewer',
    unit: ' reviews',
    formatValue: integerFormatter,
    describe: (value) => `Peer reviewed ${value} publications.`,
  },
  HIGHLY_UPVOTED: {
    icon: faFire,
    title: 'Active User',
    unit: ' upvotes',
    formatValue: integerFormatter,
    describe: (value) => `Received ${value} upvotes from the community.`,
  },
  OPEN_ACCESS: {
    icon: faChartNetwork,
    title: 'Open Access Advocate',
    unit: '',
    // Stored as a 0-1 ratio in the API payload; surface as a percentage.
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

export const getAchievementMeta = (type: AchievementType): AchievementMeta => {
  const meta = ACHIEVEMENT_META[type];
  if (meta) return meta;

  return {
    ...FALLBACK_META,
    title: (type as string)
      .replace(/_/g, ' ')
      .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()),
  };
};

export interface ResolvedAchievement {
  meta: AchievementMeta;
  tier: TierStyle;
  /** Styling for the next tier above the current one, when one exists. */
  nextTier: TierStyle | undefined;
  currentTierName: string;
  nextTierName: string;
  displayValue: string;
  /**
   * The value the progress row compares against on the right of the bar.
   * For in-progress tiers this is the next tier's milestone; for the top
   * tier it's the top tier's own milestone, so the row reads as
   * `value / threshold` (often value > threshold for max tier).
   */
  targetDisplayValue: string;
  isTopTier: boolean;
}

export const resolveAchievement = (achievement: Achievement): ResolvedAchievement => {
  const meta = getAchievementMeta(achievement.type);
  const tier = getTierStyleForIndex(achievement.currentMilestoneIndex);
  const currentTierName = tier.label;
  const hasNextTier = Boolean(achievement.milestones[achievement.currentMilestoneIndex + 1]);
  const nextTier = hasNextTier
    ? getTierStyleForIndex(achievement.currentMilestoneIndex + 1)
    : undefined;
  const nextTierName = nextTier?.label ?? 'Max Tier';

  const isTopTier =
    achievement.currentMilestoneIndex === achievement.milestones.length - 1 ||
    achievement.currentMilestoneIndex >= TIER_INDICES.length - 1;

  const targetRawValue = isTopTier
    ? (achievement.milestones[achievement.currentMilestoneIndex] ?? 0)
    : (achievement.milestones[achievement.currentMilestoneIndex + 1] ?? 0);

  return {
    meta,
    tier,
    nextTier,
    currentTierName,
    nextTierName,
    displayValue: meta.formatValue(achievement.value),
    targetDisplayValue: meta.formatValue(targetRawValue),
    isTopTier,
  };
};

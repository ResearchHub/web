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
  outline: string;
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
    label: 'Tier 1',
    outline: '#93C5FD',
    fill: 'linear-gradient(145deg,#F8FBFF 0%,#DBEAFE 46%,#9CC9FF 100%)',
    facet: 'linear-gradient(145deg,#FFFFFF 0%,#EFF6FF 48%,#CFE3FF 100%)',
    iconColor: '#1D4ED8',
    pillBg: 'bg-primary-50',
    pillText: 'text-primary-700',
    pillBorder: 'border-primary-200',
    barFill: 'bg-gradient-to-r from-primary-200 to-primary-400',
  },
  Tier2: {
    name: 'Tier2',
    label: 'Tier 2',
    outline: '#3971FF',
    fill: 'linear-gradient(145deg,#DBEAFE 0%,#3971FF 58%,#1D4ED8 100%)',
    facet: 'rgba(255, 255, 255, 0.24)',
    iconColor: '#FFFFFF',
    pillBg: 'bg-primary-100',
    pillText: 'text-primary-800',
    pillBorder: 'border-primary-300',
    barFill: 'bg-gradient-to-r from-primary-400 to-primary-700',
  },
  Tier3: {
    name: 'Tier3',
    label: 'Tier 3',
    outline: '#172554',
    fill: 'linear-gradient(145deg,#3971FF 0%,#1E40AF 54%,#0B1B5E 100%)',
    facet: 'rgba(255, 255, 255, 0.2)',
    iconColor: '#FFFFFF',
    pillBg: 'bg-blue-50',
    pillText: 'text-blue-900',
    pillBorder: 'border-blue-200',
    barFill: 'bg-gradient-to-r from-primary-600 to-blue-950',
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
  currentTierName: string;
  nextTierName: string;
  displayValue: string;
  nextTierDisplayValue: string;
  isTopTier: boolean;
}

export const resolveAchievement = (achievement: Achievement): ResolvedAchievement => {
  const meta = getAchievementMeta(achievement.type);
  const tier = getTierStyleForIndex(achievement.currentMilestoneIndex);
  const currentTierName = tier.label;
  const nextTierName = achievement.milestones[achievement.currentMilestoneIndex + 1]
    ? getTierLabelForIndex(achievement.currentMilestoneIndex + 1)
    : 'Max Tier';

  const isTopTier =
    achievement.currentMilestoneIndex === achievement.milestones.length - 1 ||
    achievement.currentMilestoneIndex >= TIER_INDICES.length - 1;

  const nextRawValue = achievement.milestones[achievement.currentMilestoneIndex + 1] ?? 0;

  return {
    meta,
    tier,
    currentTierName,
    nextTierName,
    displayValue: meta.formatValue(achievement.value),
    nextTierDisplayValue: meta.formatValue(nextRawValue),
    isTopTier,
  };
};

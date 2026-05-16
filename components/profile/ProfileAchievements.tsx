'use client';

import { Achievement } from '@/types/authorProfile';
import { Tooltip } from '@/components/ui/Tooltip';
import { resolveAchievement, TierStyle } from './ProfileAchievements.utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cn } from '@/utils/styles';
import { faTrophyStar } from '@fortawesome/pro-light-svg-icons';
import { faSparkles } from '@fortawesome/pro-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

type BadgeSize = 'sm' | 'md' | 'lg';

const BADGE_SIZE: Record<BadgeSize, { box: string; icon: string }> = {
  sm: { box: 'h-8 w-8', icon: 'text-[11px]' },
  md: { box: 'h-10 w-10', icon: 'text-[14px]' },
  lg: { box: 'h-14 w-14', icon: 'text-[20px]' },
};

const CRYSTAL_SHIELD_CLIP = 'polygon(50% 0%, 91% 16%, 84% 70%, 50% 100%, 16% 70%, 9% 16%)';

interface AchievementIconBadgeProps {
  icon: IconDefinition;
  tier: TierStyle;
  size?: BadgeSize;
  className?: string;
}

function AchievementIconBadge({
  icon,
  tier,
  size = 'sm',
  className,
}: Readonly<AchievementIconBadgeProps>) {
  const { box, icon: iconClass } = BADGE_SIZE[size];
  return (
    <span
      className={cn(
        'relative inline-flex items-center justify-center flex-shrink-0',
        box,
        className
      )}
    >
      <span
        className="absolute inset-0 shadow-sm"
        style={{ background: tier.outline, clipPath: CRYSTAL_SHIELD_CLIP }}
      />
      <span
        className="absolute inset-[2px]"
        style={{ background: tier.fill, clipPath: CRYSTAL_SHIELD_CLIP }}
      />
      <span
        className="absolute inset-[5px]"
        style={{ background: tier.facet, clipPath: CRYSTAL_SHIELD_CLIP }}
      />
      <FontAwesomeIcon
        icon={icon}
        className={cn('relative drop-shadow-sm', iconClass)}
        style={{ color: tier.iconColor }}
      />
    </span>
  );
}

interface TierPillProps {
  tier: TierStyle;
  className?: string;
}

function TierPill({ tier, className }: Readonly<TierPillProps>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide leading-none',
        tier.pillBg,
        tier.pillText,
        tier.pillBorder,
        className
      )}
    >
      {tier.label}
    </span>
  );
}

const SKELETON_ROWS = [
  'achievement-skeleton-1',
  'achievement-skeleton-2',
  'achievement-skeleton-3',
  'achievement-skeleton-4',
] as const;

export function AchievementsSkeleton() {
  return (
    <div className="flex flex-col gap-1.5">
      {SKELETON_ROWS.map((rowId) => (
        <div key={rowId} className="flex items-center gap-2.5 py-1.5 px-1.5 rounded-lg w-full">
          <div className="h-8 w-8 rounded-lg bg-gray-200 animate-pulse flex-shrink-0" />
          <div className="flex-1 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-12 bg-gray-200 rounded-full animate-pulse" />
        </div>
      ))}
    </div>
  );
}

interface AchievementTooltipProps {
  achievement: Achievement;
}

function AchievementTooltipContent({ achievement }: Readonly<AchievementTooltipProps>) {
  const {
    meta,
    tier,
    currentTierName,
    nextTierName,
    displayValue,
    nextTierDisplayValue,
    isTopTier,
  } = resolveAchievement(achievement);

  const progressPct = Math.min(100, Math.max(0, achievement.pctProgress * 100));

  return (
    <div className="flex w-72 flex-col gap-3 p-1 text-left">
      <div className="flex items-center gap-2.5">
        <AchievementIconBadge icon={meta.icon} tier={tier} size="md" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-gray-900 truncate">{meta.title}</div>
          <div className="mt-0.5">
            <TierPill tier={tier} />
          </div>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-gray-600">{meta.describe(displayValue)}</p>

      {isTopTier ? (
        <div
          className={cn(
            'inline-flex items-center gap-1.5 self-start rounded-full border px-2 py-1 text-[11px] font-semibold',
            tier.pillBg,
            tier.pillText,
            tier.pillBorder
          )}
        >
          <FontAwesomeIcon icon={faSparkles} className="text-[10px]" />
          {currentTierName} tier achieved
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] text-gray-500">
            <span>
              Next: <span className={cn('font-semibold', tier.pillText)}>{nextTierName}</span>
            </span>
            <span className="font-medium text-gray-700">
              {displayValue} / {nextTierDisplayValue}
              {meta.unit}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={cn('h-full rounded-full transition-all duration-300', tier.barFill)}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface AchievementsProps {
  achievements: Achievement[];
  isLoading: boolean;
}

const Achievements = ({ achievements, isLoading }: AchievementsProps) => {
  if (isLoading) {
    return <AchievementsSkeleton />;
  }

  if (achievements.length === 0) {
    return (
      <div className="flex flex-col items-start sidebar-profile:items-center justify-center gap-3 sidebar-profile:py-6 text-gray-500">
        <div className="hidden sidebar-profile:flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100">
          <FontAwesomeIcon icon={faTrophyStar} className="text-2xl text-primary-500" />
        </div>
        <div className="text-sm text-left sidebar-profile:text-center">
          No achievements unlocked yet.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {achievements.map((achievement) => {
        const { meta, tier } = resolveAchievement(achievement);
        return (
          <Tooltip
            key={`${achievement.type}-${achievement.currentMilestoneIndex}`}
            content={<AchievementTooltipContent achievement={achievement} />}
            position="bottom"
            delay={100}
            width="w-auto"
            wrapperClassName="w-full"
          >
            <div
              className={cn(
                'group flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 w-full cursor-default',
                'transition-colors hover:bg-gray-50 dark:hover:bg-gray-800'
              )}
            >
              <AchievementIconBadge icon={meta.icon} tier={tier} size="sm" />
              <span className="flex-1 min-w-0 truncate text-sm font-medium text-gray-900">
                {meta.title}
              </span>
              <TierPill tier={tier} />
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
};

export default Achievements;

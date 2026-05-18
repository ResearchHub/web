'use client';

import { Achievement } from '@/types/authorProfile';
import { Tooltip } from '@/components/ui/Tooltip';
import { resolveAchievement, ResolvedAchievement, TierStyle } from './ProfileAchievements.utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cn } from '@/utils/styles';
import { faTrophyStar } from '@fortawesome/pro-light-svg-icons';
import { faSparkles } from '@fortawesome/pro-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

type BadgeSize = 'xs' | 'sm' | 'md';

const BADGE_ICON_COLOR = '#FFFFFF';

const BADGE_SIZE: Record<BadgeSize, { box: string; iconText: string; facetInset: string }> = {
  xs: { box: 'h-5 w-5', iconText: 'text-[8px]', facetInset: 'inset-[2px]' },
  sm: { box: 'h-8 w-8', iconText: 'text-[11px]', facetInset: 'inset-[3px]' },
  md: { box: 'h-10 w-10', iconText: 'text-[14px]', facetInset: 'inset-[3px]' },
};

const BADGE_CLIP_PATH = 'polygon(50% 0%, 91% 16%, 84% 70%, 50% 100%, 16% 70%, 9% 16%)';

interface AchievementIconBadgeProps {
  icon: IconDefinition;
  tier: TierStyle;
  size?: BadgeSize;
  className?: string;
}

const AchievementIconBadge = ({
  icon,
  tier,
  size = 'sm',
  className,
}: AchievementIconBadgeProps) => {
  const { box, iconText, facetInset } = BADGE_SIZE[size];
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
        style={{ background: tier.fill, clipPath: BADGE_CLIP_PATH }}
      />
      <span
        className={cn('absolute', facetInset)}
        style={{ background: tier.facet, clipPath: BADGE_CLIP_PATH }}
      />
      <FontAwesomeIcon
        icon={icon}
        className={cn('relative drop-shadow-sm', iconText)}
        style={{ color: BADGE_ICON_COLOR }}
      />
    </span>
  );
};

interface TierPillProps {
  tier: TierStyle;
  className?: string;
}

const TierPill = ({ tier, className }: TierPillProps) => (
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

export const AchievementsSkeleton = () => (
  <div className="flex flex-col gap-1.5">
    {Array.from({ length: 4 }).map((_, skeletonIndex) => (
      <div
        key={'achievement-skeleton-' + skeletonIndex}
        className="flex items-center gap-2.5 py-1.5 px-1.5 rounded-lg w-full"
      >
        <div className="h-8 w-8 rounded-lg bg-gray-200 animate-pulse flex-shrink-0" />
        <div className="flex-1 h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-12 bg-gray-200 rounded-full animate-pulse" />
      </div>
    ))}
  </div>
);

interface AchievementTooltipContentProps {
  resolved: ResolvedAchievement;
}

const AchievementTooltipContent = ({ resolved }: AchievementTooltipContentProps) => {
  const { meta, tier, nextTier, displayValue, targetDisplayValue, progressPct, isTopTier } =
    resolved;

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

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px] text-gray-500">
          {isTopTier ? (
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
              <FontAwesomeIcon icon={faSparkles} className="text-[10px]" />
              Max tier achieved
            </span>
          ) : (
            <span className="inline-flex items-center gap-1">
              Next:
              <AchievementIconBadge icon={meta.icon} tier={nextTier!} size="xs" />
            </span>
          )}
          <span className="font-medium text-gray-700">
            {[displayValue, '/', targetDisplayValue, meta.unit].filter(Boolean).join(' ')}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300',
              isTopTier ? 'bg-gradient-to-r from-emerald-600 to-emerald-300' : tier.barFill
            )}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </div>
  );
};

interface ProfileAchievementsProps {
  achievements: Achievement[];
  isLoading: boolean;
}

const ProfileAchievements = ({ achievements, isLoading }: ProfileAchievementsProps) => {
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
        const resolved = resolveAchievement(achievement);
        return (
          <Tooltip
            key={`${achievement.type}-${achievement.currentMilestoneIndex}`}
            content={<AchievementTooltipContent resolved={resolved} />}
            position="bottom"
            delay={100}
            width="w-auto"
            wrapperClassName="w-full"
          >
            <div className="group flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 w-full cursor-default transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
              <AchievementIconBadge icon={resolved.meta.icon} tier={resolved.tier} size="sm" />
              <span className="flex-1 min-w-0 truncate text-sm font-medium text-gray-900">
                {resolved.meta.title}
              </span>
              <TierPill tier={resolved.tier} />
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
};

export default ProfileAchievements;

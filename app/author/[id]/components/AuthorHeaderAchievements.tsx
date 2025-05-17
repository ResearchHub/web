'use client';

import React, { ReactElement } from 'react';
import { Achievement } from '@/types/authorProfile';
import { Tooltip } from '@/components/ui/Tooltip';
import { getAchievementDetails, TIER_COLORS, TIER_INDICES } from './AuthorAchievements.utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cn } from '@/utils/styles';
import { faTrophyStar } from '@fortawesome/pro-light-svg-icons';

interface AuthorHeaderAchievementsProps {
  achievements: Achievement[];
}

const AuthorHeaderAchievements: React.FC<AuthorHeaderAchievementsProps> = ({ achievements }) => {
  const getTooltipContent = (
    achievement: Achievement,
    achievementDetails: { icon: ReactElement; title: string }
  ) => {
    const filledColor =
      TIER_COLORS[achievement.currentMilestoneIndex + 1] || TIER_COLORS[TIER_COLORS.length - 1];
    const currentTierName = TIER_INDICES[achievement.currentMilestoneIndex] || 'Unknown Tier';
    const nextTierName = TIER_INDICES[achievement.currentMilestoneIndex + 1] || 'Max Tier';
    const isTopTier =
      achievement.currentMilestoneIndex === achievement.milestones.length - 1 ||
      achievement.currentMilestoneIndex >= TIER_INDICES.length - 1;

    let value = achievement.value;
    let displayValue = value.toLocaleString();
    let nextTierValue = achievement.milestones[achievement.currentMilestoneIndex + 1] || 0;
    let nextTierDisplayValue = nextTierValue.toLocaleString();

    let unit = '';
    let descriptionText = '';

    switch (achievement.type) {
      case 'OPEN_SCIENCE_SUPPORTER':
        descriptionText = `Funded open science using ${displayValue} RSC.`;
        unit = ' RSC';
        break;
      case 'EXPERT_PEER_REVIEWER':
        descriptionText = `Peer reviewed ${displayValue} publications.`;
        unit = ' reviews';
        break;
      case 'HIGHLY_UPVOTED':
        descriptionText = `Received ${displayValue} upvotes.`;
        unit = ' upvotes';
        break;
      case 'CITED_AUTHOR':
        descriptionText = `Author's publications Cited ${displayValue} times.`;
        unit = ' citations';
        break;
      case 'OPEN_ACCESS':
        value = Math.round(achievement.value * 100);
        nextTierValue = nextTierValue * 100;
        displayValue = value + '%';
        nextTierDisplayValue = nextTierValue + '%';
        descriptionText = `Published ${displayValue} of works as open access.`;
        break;
      default:
        descriptionText = `Achieved ${displayValue} points.`;
        break;
    }

    return (
      <div className="p-2 text-sm flex flex-col gap-1 w-64 text-left">
        <div className="flex items-center gap-2 font-semibold">
          {React.cloneElement(achievementDetails.icon, {
            style: { ...achievementDetails.icon.props.style, fontSize: '18px' },
          })}
          <span>
            {achievementDetails.title} ({currentTierName})
          </span>
        </div>
        <div className="text-xs font-normal mb-2">{descriptionText}</div>
        {!isTopTier && (
          <>
            <div className="flex justify-between text-xs">
              <span>Next tier:</span>
              <span>
                {displayValue} / {nextTierDisplayValue}
                {unit}
              </span>
            </div>
            <div className="w-full h-5 bg-gray-300 rounded relative text-white text-xs">
              <div
                className="absolute top-0 left-0 h-full flex items-center pl-1 rounded-l"
                style={{ backgroundColor: filledColor, width: `${achievement.pctProgress * 100}%` }}
              >
                {nextTierName}
              </div>
            </div>
          </>
        )}
        {isTopTier && (
          <div className="text-xs font-semibold text-green-600">Max tier achieved!</div>
        )}
      </div>
    );
  };

  if (achievements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6 text-gray-500">
        <FontAwesomeIcon
          icon={faTrophyStar}
          style={{ fontSize: '60px' }}
          className="text-gray-400"
        />
        <div className="text-center">This user has not unlocked any achievements yet.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 py-2">
      {achievements.map((achievement) => {
        const achievementDetails = getAchievementDetails({ achievement });
        return (
          <Tooltip
            key={achievement.type}
            content={getTooltipContent(achievement, achievementDetails)}
            position="bottom"
            delay={100}
            width="w-auto" // Let content define width
            className="bg-gray-800 text-white shadow-xl border-gray-700" // Custom tooltip styling
            wrapperClassName="w-full"
          >
            <div
              className={cn(
                'flex items-center gap-2 p-2 h-10 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-default w-full'
              )}
            >
              {React.cloneElement(achievementDetails.icon, {
                style: { ...achievementDetails.icon.props.style, fontSize: '18px' },
              })}
              <span>{achievementDetails.title}</span>
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
};

export default AuthorHeaderAchievements;

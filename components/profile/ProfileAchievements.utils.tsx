import { Achievement } from '@/types/authorProfile';
import { ReactElement } from 'react';
import { faAward } from '@fortawesome/pro-light-svg-icons';
import { faQuoteRight, faCircleUp, faStar, faLockOpen } from '@fortawesome/pro-solid-svg-icons';
import React from 'react';
import { Icon } from '@/components/ui/icons/Icon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Define Tier colors and names - adjust these to your application's theme
export const TIER_COLORS = [
  '#A97142', // Bronze
  '#A8A8A8', // Silver
  '#FFBF00', // Gold
  '#B9B9D7', // Platinum
  '#65C6E2', // Diamond
];

export const TIER_INDICES = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];

interface AchievementDetails {
  icon: ReactElement;
  title: string;
}

function getTierCircleStyle(tierColor: string, size: number = 14) {
  return {
    background: tierColor,
    borderRadius: '50%',
    padding: 3,
    width: size + 14,
    height: size + 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties;
}

export const getAchievementDetails = ({
  achievement,
}: {
  achievement: Achievement;
}): AchievementDetails => {
  const tierColor = TIER_COLORS[achievement.currentMilestoneIndex] || TIER_COLORS[0];
  const iconSize = 14;

  switch (achievement.type) {
    case 'OPEN_SCIENCE_SUPPORTER':
      return {
        icon: (
          <div style={getTierCircleStyle(tierColor, iconSize)}>
            <Icon name="flaskFrame" size={18} color="white" />
          </div>
        ),
        title: 'Open Science Supporter',
      };
    case 'CITED_AUTHOR':
      return {
        icon: (
          <div style={getTierCircleStyle(tierColor, iconSize)}>
            <FontAwesomeIcon icon={faQuoteRight} style={{ color: 'white', fontSize: iconSize }} />
          </div>
        ),
        title: 'Cited Author',
      };
    case 'EXPERT_PEER_REVIEWER':
      return {
        icon: (
          <div style={getTierCircleStyle(tierColor, iconSize)}>
            <FontAwesomeIcon icon={faStar} style={{ color: 'white', fontSize: iconSize }} />
          </div>
        ),
        title: 'Peer Reviewer',
      };
    case 'HIGHLY_UPVOTED':
      return {
        icon: (
          <div style={getTierCircleStyle(tierColor, iconSize)}>
            <FontAwesomeIcon icon={faCircleUp} style={{ color: 'white', fontSize: iconSize }} />
          </div>
        ),
        title: 'Active User',
      };
    case 'OPEN_ACCESS':
      return {
        icon: (
          <div style={getTierCircleStyle(tierColor, iconSize)}>
            <FontAwesomeIcon icon={faLockOpen} style={{ color: 'white', fontSize: iconSize }} />
          </div>
        ),
        title: 'Open Access Advocate',
      };
    default:
      return {
        icon: (
          <div style={getTierCircleStyle(tierColor, iconSize)}>
            <FontAwesomeIcon icon={faAward} style={{ color: 'white', fontSize: iconSize }} />
          </div>
        ),
        title: (achievement.type as string)
          .replace(/_/g, ' ')
          .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()),
      };
  }
};

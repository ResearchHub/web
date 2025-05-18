import { Achievement } from '@/types/authorProfile';
import { ReactElement } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAward,
  faMedal,
  faLockOpen,
  faQuoteRight,
  faCircleUp,
  faHandsHoldingDollar,
} from '@fortawesome/pro-light-svg-icons';
import React from 'react';

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

export const getAchievementDetails = ({
  achievement,
}: {
  achievement: Achievement;
}): AchievementDetails => {
  const tierColor = TIER_COLORS[achievement.currentMilestoneIndex] || TIER_COLORS[0];

  // Using generic icons for now. Replace with specific icons from your library if available.
  switch (achievement.type) {
    case 'OPEN_SCIENCE_SUPPORTER':
      return {
        icon: (
          <FontAwesomeIcon
            icon={faHandsHoldingDollar}
            style={{ color: tierColor, fontSize: '22px' }}
          />
        ),
        title: 'Open Science Supporter',
      };
    case 'CITED_AUTHOR':
      return {
        icon: (
          <FontAwesomeIcon icon={faQuoteRight} style={{ color: tierColor, fontSize: '22px' }} />
        ),
        title: 'Cited Author',
      };
    case 'EXPERT_PEER_REVIEWER':
      return {
        icon: <FontAwesomeIcon icon={faMedal} style={{ color: tierColor, fontSize: '22px' }} />,
        title: 'Peer Reviewer',
      };
    case 'HIGHLY_UPVOTED':
      return {
        icon: <FontAwesomeIcon icon={faCircleUp} style={{ color: tierColor, fontSize: '22px' }} />,
        title: 'Active User',
      };
    case 'OPEN_ACCESS':
      return {
        icon: <FontAwesomeIcon icon={faLockOpen} style={{ color: tierColor, fontSize: '22px' }} />,
        title: 'Open Access Advocate',
      };
    default:
      return {
        icon: <FontAwesomeIcon icon={faAward} style={{ color: tierColor, fontSize: '22px' }} />,
        title: (achievement.type as string)
          .replace(/_/g, ' ')
          .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()),
      };
  }
};

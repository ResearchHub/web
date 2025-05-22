import { formatTimestamp } from '@/utils/date';
import { ID } from './root';
import { createTransformer, BaseTransformed } from './transformer';
import { User, transformUser } from './user';
import { Hub } from './hub';

export interface Education {
  id: number;
  city: string;
  name: string;
  year: {
    label: string;
    value: string;
  };
  major: string;
  state: string;
  degree?: {
    label: string;
    value: string;
  };
  country: string;
  summary: string;
  is_public: boolean;
}

export interface AuthorProfile {
  id: number;
  fullName: string;
  firstName: string;
  lastName: string;
  profileImage: string;
  headline?: string;
  profileUrl: string;
  user?: User;
  description?: string;
  education?: Education[];
  twitter?: string | null;
  facebook?: string | null;
  linkedin?: string | null;
  googleScholar?: string | null;
  orcidId?: string | null;
  isClaimed: boolean;
  hIndex?: number;
  i10Index?: number;
  userId?: number;
  editorOfHubs?: Hub[];
}

export type TransformedAuthorProfile = AuthorProfile & BaseTransformed;

export const transformAuthorProfile = createTransformer<any, AuthorProfile>((raw) => {
  if (!raw) {
    return {
      id: 0,
      fullName: 'Unknown Author',
      firstName: '',
      lastName: '',
      profileImage: '',
      headline: '',
      profileUrl: '/profile/0',
      isClaimed: false,
    };
  }

  // Determine if the profile is claimed based on:
  // If a 'user' property exists and is not null
  const isClaimed = !!raw.user && raw.user !== null;

  const editorOfHubs = raw.editor_of?.map((group: any) => {
    return {
      id: group?.source?.id,
      name: group?.source?.name,
      slug: group?.source?.slug,
    };
  });

  return {
    id: raw.id || 0,
    fullName:
      raw.first_name || raw.last_name
        ? `${raw.first_name || ''} ${raw.last_name || ''}`.trim()
        : 'Unknown Author',
    firstName: raw.first_name || '',
    lastName: raw.last_name || '',
    profileImage: raw.profile_image || '',
    headline: typeof raw.headline === 'string' ? raw.headline : raw.headline?.title || '',
    profileUrl: `/profile/${raw.id || 0}`,
    user: raw.user ? transformUser(raw.user) : undefined,
    description: raw.description || undefined,
    education: raw.education || undefined,
    twitter: raw.twitter || undefined,
    facebook: raw.facebook || undefined,
    linkedin: raw.linkedin || undefined,
    googleScholar: raw.google_scholar || undefined,
    orcidId: raw.orcid_id || undefined,
    isClaimed: isClaimed,
    hIndex: raw.h_index || undefined,
    i10Index: raw.i10_index || undefined,
    userId: raw.user_id || undefined,
    editorOfHubs: editorOfHubs,
  };
});

export type AchievementType =
  | 'CITED_AUTHOR'
  | 'OPEN_ACCESS'
  | 'OPEN_SCIENCE_SUPPORTER'
  | 'EXPERT_PEER_REVIEWER'
  | 'HIGHLY_UPVOTED';

export type Achievement = {
  type: AchievementType;
  value: number;
  currentMilestoneIndex: number;
  milestones: Array<number>;
  pctProgress: number;
};

export const transformAuthorAchievements = (raw: any): Achievement[] => {
  const achievements: Achievement[] = [];

  for (const key in raw.achievements) {
    const rawAchievement = raw.achievements[key as AchievementType];
    const hasAchievementUnlocked = rawAchievement.value >= rawAchievement.milestones[0];

    if (hasAchievementUnlocked) {
      const achievement: Achievement = {
        type: key as AchievementType,
        value: rawAchievement.value,
        milestones: rawAchievement.milestones,
        currentMilestoneIndex: 0,
        pctProgress: 0,
      };

      // Find current milestone user is in
      for (let i = 0; i < rawAchievement.milestones.length; i++) {
        if (achievement.value >= rawAchievement.milestones[i]) {
          achievement.currentMilestoneIndex = i;
        }
      }

      // Calculate progress percentage
      achievement.pctProgress =
        achievement.value /
        (achievement.milestones[achievement.currentMilestoneIndex + 1] ||
          achievement.milestones[achievement.currentMilestoneIndex]);

      achievements.push(achievement);
    }
  }

  // Sort achievements by highest tier first, then by percentage progress
  return achievements.sort((a, b) => {
    if (b.currentMilestoneIndex !== a.currentMilestoneIndex) {
      return b.currentMilestoneIndex - a.currentMilestoneIndex;
    }
    return b.pctProgress - a.pctProgress;
  });
};

export interface AuthorSummaryStats {
  openAccessPct: number;
  worksCount: number;
  citationCount: number;
  twoYearMeanCitedness: number;
  peerReviewCount: number;
  upvotesReceived: number;
  amountFunded: number;
}

export const transformAuthorSummaryStats = createTransformer<any, AuthorSummaryStats>((raw) => {
  if (!raw?.summary_stats) {
    return {
      worksCount: 0,
      citationCount: 0,
      twoYearMeanCitedness: 0,
      upvotesReceived: 0,
      amountFunded: 0,
      openAccessPct: 0,
      peerReviewCount: 0,
    };
  }

  return {
    worksCount: raw.summary_stats.works_count || 0,
    citationCount: raw.summary_stats.citation_count || 0,
    twoYearMeanCitedness: raw.summary_stats.two_year_mean_citedness || 0,
    upvotesReceived: raw.summary_stats.upvote_count || 0,
    amountFunded: raw.summary_stats.amount_funded || 0,
    openAccessPct: Math.round((raw.summary_stats.open_access_pct || 0) * 100),
    peerReviewCount: raw.summary_stats.peer_review_count || 0,
  };
});

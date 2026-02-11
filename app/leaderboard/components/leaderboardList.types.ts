import type { AuthorProfile } from '@/types/authorProfile';

export interface LeaderboardListItemBase {
  id: number;
  authorProfile: AuthorProfile;
  isVerified: boolean;
  amount: number;
}

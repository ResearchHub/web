import { ApiClient } from './client';
import {
  User,
  UserDetailsForModerator,
  RiskScoreEventsResponse,
  transformUser,
  transformUserDetailsForModerator,
  transformRiskScoreEvent,
} from '@/types/user';

interface University {
  id: number;
  name: string;
  country?: string;
  state?: string;
  city?: string;
  [key: string]: any; // Allow other properties
}

interface UniversityApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: University[];
}

/**
 * Per-balance-lot staking detail. Each lot tracks a chunk of stake with its own age
 * and multiplier progression (the longer it's been staked, the higher the multiplier).
 */
export interface StakingBalanceLot {
  amount: number;
  createdDate: string;
  effectiveStartDate: string;
  ageDays: number;
  currentMultiplier: number;
  nextMultiplier: number | null;
  daysUntilNextMultiplier: number | null;
  nextMultiplierDate: string | null;
  projectedOverallMultiplier: number | null;
}

export interface StakingYieldDetails {
  isStakingOptedIn: boolean;
  stakingOptedInDate: string | null;
  currentStake: number;
  currentMultiplier: number;
  currentWeightedStake: number;
  totalYieldEarned: number;
  latestAccrualDate: string | null;
  apy: number;
  balanceLots: StakingBalanceLot[];
}

function transformStakingBalanceLot(raw: any): StakingBalanceLot {
  return {
    amount: parseFloat(raw.amount),
    createdDate: raw.created_date,
    effectiveStartDate: raw.effective_start_date,
    ageDays: raw.age_days,
    currentMultiplier: parseFloat(raw.current_multiplier),
    nextMultiplier: raw.next_multiplier == null ? null : parseFloat(raw.next_multiplier),
    daysUntilNextMultiplier: raw.days_until_next_multiplier,
    nextMultiplierDate: raw.next_multiplier_date,
    projectedOverallMultiplier:
      raw.projected_overall_multiplier == null
        ? null
        : parseFloat(raw.projected_overall_multiplier),
  };
}

function transformStakingYieldDetails(raw: any): StakingYieldDetails {
  return {
    isStakingOptedIn: raw.is_staking_opted_in,
    stakingOptedInDate: raw.staking_opted_in_date,
    currentStake: parseFloat(raw.current_stake),
    currentMultiplier: parseFloat(raw.current_multiplier),
    currentWeightedStake: parseFloat(raw.current_weighted_stake),
    totalYieldEarned: parseFloat(raw.total_yield_earned),
    latestAccrualDate: raw.latest_accrual_date,
    apy: raw.apy,
    balanceLots: (raw.balance_lots ?? []).map(transformStakingBalanceLot),
  };
}

export class UserService {
  /**
   * Get author profile information using the profile ID
   * This is an alternative if the author ID doesn't work
   */
  static async getAuthorProfileInfo(profileId: number): Promise<User> {
    try {
      const response = await ApiClient.get(`/api/author_profile/${profileId}/`);
      const userData = transformUser({ author_profile: response });

      return userData;
    } catch (error) {
      console.error(`Error fetching author profile for ID ${profileId}:`, error);
      throw error;
    }
  }

  /**
   * Search for universities by name
   * @param search The search query for university name
   * @returns Array of universities matching the search
   */
  static async searchUniversities(search: string): Promise<University[]> {
    try {
      // Use the same URL format as in the old app
      const url = `/api/university/${search ? `?search=${encodeURIComponent(search)}` : ''}`;
      const response = await ApiClient.get<UniversityApiResponse>(url);

      // Extract the results from the paginated response
      return response.results || [];
    } catch (error) {
      console.error('Error searching universities:', error);
      return [];
    }
  }

  /**
   * Fetch detailed user information for moderation purposes
   * @param userId The ID of the user to fetch details for
   * @returns User details for moderation
   */
  static async fetchUserDetails(userId: string): Promise<UserDetailsForModerator> {
    try {
      const response = await ApiClient.get<UserDetailsForModerator>(
        `/api/moderator/${userId}/user_details`
      );
      return transformUserDetailsForModerator(response);
    } catch (error) {
      console.error(`Error fetching user details for ID ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Update the user's RSC staking opt-in preference
   */
  static async updateStakingOptIn(isOptedIn: boolean): Promise<User> {
    const response = await ApiClient.patch<any>(`/api/user/set_staking_opted_in/`, {
      is_staking_opted_in: isOptedIn,
    });
    return transformUser(response);
  }

  /**
   * Get staking yield details for the current user (APY, current stake, total yield earned, balance lots, etc).
   */
  static async getStakingYieldDetails(): Promise<StakingYieldDetails> {
    const response = await ApiClient.get<any>(`/api/staking_yield/details/`);
    return transformStakingYieldDetails(response);
  }

  /**
   * Notify the backend that the user has clicked the RSC icon,
   * resetting the balance_history delta to 0.
   */
  static async updateBalanceHistoryClicked(): Promise<void> {
    await ApiClient.post<void>(`/api/user/update_balance_history_clicked/`);
  }

  static async fetchRiskScoreEvents(
    userId: string,
    params?: {
      page?: number;
      pageSize?: number;
      eventType?: string;
      deltaPositive?: boolean;
      createdDateAfter?: string;
      createdDateBefore?: string;
    }
  ): Promise<RiskScoreEventsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.pageSize) searchParams.set('page_size', params.pageSize.toString());
    if (params?.eventType) searchParams.set('event_type', params.eventType);
    if (params?.deltaPositive !== undefined)
      searchParams.set('delta_positive', String(params.deltaPositive));
    if (params?.createdDateAfter) searchParams.set('created_date_after', params.createdDateAfter);
    if (params?.createdDateBefore)
      searchParams.set('created_date_before', params.createdDateBefore);

    const query = searchParams.toString();
    const url = `/api/moderator/${userId}/risk_score_events/${query ? `?${query}` : ''}`;
    const response = await ApiClient.get<any>(url);

    return {
      count: response.count ?? 0,
      next: response.next ?? null,
      previous: response.previous ?? null,
      results: (response.results ?? []).map(transformRiskScoreEvent),
    };
  }

  /**
   * Check user permissions using the gatekeeper system
   * @param application The application name to check permissions for
   * @returns Boolean indicating if the user has access to the application
   */
  static async gatekeeper(application: string): Promise<boolean> {
    try {
      const response = await ApiClient.get(
        `/api/gatekeeper/check_current_user/?type=${application}`
      );
      return Boolean(response);
    } catch (error) {
      console.error(`Error checking gatekeeper permissions for ${application}:`, error);
      return false;
    }
  }
}

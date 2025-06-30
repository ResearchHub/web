import { createTransformer } from './transformer';

// Request/Response types for user moderation API
export interface SuspendUserParams {
  authorId: string;
}

export interface ReinstateUserParams {
  author_id: string; // API expects snake_case
}

export interface SuspendUserResponse {
  message: string;
}

// Raw API response (snake_case from Django backend)
export interface ReinstateUserApiResponse {
  id: number;
  is_active: boolean;
  is_suspended: boolean;
  probable_spammer: boolean;
  suspended_updated_date?: string;
  // Add other relevant user fields as needed
}

// Transformed client model (camelCase)
export interface ReinstateUserResponse {
  id: number;
  isActive: boolean;
  isSuspended: boolean;
  probableSpammer: boolean;
  suspendedUpdatedDate?: Date;
  // Add other relevant user fields as needed
}

// Transformer function
export const transformReinstateUserResponse = createTransformer<
  ReinstateUserApiResponse,
  ReinstateUserResponse
>((raw) => ({
  id: raw.id,
  isActive: raw.is_active,
  isSuspended: raw.is_suspended,
  probableSpammer: raw.probable_spammer,
  suspendedUpdatedDate: raw.suspended_updated_date
    ? new Date(raw.suspended_updated_date)
    : undefined,
}));

// Hook state types
export interface UserModerationState {
  isLoading: boolean;
  error: string | null;
  lastAction: 'suspend' | 'reinstate' | null;
}

// Hook action types
export type SuspendUserAction = (authorId: string) => Promise<void>;
export type ReinstateUserAction = (authorId: string) => Promise<void>;

export type UserModerationActions = {
  suspendUser: SuspendUserAction;
  reinstateUser: ReinstateUserAction;
};

export type UseUserModerationReturn = [UserModerationState, UserModerationActions];

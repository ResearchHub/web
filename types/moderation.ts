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

// New: Mark user as probable spammer
export interface MarkProbableSpammerParams {
  authorId: string;
  reason?: string;
  reasonMemo?: string;
}

export interface MarkProbableSpammerResponse {
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
  lastAction: 'suspend' | 'reinstate' | 'flag' | null;
}

// Hook action types
export type SuspendUserAction = (authorId: string) => Promise<void>;
export type ReinstateUserAction = (authorId: string) => Promise<void>;
export type MarkProbableSpammerAction = (
  authorId: string,
  reason?: string,
  reasonMemo?: string
) => Promise<void>;

export type UserModerationActions = {
  suspendUser: SuspendUserAction;
  reinstateUser: ReinstateUserAction;
  markProbableSpammer: MarkProbableSpammerAction;
};

export type UseUserModerationReturn = [UserModerationState, UserModerationActions];

// Flag History types

// Raw API response for flag creator (snake_case from Django backend)
export interface ApiFlagCreator {
  id: number;
  first_name: string;
  last_name: string;
}

// Raw API response for a single flag (snake_case from Django backend)
export interface ApiUserFlag {
  id: number;
  reason: string;
  reason_choice: string;
  reason_memo: string;
  created_date: string;
  created_by: ApiFlagCreator;
}

// Raw API response for flag history endpoint
export interface ApiFlagHistoryResponse {
  count: number;
  flags: ApiUserFlag[];
}

// Transformed client model for flag creator (camelCase)
export interface FlagCreator {
  id: number;
  firstName: string;
  lastName: string;
}

// Transformed client model for a single flag (camelCase)
export interface UserFlag {
  id: number;
  reason: string;
  reasonChoice: string;
  reasonMemo: string;
  createdDate: Date;
  createdBy: FlagCreator;
}

// Transformed client model for flag history response
export interface FlagHistoryResponse {
  count: number;
  flags: UserFlag[];
}

// Transformer for flag creator
export const transformFlagCreator = (raw: ApiFlagCreator): FlagCreator => ({
  id: raw.id,
  firstName: raw.first_name,
  lastName: raw.last_name,
});

// Transformer for a single flag
export const transformUserFlag = createTransformer<ApiUserFlag, UserFlag>((raw) => ({
  id: raw.id,
  reason: raw.reason,
  reasonChoice: raw.reason_choice,
  reasonMemo: raw.reason_memo,
  createdDate: new Date(raw.created_date),
  createdBy: transformFlagCreator(raw.created_by),
}));

// Transformer for flag history response
export const transformFlagHistoryResponse = (raw: ApiFlagHistoryResponse): FlagHistoryResponse => ({
  count: raw.count,
  flags: raw.flags.map(transformUserFlag),
});

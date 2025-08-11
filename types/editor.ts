import { AuthorProfile, transformAuthorProfile } from './authorProfile';
import { Hub } from './hub';
import { createTransformer } from './transformer';

// Editor Dashboard Types
export interface EditorFilters {
  selectedHub: Hub | null;
  timeframe: {
    startDate: Date;
    endDate: Date;
  };
  orderBy: OrderByOption;
}

export interface OrderByOption {
  value: 'asc' | 'desc';
  label: string;
}

export interface ActiveContributorsData {
  current_active_contributors: Record<number, number>;
  previous_active_contributors: Record<number, number>;
}

// Transformed editor data
export interface TransformedEditorData {
  id: number;
  authorProfile: AuthorProfile;
  commentCount: number;
  submissionCount: number;
  supportCount: number;
  latestCommentDate?: Date;
  latestSubmissionDate?: Date;
  editorAddedDate?: Date;
  activeHubContributorCount?: number;
  previousActiveHubContributorCount?: number;
}

// Pagination result structure (matching referral pattern)
export interface TransformedEditorsResult {
  editors: TransformedEditorData[];
  count: number;
  pageSize: number;
}

// Transformer for editor data
export const transformEditorData = createTransformer<any, TransformedEditorData>((raw) => ({
  id: raw.id,
  authorProfile: transformAuthorProfile(raw.author_profile),
  commentCount: raw.comment_count,
  submissionCount: raw.submission_count,
  supportCount: raw.support_count,
  latestCommentDate: raw.latest_comment_date ? new Date(raw.latest_comment_date) : undefined,
  latestSubmissionDate: raw.latest_submission_date
    ? new Date(raw.latest_submission_date)
    : undefined,
  editorAddedDate: raw.author_profile.added_as_editor_date
    ? new Date(raw.author_profile.added_as_editor_date)
    : undefined,
}));

// Base transformer for pagination result
const baseTransformEditorsResult = (raw: any, pageSize: number): TransformedEditorsResult => {
  if (!raw) {
    return {
      editors: [],
      count: 0,
      pageSize,
    };
  }

  const editors = (raw.result || [])
    .map((editor: any) => {
      try {
        return transformEditorData(editor);
      } catch (error) {
        console.error('Error transforming editor data:', error, editor);
        return null;
      }
    })
    .filter((editor: any): editor is TransformedEditorData => !!editor);

  return {
    editors,
    count: raw.count || 0,
    pageSize,
  };
};

// Pagination transformer (matching referral pattern)
export const transformEditorsPaginated = (pageSize: number) =>
  createTransformer<any, TransformedEditorsResult>((raw) =>
    baseTransformEditorsResult(raw, pageSize)
  );
